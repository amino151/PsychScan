// Catalogue des départements du centre d'appels et pondération des compétences
// clés attendues pour chaque département. Ces poids alimentent le moteur
// d'évaluation (matching de profil et insights spécifiques au département).

export const DEPARTMENTS = [
  {
    id: 'dept_customer_service',
    code: 'customer_service',
    name: 'Service Client',
    description: "Traitement des demandes clients, réclamations et fidélisation.",
    color: '#0EA5E9',
    questionnaire_id: 'quest_customer_service',
    // Compétences prioritaires (poids relatifs) pour ce département.
    key_skills: {
      customer_orientation: 3,
      communication: 3,
      emotional_intelligence: 2,
      stress_management: 2,
      adaptability: 1,
    },
  },
  {
    id: 'dept_sales',
    code: 'sales',
    name: 'Ventes & Commercial',
    description: 'Prospection, négociation et développement du chiffre d’affaires.',
    color: '#F97316',
    questionnaire_id: 'quest_sales',
    key_skills: {
      communication: 3,
      customer_orientation: 3,
      leadership: 2,
      adaptability: 2,
      stress_management: 1,
    },
  },
  {
    id: 'dept_technical_support',
    code: 'technical_support',
    name: 'Support Technique',
    description: 'Diagnostic, résolution d’incidents et accompagnement technique.',
    color: '#6366F1',
    questionnaire_id: 'quest_technical_support',
    key_skills: {
      problem_solving: 3,
      critical_thinking: 3,
      rigor: 2,
      communication: 2,
      stress_management: 1,
    },
  },
  {
    id: 'dept_human_resources',
    code: 'human_resources',
    name: 'Ressources Humaines',
    description: 'Recrutement, développement des talents et climat social.',
    color: '#14B8A6',
    questionnaire_id: 'quest_human_resources',
    key_skills: {
      emotional_intelligence: 3,
      communication: 3,
      teamwork: 2,
      leadership: 2,
      critical_thinking: 1,
    },
  },
];

export const DEPARTMENT_BY_CODE = DEPARTMENTS.reduce(
  (acc, d) => ({ ...acc, [d.code]: d }),
  {}
);

export const DEPARTMENT_BY_ID = DEPARTMENTS.reduce(
  (acc, d) => ({ ...acc, [d.id]: d }),
  {}
);

export function getDepartment(idOrCode) {
  return DEPARTMENT_BY_ID[idOrCode] || DEPARTMENT_BY_CODE[idOrCode] || null;
}

export function departmentName(idOrCode) {
  return getDepartment(idOrCode)?.name || 'Département';
}

// Renvoie les clés de compétences prioritaires d'un département, triées par poids.
export function departmentSkillKeys(idOrCode) {
  const dept = getDepartment(idOrCode);
  if (!dept) return [];
  return Object.entries(dept.key_skills)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);
}
