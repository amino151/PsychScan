// Données de démonstration (seed) pour le mode local sans backend Supabase.
// Fournit des comptes de démo pour chaque rôle et un jeu de données réaliste
// (employés, affectations, résultats, recommandations, formations, audit).

import { SKILL_KEYS } from '@/config/skills';
import { DEPARTMENTS } from '@/config/departments';
import { QUESTIONNAIRES, QUESTIONS_BY_QUESTIONNAIRE } from '@/lib/questionData';
import { profileCatalog } from '@/config/profiles';
import { TRAINING_CATALOG } from '@/config/trainings';

// Mot de passe commun à tous les comptes de démonstration.
export const DEMO_PASSWORD = 'demo1234';

function scores(overrides = {}, base = 55) {
  return SKILL_KEYS.reduce(
    (acc, key) => ({ ...acc, [key]: overrides[key] ?? base }),
    {}
  );
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

// --- Utilisateurs / profils ---------------------------------------------
export const seedProfiles = [
  {
    id: 'u_super',
    email: 'admin@psychoscan.io',
    full_name: 'Sofia Bennani',
    role: 'super_admin',
    department_id: null,
    manager_id: null,
    position: 'Directrice des opérations',
    hire_date: '2020-01-15',
    avatar_color: '#1D4ED8',
    created_at: daysAgo(400),
  },
  {
    id: 'u_hr',
    email: 'rh@psychoscan.io',
    full_name: 'Karim Haddad',
    role: 'hr_admin',
    department_id: 'dept_human_resources',
    manager_id: 'u_super',
    position: 'Responsable RH',
    hire_date: '2020-06-01',
    avatar_color: '#7C3AED',
    created_at: daysAgo(360),
  },
  {
    id: 'u_mgr_cs',
    email: 'manager@psychoscan.io',
    full_name: 'Nadia El Amrani',
    role: 'manager',
    department_id: 'dept_customer_service',
    manager_id: 'u_super',
    position: 'Manager Service Client',
    hire_date: '2021-02-10',
    avatar_color: '#0EA5E9',
    created_at: daysAgo(320),
  },
  {
    id: 'u_mgr_sales',
    email: 'manager.ventes@psychoscan.io',
    full_name: 'Youssef Tazi',
    role: 'manager',
    department_id: 'dept_sales',
    manager_id: 'u_super',
    position: 'Manager Ventes',
    hire_date: '2021-03-05',
    avatar_color: '#F97316',
    created_at: daysAgo(315),
  },
  {
    id: 'u_mgr_tech',
    email: 'manager.support@psychoscan.io',
    full_name: 'Leïla Fassi',
    role: 'manager',
    department_id: 'dept_technical_support',
    manager_id: 'u_super',
    position: 'Manager Support Technique',
    hire_date: '2021-04-20',
    avatar_color: '#6366F1',
    created_at: daysAgo(310),
  },
  // Employé de démonstration (compte de connexion)
  {
    id: 'e_cs1',
    email: 'agent@psychoscan.io',
    full_name: 'Amine Rahmouni',
    role: 'employee',
    department_id: 'dept_customer_service',
    manager_id: 'u_mgr_cs',
    position: 'Conseiller clientèle',
    hire_date: '2022-09-01',
    avatar_color: '#0284C7',
    created_at: daysAgo(200),
  },
  {
    id: 'e_cs2',
    email: 'sara.cs@psychoscan.io',
    full_name: 'Sara Idrissi',
    role: 'employee',
    department_id: 'dept_customer_service',
    manager_id: 'u_mgr_cs',
    position: 'Conseillère clientèle',
    hire_date: '2023-01-12',
    avatar_color: '#38BDF8',
    created_at: daysAgo(160),
  },
  {
    id: 'e_cs3',
    email: 'omar.cs@psychoscan.io',
    full_name: 'Omar Benali',
    role: 'employee',
    department_id: 'dept_customer_service',
    manager_id: 'u_mgr_cs',
    position: 'Conseiller clientèle',
    hire_date: '2023-05-03',
    avatar_color: '#0891B2',
    created_at: daysAgo(120),
  },
  {
    id: 'e_sa1',
    email: 'ines.ventes@psychoscan.io',
    full_name: 'Inès Cherkaoui',
    role: 'employee',
    department_id: 'dept_sales',
    manager_id: 'u_mgr_sales',
    position: 'Commerciale sédentaire',
    hire_date: '2022-11-15',
    avatar_color: '#EA580C',
    created_at: daysAgo(180),
  },
  {
    id: 'e_sa2',
    email: 'hamza.ventes@psychoscan.io',
    full_name: 'Hamza Alaoui',
    role: 'employee',
    department_id: 'dept_sales',
    manager_id: 'u_mgr_sales',
    position: 'Commercial sédentaire',
    hire_date: '2023-02-27',
    avatar_color: '#FB923C',
    created_at: daysAgo(140),
  },
  {
    id: 'e_ts1',
    email: 'yasmine.support@psychoscan.io',
    full_name: 'Yasmine Berrada',
    role: 'employee',
    department_id: 'dept_technical_support',
    manager_id: 'u_mgr_tech',
    position: 'Technicienne support',
    hire_date: '2022-10-10',
    avatar_color: '#4F46E5',
    created_at: daysAgo(190),
  },
  {
    id: 'e_ts2',
    email: 'walid.support@psychoscan.io',
    full_name: 'Walid Naciri',
    role: 'employee',
    department_id: 'dept_technical_support',
    manager_id: 'u_mgr_tech',
    position: 'Technicien support',
    hire_date: '2023-03-18',
    avatar_color: '#818CF8',
    created_at: daysAgo(130),
  },
  {
    id: 'e_hr1',
    email: 'meryem.rh@psychoscan.io',
    full_name: 'Meryem Sabri',
    role: 'employee',
    department_id: 'dept_human_resources',
    manager_id: 'u_hr',
    position: 'Chargée de recrutement',
    hire_date: '2023-04-01',
    avatar_color: '#0F766E',
    created_at: daysAgo(110),
  },
];

// Comptes de connexion démo (email -> mot de passe).
export const DEMO_ACCOUNTS = [
  { email: 'admin@psychoscan.io', role: 'super_admin', label: 'Super Admin' },
  { email: 'rh@psychoscan.io', role: 'hr_admin', label: 'Admin RH' },
  { email: 'manager@psychoscan.io', role: 'manager', label: 'Manager (Service Client)' },
  { email: 'agent@psychoscan.io', role: 'employee', label: 'Employé (Service Client)' },
];

// --- Départements --------------------------------------------------------
export const seedDepartments = DEPARTMENTS.map((d) => ({
  id: d.id,
  code: d.code,
  name: d.name,
  description: d.description,
  color: d.color,
  questionnaire_id: d.questionnaire_id,
  key_skills: d.key_skills,
}));

// --- Catégories de questions (basées sur les compétences) ----------------
export const seedQuestionCategories = SKILL_KEYS.map((key, i) => ({
  id: `cat_${key}`,
  code: key,
  name: key,
  order: i + 1,
}));

// --- Questionnaires ------------------------------------------------------
export const seedQuestionnaires = QUESTIONNAIRES.map((q) => ({
  ...q,
  is_active: true,
  created_at: daysAgo(300),
}));

// --- Questions -----------------------------------------------------------
export const seedQuestions = Object.values(QUESTIONS_BY_QUESTIONNAIRE)
  .flat()
  .map((q) => ({
    id: q.id,
    questionnaire_id: q.questionnaire_id,
    category: q.category,
    type: q.type,
    text: q.text,
    options: q.options,
    order: q.order,
    is_active: q.is_active,
  }));

// --- Profils psychologiques (table CRUD) ---------------------------------
export const seedPsychProfiles = profileCatalog.map((p) => ({ ...p }));

// --- Résultats d'évaluation ---------------------------------------------
export const seedResults = [
  {
    id: 'res_cs1',
    employee_id: 'e_cs1',
    assignment_id: 'assign_cs1',
    questionnaire_id: 'quest_customer_service',
    department_id: 'dept_customer_service',
    scores: scores({ customer_orientation: 82, communication: 78, emotional_intelligence: 74, stress_management: 68, teamwork: 66, adaptability: 60 }),
    profile_code: 'customer_champion',
    profile_name: 'Champion de la relation client',
    answers: [],
    completion_time_seconds: 240,
    department_fit: 79,
    created_at: daysAgo(30),
  },
  {
    id: 'res_cs1_old',
    employee_id: 'e_cs1',
    assignment_id: 'assign_cs1_old',
    questionnaire_id: 'quest_customer_service',
    department_id: 'dept_customer_service',
    scores: scores({ customer_orientation: 70, communication: 66, emotional_intelligence: 62, stress_management: 55 }),
    profile_code: 'customer_champion',
    profile_name: 'Champion de la relation client',
    answers: [],
    completion_time_seconds: 300,
    department_fit: 66,
    created_at: daysAgo(120),
  },
  {
    id: 'res_cs2',
    employee_id: 'e_cs2',
    assignment_id: 'assign_cs2',
    questionnaire_id: 'quest_customer_service',
    department_id: 'dept_customer_service',
    scores: scores({ customer_orientation: 64, communication: 60, emotional_intelligence: 72, stress_management: 48, adaptability: 70 }),
    profile_code: 'empathetic_advisor',
    profile_name: 'Conseiller empathique',
    answers: [],
    completion_time_seconds: 260,
    department_fit: 63,
    created_at: daysAgo(25),
  },
  {
    id: 'res_sa1',
    employee_id: 'e_sa1',
    assignment_id: 'assign_sa1',
    questionnaire_id: 'quest_sales',
    department_id: 'dept_sales',
    scores: scores({ communication: 84, customer_orientation: 80, leadership: 72, stress_management: 66, adaptability: 64 }),
    profile_code: 'sales_closer',
    profile_name: 'Négociateur commercial',
    answers: [],
    completion_time_seconds: 210,
    department_fit: 81,
    created_at: daysAgo(20),
  },
  {
    id: 'res_ts1',
    employee_id: 'e_ts1',
    assignment_id: 'assign_ts1',
    questionnaire_id: 'quest_technical_support',
    department_id: 'dept_technical_support',
    scores: scores({ problem_solving: 86, critical_thinking: 80, rigor: 78, communication: 62, stress_management: 64 }),
    profile_code: 'analytical_solver',
    profile_name: 'Résolveur analytique',
    answers: [],
    completion_time_seconds: 275,
    department_fit: 82,
    created_at: daysAgo(18),
  },
  {
    id: 'res_hr1',
    employee_id: 'e_hr1',
    assignment_id: 'assign_hr1',
    questionnaire_id: 'quest_human_resources',
    department_id: 'dept_human_resources',
    scores: scores({ emotional_intelligence: 82, communication: 78, teamwork: 74, leadership: 66, critical_thinking: 60 }),
    profile_code: 'people_developer',
    profile_name: 'Développeur de talents',
    answers: [],
    completion_time_seconds: 250,
    department_fit: 78,
    created_at: daysAgo(15),
  },
];

// --- Affectations d'évaluation ------------------------------------------
export const seedAssignments = [
  { id: 'assign_cs1', employee_id: 'e_cs1', questionnaire_id: 'quest_customer_service', status: 'completed', assigned_by: 'u_mgr_cs', assigned_at: daysAgo(35), due_date: daysAgo(25), completed_at: daysAgo(30), result_id: 'res_cs1' },
  { id: 'assign_cs2', employee_id: 'e_cs2', questionnaire_id: 'quest_customer_service', status: 'completed', assigned_by: 'u_mgr_cs', assigned_at: daysAgo(30), due_date: daysAgo(20), completed_at: daysAgo(25), result_id: 'res_cs2' },
  { id: 'assign_cs3', employee_id: 'e_cs3', questionnaire_id: 'quest_customer_service', status: 'assigned', assigned_by: 'u_mgr_cs', assigned_at: daysAgo(5), due_date: daysAgo(-10), completed_at: null, result_id: null },
  { id: 'assign_sa1', employee_id: 'e_sa1', questionnaire_id: 'quest_sales', status: 'completed', assigned_by: 'u_mgr_sales', assigned_at: daysAgo(25), due_date: daysAgo(15), completed_at: daysAgo(20), result_id: 'res_sa1' },
  { id: 'assign_sa2', employee_id: 'e_sa2', questionnaire_id: 'quest_sales', status: 'assigned', assigned_by: 'u_mgr_sales', assigned_at: daysAgo(4), due_date: daysAgo(-12), completed_at: null, result_id: null },
  { id: 'assign_ts1', employee_id: 'e_ts1', questionnaire_id: 'quest_technical_support', status: 'completed', assigned_by: 'u_mgr_tech', assigned_at: daysAgo(22), due_date: daysAgo(12), completed_at: daysAgo(18), result_id: 'res_ts1' },
  { id: 'assign_ts2', employee_id: 'e_ts2', questionnaire_id: 'quest_technical_support', status: 'assigned', assigned_by: 'u_mgr_tech', assigned_at: daysAgo(3), due_date: daysAgo(-14), completed_at: null, result_id: null },
  { id: 'assign_hr1', employee_id: 'e_hr1', questionnaire_id: 'quest_human_resources', status: 'completed', assigned_by: 'u_hr', assigned_at: daysAgo(20), due_date: daysAgo(10), completed_at: daysAgo(15), result_id: 'res_hr1' },
];

// --- Recommandations -----------------------------------------------------
export const seedRecommendations = [
  { id: 'rec_cs1_1', employee_id: 'e_cs1', result_id: 'res_cs1', type: 'training', title: 'Perfectionner la gestion du stress', description: 'Suivre l’atelier de gestion du stress pour consolider la performance en période de pic.', priority: 'medium', created_at: daysAgo(29) },
  { id: 'rec_cs1_2', employee_id: 'e_cs1', result_id: 'res_cs1', type: 'career', title: 'Évolution vers Référent qualité', description: 'Profil aligné avec une montée en responsabilité sur la qualité de service.', priority: 'low', created_at: daysAgo(29) },
  { id: 'rec_cs2_1', employee_id: 'e_cs2', result_id: 'res_cs2', type: 'training', title: 'Gérer son stress en centre d’appels', description: 'Compétence critique à renforcer pour le Service Client.', priority: 'high', created_at: daysAgo(24) },
  { id: 'rec_ts1_1', employee_id: 'e_ts1', result_id: 'res_ts1', type: 'development', title: 'Renforcer la communication client', description: 'Vulgariser davantage les solutions techniques pour les clients non initiés.', priority: 'medium', created_at: daysAgo(17) },
];

// --- Plans de formation --------------------------------------------------
export const seedTrainingPlans = [
  { id: 'tp_cs1', employee_id: 'e_cs1', title: 'Gérer son stress en centre d’appels', skill: 'stress_management', status: 'in_progress', start_date: daysAgo(10), description: 'Programme de 1 jour + suivi.' },
  { id: 'tp_cs2', employee_id: 'e_cs2', title: 'Gérer son stress en centre d’appels', skill: 'stress_management', status: 'planned', start_date: daysAgo(-7), description: 'Session à venir.' },
  { id: 'tp_ts1', employee_id: 'e_ts1', title: 'Communication professionnelle et écoute active', skill: 'communication', status: 'planned', start_date: daysAgo(-14), description: 'Atelier pédagogie client.' },
];

// --- Catalogue de formations (référentiel) -------------------------------
export const seedTrainingCatalog = TRAINING_CATALOG.map((t) => ({ ...t }));

// --- Paramètres système --------------------------------------------------
export const seedSettings = [
  { id: 'set_company_name', key: 'company_name', value: 'PsychoScan IOS', label: 'Nom de l’entreprise' },
  { id: 'set_reminder_days', key: 'assessment_reminder_days', value: '7', label: 'Rappel avant échéance (jours)' },
  { id: 'set_pass_score', key: 'default_pass_score', value: '60', label: 'Score d’adéquation cible (%)' },
  { id: 'set_self_assessment', key: 'allow_self_assessment', value: 'true', label: 'Auto-évaluation autorisée' },
];

// --- Journal d'audit -----------------------------------------------------
export const seedAuditLogs = [
  { id: 'log_1', actor_id: 'u_hr', action: 'create', entity: 'assessment_assignment', entity_id: 'assign_cs3', details: 'Affectation questionnaire Service Client', created_at: daysAgo(5) },
  { id: 'log_2', actor_id: 'u_mgr_cs', action: 'view', entity: 'assessment_result', entity_id: 'res_cs1', details: 'Consultation résultat', created_at: daysAgo(4) },
  { id: 'log_3', actor_id: 'u_super', action: 'update', entity: 'settings', entity_id: 'default_pass_score', details: 'Mise à jour score cible', created_at: daysAgo(2) },
];

export function buildSeedDatabase() {
  return {
    profiles: seedProfiles.map((r) => ({ ...r })),
    departments: seedDepartments.map((r) => ({ ...r })),
    question_categories: seedQuestionCategories.map((r) => ({ ...r })),
    questionnaires: seedQuestionnaires.map((r) => ({ ...r })),
    questions: seedQuestions.map((r) => ({ ...r })),
    psychological_profiles: seedPsychProfiles.map((r) => ({ ...r })),
    assessment_assignments: seedAssignments.map((r) => ({ ...r })),
    assessment_results: seedResults.map((r) => ({ ...r })),
    recommendations: seedRecommendations.map((r) => ({ ...r })),
    training_plans: seedTrainingPlans.map((r) => ({ ...r })),
    training_catalog: seedTrainingCatalog.map((r) => ({ ...r })),
    settings: seedSettings.map((r) => ({ ...r })),
    audit_logs: seedAuditLogs.map((r) => ({ ...r })),
  };
}
