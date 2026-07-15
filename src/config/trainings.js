// Catalogue de formations rattachées aux compétences.
// Utilisé pour générer automatiquement des suggestions de formation en fonction
// des axes d'amélioration détectés lors d'une évaluation.

export const TRAINING_CATALOG = [
  {
    id: 'train_communication',
    skill: 'communication',
    title: 'Communication professionnelle et écoute active',
    duration: '2 jours',
    format: 'Présentiel',
    description: 'Structurer son discours, reformuler et adapter son message au client.',
  },
  {
    id: 'train_stress',
    skill: 'stress_management',
    title: 'Gérer son stress en centre d’appels',
    duration: '1 jour',
    format: 'Atelier',
    description: 'Techniques de respiration, gestion des pics d’activité et des appels difficiles.',
  },
  {
    id: 'train_leadership',
    skill: 'leadership',
    title: 'Fondamentaux du leadership d’équipe',
    duration: '3 jours',
    format: 'Blended learning',
    description: 'Animer, motiver et responsabiliser une équipe opérationnelle.',
  },
  {
    id: 'train_teamwork',
    skill: 'teamwork',
    title: 'Coopération et intelligence collective',
    duration: '1 jour',
    format: 'Atelier',
    description: 'Renforcer l’entraide et la communication au sein de l’équipe.',
  },
  {
    id: 'train_adaptability',
    skill: 'adaptability',
    title: 'Agilité et gestion du changement',
    duration: '1 jour',
    format: 'E-learning + coaching',
    description: 'Développer sa flexibilité face aux évolutions d’outils et de process.',
  },
  {
    id: 'train_emotional',
    skill: 'emotional_intelligence',
    title: 'Intelligence émotionnelle au travail',
    duration: '2 jours',
    format: 'Présentiel',
    description: 'Reconnaître, comprendre et réguler les émotions en relation client.',
  },
  {
    id: 'train_problem',
    skill: 'problem_solving',
    title: 'Méthodes de résolution de problèmes',
    duration: '2 jours',
    format: 'Atelier pratique',
    description: 'Diagnostic structuré, arbre des causes et plans d’action.',
  },
  {
    id: 'train_customer',
    skill: 'customer_orientation',
    title: 'Excellence de la relation client',
    duration: '2 jours',
    format: 'Présentiel',
    description: 'Culture service, gestion de la réclamation et fidélisation.',
  },
  {
    id: 'train_critical',
    skill: 'critical_thinking',
    title: 'Esprit critique et prise de décision',
    duration: '1 jour',
    format: 'Atelier',
    description: 'Analyser objectivement l’information et sécuriser ses décisions.',
  },
  {
    id: 'train_rigor',
    skill: 'rigor',
    title: 'Rigueur, méthode et respect des procédures',
    duration: '1 jour',
    format: 'E-learning',
    description: 'Fiabiliser son travail et appliquer les standards qualité.',
  },
];

export const TRAINING_BY_SKILL = TRAINING_CATALOG.reduce(
  (acc, t) => ({ ...acc, [t.skill]: t }),
  {}
);

export function trainingForSkill(skill) {
  return TRAINING_BY_SKILL[skill] || null;
}
