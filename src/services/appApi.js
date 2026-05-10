import { defaultQuestions } from '@/lib/questionData';
import { profileCatalog } from '@/config/profiles';
import { normalizeEmail } from '@/lib/auth-utils';
import * as authService from '@/services/auth';
import * as db from '@/services/database';

const GUEST_EMAIL_KEY = 'mindscan_guest_email';

function sortByField(items, sortSpec) {
  if (!sortSpec || !items.length) return items;
  const desc = sortSpec.startsWith('-');
  const field = desc ? sortSpec.slice(1) : sortSpec;
  return [...items].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

function mapTestResultRow(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.created_at ?? row.created_date,
  };
}

export function getGuestEmail() {
  let email = localStorage.getItem(GUEST_EMAIL_KEY);
  if (!email) {
    email = `guest_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}@local`;
    localStorage.setItem(GUEST_EMAIL_KEY, email);
  }
  return email;
}

const seededQuestions = defaultQuestions.map((q, i) => ({
  ...q,
  id: q.id || `q${q.order ?? i}`,
}));

const seededProfiles = profileCatalog.map((p) => ({
  ...p,
  id: p.id || `profile_${p.code}`,
}));

export const appApi = {
  auth: {
    async register({ full_name, email, password }) {
      const data = await authService.signUp(normalizeEmail(email), password, { full_name });
      const user = data.user;
      if (!user) throw new Error('Inscription impossible.');
      await db.createProfile({
        id: user.id,
        email: user.email ?? normalizeEmail(email),
        full_name: full_name.trim(),
      });
      return authService.getCurrentUser();
    },

    async signIn({ email, password }) {
      await authService.login(normalizeEmail(email), password);
      return authService.getCurrentUser();
    },

    async requestPasswordReset(email) {
      await authService.requestPasswordReset(normalizeEmail(email));
      return { exists: true };
    },

    async me() {
      const user = await authService.getCurrentUser();
      if (!user) {
        const err = new Error('Not authenticated');
        Object.assign(err, { status: 401 });
        throw err;
      }
      return user;
    },

    async promoteToAdmin() {
      await authService.promoteToAdmin();
      return authService.getCurrentUser();
    },

    logout(redirectHref) {
      authService.logout().finally(() => {
        if (redirectHref) window.location.assign(redirectHref);
      });
    },

    redirectToLogin(returnUrl) {
      const url = new URL('/login', window.location.origin);
      if (returnUrl) url.searchParams.set('return', returnUrl);
      window.location.assign(url.toString());
    },
  },

  entities: {
    Question: {
      async list(sortField, limit = 100) {
        const sorted = sortByField(seededQuestions, sortField || 'order');
        return sorted.slice(0, limit);
      },
    },

    PsychProfile: {
      async list() {
        return seededProfiles;
      },
    },

    TestResult: {
      async create(data) {
        const sessionUser = await authService.getCurrentUser().catch(() => null);
        const row = {
          user_id: sessionUser?.id ?? null,
          user_email: data.user_email,
          user_name: data.user_name,
          scores: data.scores,
          profile_code: data.profile_code,
          profile_name: data.profile_name,
          answers: data.answers,
          completion_time_seconds: data.completion_time_seconds,
          is_guest: data.is_guest ?? false,
        };
        const inserted = await db.insertTestResult(row);
        return mapTestResultRow(inserted);
      },

      async filter(criteria, sortSpec, limit) {
        const rows = await db.filterTestResults(criteria, sortSpec || '-created_at', limit);
        return rows.map(mapTestResultRow);
      },

      async list(sortSpec, limit = 500) {
        const rows = await db.listTestResults(sortSpec || '-created_at', limit);
        return rows.map(mapTestResultRow);
      },
    },

    User: {
      async list() {
        const rows = await db.listProfilesForAdmin();
        return rows.map((u) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role ?? 'user',
          created_date: u.created_at,
        }));
      },
    },
  },
};
