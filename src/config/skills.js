// Référentiel de compétences (soft skills) évaluées par PsychoScan IOS.
// Chaque compétence est une dimension mesurable du moteur d'évaluation.
// Ce catalogue est générique : les questionnaires et le scoring s'appuient
// sur ces clés, et chaque département pondère un sous-ensemble de compétences.

export const SKILLS = [
  {
    key: 'communication',
    label: 'Communication',
    description: 'Clarté du discours, écoute active et transmission efficace des messages.',
    color: '#2563EB',
  },
  {
    key: 'stress_management',
    label: 'Gestion du stress',
    description: 'Capacité à rester calme, lucide et performant sous pression.',
    color: '#F97316',
  },
  {
    key: 'leadership',
    label: 'Leadership',
    description: "Aptitude à orienter, motiver et fédérer une équipe autour d'objectifs.",
    color: '#EA580C',
  },
  {
    key: 'teamwork',
    label: "Travail d'équipe",
    description: 'Collaboration, entraide et contribution à la cohésion collective.',
    color: '#14B8A6',
  },
  {
    key: 'adaptability',
    label: 'Adaptabilité',
    description: "Souplesse face au changement et capacité à ajuster ses méthodes.",
    color: '#22C55E',
  },
  {
    key: 'emotional_intelligence',
    label: 'Intelligence émotionnelle',
    description: 'Compréhension et régulation des émotions, empathie relationnelle.',
    color: '#EC4899',
  },
  {
    key: 'problem_solving',
    label: 'Résolution de problèmes',
    description: "Analyse des situations et construction de solutions concrètes.",
    color: '#6366F1',
  },
  {
    key: 'customer_orientation',
    label: 'Orientation client',
    description: 'Souci de la satisfaction, du service et de la fidélisation client.',
    color: '#0EA5E9',
  },
  {
    key: 'critical_thinking',
    label: 'Esprit critique',
    description: 'Recul, objectivité et évaluation rigoureuse des informations.',
    color: '#475569',
  },
  {
    key: 'rigor',
    label: 'Rigueur',
    description: 'Discipline, fiabilité et respect des procédures et des délais.',
    color: '#F59E0B',
  },
];

export const SKILL_KEYS = SKILLS.map((s) => s.key);

export const SKILL_LABELS = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.label }),
  {}
);

export const SKILL_COLORS = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.color }),
  {}
);

export const SKILL_DESCRIPTIONS = SKILLS.reduce(
  (acc, s) => ({ ...acc, [s.key]: s.description }),
  {}
);

export function getSkill(key) {
  return SKILLS.find((s) => s.key === key) || null;
}

export function skillLabel(key) {
  return SKILL_LABELS[key] || key;
}
