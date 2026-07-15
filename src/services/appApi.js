// Façade applicative : expose les entités métier, l'authentification et des
// opérations de haut niveau (soumission d'évaluation, requêtes par rôle).
// Fonctionne en mode Supabase ou en mode démo local (mock) de façon transparente.

import { normalizeEmail } from '@/lib/auth-utils';
import { isSupabaseConfigured } from '@/supabase';
import * as authService from '@/services/auth';
import {
  dbList,
  dbGet,
  dbFindOne,
  dbInsert,
  dbUpdate,
  dbUpsert,
  dbRemove,
} from '@/services/database';

const GUEST_EMAIL_KEY = 'psychoscan_guest_email';

export function getGuestEmail() {
  let email = localStorage.getItem(GUEST_EMAIL_KEY);
  if (!email) {
    email = `guest_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}@local`;
    localStorage.setItem(GUEST_EMAIL_KEY, email);
  }
  return email;
}

// Fabrique d'entité CRUD générique.
function makeEntity(table) {
  return {
    list: (sort, limit) => dbList(table, { sort, limit }),
    filter: (filter, sort, limit) => dbList(table, { filter, sort, limit }),
    get: (id) => dbGet(table, id),
    findOne: (filter) => dbFindOne(table, filter),
    create: (row) => dbInsert(table, row),
    update: (id, patch) => dbUpdate(table, id, patch),
    upsert: (row, key) => dbUpsert(table, row, key),
    remove: (id) => dbRemove(table, id),
  };
}

const entities = {
  Department: makeEntity('departments'),
  Employee: makeEntity('profiles'),
  Questionnaire: makeEntity('questionnaires'),
  Question: makeEntity('questions'),
  QuestionCategory: makeEntity('question_categories'),
  PsychProfile: makeEntity('psychological_profiles'),
  Assignment: makeEntity('assessment_assignments'),
  Result: makeEntity('assessment_results'),
  Recommendation: makeEntity('recommendations'),
  TrainingPlan: makeEntity('training_plans'),
  TrainingCatalog: makeEntity('training_catalog'),
  Setting: makeEntity('settings'),
  AuditLog: makeEntity('audit_logs'),
};

async function writeAudit(actorId, action, entity, entityId, details) {
  try {
    await dbInsert('audit_logs', {
      actor_id: actorId ?? null,
      action,
      entity,
      entity_id: entityId ?? null,
      details: details ?? '',
    });
  } catch {
    /* audit best-effort */
  }
}

export const appApi = {
  isMock: !isSupabaseConfigured,

  auth: {
    async register({ full_name, email, password }) {
      const normalized = normalizeEmail(email);
      const data = await authService.signUp(normalized, password, { full_name });
      const user = data?.user;
      // Le profil est créé côté serveur par le trigger `handle_new_user`
      // (SECURITY DEFINER), ce qui fonctionne que la confirmation d'email soit
      // activée ou non. En complément, si une session existe déjà (confirmation
      // désactivée), on tente un upsert best-effort pour auto-réparer un projet
      // où le trigger n'aurait pas encore été installé. Jamais bloquant : le
      // trigger reste la source de vérité et une erreur RLS ne casse pas le flux.
      if (isSupabaseConfigured && user?.id && data?.session) {
        try {
          await dbUpsert(
            'profiles',
            {
              id: user.id,
              email: user.email ?? normalized,
              full_name: (full_name || '').trim(),
            },
            'id'
          );
        } catch {
          /* profil déjà créé par le trigger : rien à faire */
        }
      }
      return authService.getCurrentUser();
    },

    async signIn({ email, password }) {
      await authService.login(normalizeEmail(email), password);
      return authService.getCurrentUser();
    },

    async requestPasswordReset(email) {
      await authService.requestPasswordReset(normalizeEmail(email));
      return { ok: true };
    },

    async me() {
      const user = await authService.getCurrentUser();
      if (!user) {
        const err = new Error('Non authentifié');
        err.status = 401;
        throw err;
      }
      return user;
    },

    logout(redirectHref) {
      Promise.resolve(authService.logout()).finally(() => {
        if (redirectHref) window.location.assign(redirectHref);
      });
    },

    redirectToLogin(returnUrl) {
      const url = new URL('/login', window.location.origin);
      if (returnUrl) url.searchParams.set('return', returnUrl);
      window.location.assign(url.toString());
    },
  },

  entities,

  // --- Opérations de haut niveau ----------------------------------------

  // Employés supervisés par un manager (subordonnés directs).
  async listSubordinates(managerId) {
    return dbList('profiles', { filter: { manager_id: managerId }, sort: 'full_name' });
  },

  // Employés d'un département.
  async listDepartmentMembers(departmentId) {
    return dbList('profiles', { filter: { department_id: departmentId }, sort: 'full_name' });
  },

  async listResultsForEmployee(employeeId, limit = 50) {
    return dbList('assessment_results', {
      filter: { employee_id: employeeId },
      sort: '-created_at',
      limit,
    });
  },

  async listResultsForDepartment(departmentId, limit = 500) {
    return dbList('assessment_results', {
      filter: { department_id: departmentId },
      sort: '-created_at',
      limit,
    });
  },

  async listAssignmentsForEmployee(employeeId) {
    return dbList('assessment_assignments', {
      filter: { employee_id: employeeId },
      sort: '-assigned_at',
    });
  },

  async latestResultForEmployee(employeeId) {
    const rows = await this.listResultsForEmployee(employeeId, 1);
    return rows[0] ?? null;
  },

  // Soumission d'une évaluation : crée le résultat, met à jour l'affectation,
  // génère les recommandations et journalise l'action.
  async submitAssessment({
    employee,
    assignmentId,
    questionnaireId,
    departmentId,
    scores,
    profile,
    insights,
    answers,
    completionTimeSeconds,
    departmentFit,
  }) {
    const result = await dbInsert('assessment_results', {
      employee_id: employee?.id ?? null,
      assignment_id: assignmentId ?? null,
      questionnaire_id: questionnaireId,
      department_id: departmentId ?? employee?.department_id ?? null,
      scores,
      profile_code: profile?.code ?? null,
      profile_name: profile?.name ?? null,
      answers: answers ?? [],
      completion_time_seconds: completionTimeSeconds ?? null,
      department_fit: departmentFit ?? null,
    });

    if (assignmentId) {
      await dbUpdate('assessment_assignments', assignmentId, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        result_id: result.id,
      });
    }

    // Génération des recommandations de formation à partir des axes faibles.
    if (employee?.id && insights?.trainingSuggestions?.length) {
      for (const training of insights.trainingSuggestions.slice(0, 3)) {
        await dbInsert('recommendations', {
          employee_id: employee.id,
          result_id: result.id,
          type: 'training',
          title: training.title,
          description: training.description,
          priority: 'medium',
        });
      }
    }

    await writeAudit(employee?.id, 'submit', 'assessment_result', result.id, 'Évaluation soumise');
    return result;
  },

  // Affecte un questionnaire à un employé.
  async assignQuestionnaire({ employeeId, questionnaireId, assignedBy, dueDate }) {
    const assignment = await dbInsert('assessment_assignments', {
      employee_id: employeeId,
      questionnaire_id: questionnaireId,
      status: 'assigned',
      assigned_by: assignedBy ?? null,
      assigned_at: new Date().toISOString(),
      due_date: dueDate ?? null,
      completed_at: null,
      result_id: null,
    });
    await writeAudit(assignedBy, 'create', 'assessment_assignment', assignment.id, 'Affectation créée');
    return assignment;
  },

  audit: writeAudit,
};
