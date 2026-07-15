// Modèle RBAC à 4 rôles pour PsychoScan IOS.
// Chaque rôle possède un niveau hiérarchique, un tableau de bord d'accueil,
// et un ensemble de permissions. Les routes protégées et la navigation
// s'appuient sur ce catalogue.

export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  HR_ADMIN: 'hr_admin',
  SUPER_ADMIN: 'super_admin',
};

export const ROLE_LIST = [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.HR_ADMIN, ROLES.SUPER_ADMIN];

export const ROLE_DEFINITIONS = {
  [ROLES.EMPLOYEE]: {
    key: ROLES.EMPLOYEE,
    label: 'Employé',
    level: 1,
    home: '/app/employe',
    description: 'Passe ses évaluations et consulte ses propres résultats.',
    color: '#0EA5E9',
    permissions: ['assessment:take', 'result:read:own', 'profile:read:own'],
  },
  [ROLES.MANAGER]: {
    key: ROLES.MANAGER,
    label: 'Manager',
    level: 2,
    home: '/app/manager',
    description: "Suit les résultats et la progression de son département / de ses subordonnés.",
    color: '#14B8A6',
    permissions: [
      'assessment:take',
      'result:read:own',
      'result:read:team',
      'employee:read:team',
      'assignment:create:team',
      'report:read:team',
    ],
  },
  [ROLES.HR_ADMIN]: {
    key: ROLES.HR_ADMIN,
    label: 'Admin RH',
    level: 3,
    home: '/app/rh',
    description: 'Gère les employés, les départements, les questionnaires et les recommandations.',
    color: '#7C3AED',
    permissions: [
      'result:read:all',
      'employee:manage',
      'manager:manage',
      'department:manage',
      'questionnaire:manage',
      'question:manage',
      'profile:manage',
      'recommendation:manage',
      'training:manage',
      'assignment:manage',
      'report:read:all',
    ],
  },
  [ROLES.SUPER_ADMIN]: {
    key: ROLES.SUPER_ADMIN,
    label: 'Super Admin',
    level: 4,
    home: '/app/admin',
    description: "Accès complet : configuration système, audit et supervision globale.",
    color: '#1D4ED8',
    permissions: ['*'],
  },
};

export function getRole(role) {
  return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS[ROLES.EMPLOYEE];
}

export function roleLabel(role) {
  return getRole(role).label;
}

export function roleHome(role) {
  return getRole(role).home;
}

export function roleLevel(role) {
  return getRole(role).level;
}

export function hasPermission(role, permission) {
  const def = getRole(role);
  if (!def) return false;
  if (def.permissions.includes('*')) return true;
  return def.permissions.includes(permission);
}

// Un rôle "gère" un autre s'il possède un niveau strictement supérieur.
export function canManageRole(actorRole, targetRole) {
  return roleLevel(actorRole) > roleLevel(targetRole);
}
