// Profils psychologiques professionnels de PsychoScan IOS.
// Les profils sont exprimés en fonction des compétences (voir config/skills.js)
// via `dominant_traits`. Le moteur d'évaluation associe chaque collaborateur
// au profil dont la pondération correspond le mieux à ses scores.

export const profileCatalog = [
  {
    id: 'profile_customer_champion',
    code: 'customer_champion',
    name: 'Champion de la relation client',
    description:
      "Vous placez la satisfaction client au cœur de votre action et transformez chaque échange en expérience positive.",
    strengths: ['Orientation client', 'Écoute active', 'Communication chaleureuse', 'Fidélisation'],
    weaknesses: ['Peut sur-promettre', 'Difficulté à dire non', 'Charge émotionnelle'],
    recommended_careers: ['Conseiller senior', 'Référent qualité', 'Responsable satisfaction client'],
    advice: [
      'Fixez des attentes réalistes avec le client',
      'Préservez votre énergie émotionnelle',
      'Documentez les cas complexes pour gagner en efficacité',
    ],
    dominant_traits: { customer_orientation: 3, communication: 3, emotional_intelligence: 2 },
    color: '#0EA5E9',
    theme: { from: '#0284C7', to: '#38BDF8' },
  },
  {
    id: 'profile_resilient_operator',
    code: 'resilient_operator',
    name: 'Opérateur résilient',
    description:
      "Vous gardez votre calme sous forte pression et maintenez un niveau de service constant même en période de pic d'activité.",
    strengths: ['Gestion du stress', 'Adaptabilité', 'Fiabilité', 'Constance'],
    weaknesses: ['Tendance à internaliser la pression', 'Peu de délégation', 'Signale tard les difficultés'],
    recommended_careers: ['Agent polyvalent', 'Gestion de crise', 'Support de nuit / astreinte'],
    advice: [
      'Verbalisez vos limites avant la surcharge',
      'Planifiez des temps de récupération',
      'Partagez vos techniques de gestion du stress',
    ],
    dominant_traits: { stress_management: 3, adaptability: 2, rigor: 2 },
    color: '#F97316',
    theme: { from: '#EA580C', to: '#FB923C' },
  },
  {
    id: 'profile_team_leader',
    code: 'team_leader',
    name: "Leader d'équipe",
    description:
      "Vous mobilisez et structurez le collectif, donnez une direction claire et faites monter les autres en compétence.",
    strengths: ['Leadership', 'Communication', "Esprit d'équipe", 'Prise de décision'],
    weaknesses: ['Impatience', 'Délégation parfois limitée', 'Contrôle excessif'],
    recommended_careers: ['Chef de plateau', 'Superviseur', 'Team manager'],
    advice: [
      'Déléguez avec confiance',
      'Sollicitez du feedback régulier',
      'Adaptez votre style à chaque collaborateur',
    ],
    dominant_traits: { leadership: 3, communication: 2, teamwork: 2 },
    color: '#EA580C',
    theme: { from: '#C2410C', to: '#FB923C' },
  },
  {
    id: 'profile_analytical_solver',
    code: 'analytical_solver',
    name: 'Résolveur analytique',
    description:
      "Vous décortiquez les problèmes complexes avec méthode et proposez des solutions fiables et reproductibles.",
    strengths: ['Résolution de problèmes', 'Esprit critique', 'Rigueur', 'Précision'],
    weaknesses: ['Sur-analyse', 'Expression émotionnelle réservée', 'Perfectionnisme'],
    recommended_careers: ['Support technique niveau 2', 'Analyste qualité', 'Référent processus'],
    advice: [
      'Validez rapidement par des tests',
      'Vulgarisez vos conclusions',
      'Fixez-vous une limite de temps d’analyse',
    ],
    dominant_traits: { problem_solving: 3, critical_thinking: 3, rigor: 2 },
    color: '#6366F1',
    theme: { from: '#4F46E5', to: '#818CF8' },
  },
  {
    id: 'profile_empathetic_advisor',
    code: 'empathetic_advisor',
    name: 'Conseiller empathique',
    description:
      "Vous captez rapidement les émotions et les besoins, et créez un climat de confiance durable avec vos interlocuteurs.",
    strengths: ['Intelligence émotionnelle', 'Écoute', 'Communication', 'Cohésion'],
    weaknesses: ['Charge émotionnelle', 'Décision parfois différée', 'Difficulté à se protéger'],
    recommended_careers: ['Chargé de relation client', 'Médiateur', 'Support RH'],
    advice: [
      'Formalisez vos priorités',
      'Alternez écoute et action',
      'Protégez votre équilibre émotionnel',
    ],
    dominant_traits: { emotional_intelligence: 3, communication: 2, teamwork: 2 },
    color: '#EC4899',
    theme: { from: '#DB2777', to: '#F472B6' },
  },
  {
    id: 'profile_agile_collaborator',
    code: 'agile_collaborator',
    name: 'Collaborateur agile',
    description:
      "Vous vous adaptez vite aux changements de contexte et fluidifiez le travail collectif au quotidien.",
    strengths: ['Adaptabilité', "Travail d'équipe", 'Communication', 'Polyvalence'],
    weaknesses: ['Priorisation variable', 'Dispersion', 'Difficulté sur le long terme'],
    recommended_careers: ['Agent polyvalent', 'Renfort multi-services', 'Formateur terrain'],
    advice: [
      'Cadrez vos priorités en début de journée',
      'Capitalisez sur vos apprentissages',
      'Gardez des plages de concentration',
    ],
    dominant_traits: { adaptability: 3, teamwork: 2, communication: 2 },
    color: '#22C55E',
    theme: { from: '#16A34A', to: '#4ADE80' },
  },
  {
    id: 'profile_sales_closer',
    code: 'sales_closer',
    name: 'Négociateur commercial',
    description:
      "Vous savez convaincre, gérer l'objection et conclure, tout en préservant la relation avec le client.",
    strengths: ['Communication persuasive', 'Orientation client', 'Ténacité', 'Influence'],
    weaknesses: ['Impatience', 'Écoute parfois partielle', 'Focalisation court terme'],
    recommended_careers: ['Commercial sédentaire', 'Téléconseiller vente', 'Responsable comptes'],
    advice: [
      'Écoutez avant de proposer',
      'Soignez le suivi après-vente',
      'Équilibrez volume et qualité',
    ],
    dominant_traits: { communication: 3, customer_orientation: 3, leadership: 2 },
    color: '#F59E0B',
    theme: { from: '#D97706', to: '#FBBF24' },
  },
  {
    id: 'profile_process_expert',
    code: 'process_expert',
    name: 'Expert des procédures',
    description:
      "Vous garantissez la conformité, la fiabilité et la qualité en appliquant et améliorant les procédures.",
    strengths: ['Rigueur', 'Esprit critique', 'Fiabilité', 'Sens du détail'],
    weaknesses: ['Rigidité possible', 'Marge créative réduite', 'Prise de recul émotionnelle'],
    recommended_careers: ['Contrôleur qualité', 'Référent conformité', 'Formateur procédures'],
    advice: [
      'Gardez un espace pour l’amélioration continue',
      'Vérifiez les impacts humains des règles',
      'Communiquez le "pourquoi" des procédures',
    ],
    dominant_traits: { rigor: 3, critical_thinking: 2, problem_solving: 2 },
    color: '#475569',
    theme: { from: '#334155', to: '#64748B' },
  },
  {
    id: 'profile_people_developer',
    code: 'people_developer',
    name: 'Développeur de talents',
    description:
      "Vous révélez le potentiel des autres, accompagnez la montée en compétence et entretenez un climat positif.",
    strengths: ['Intelligence émotionnelle', 'Leadership bienveillant', 'Communication', 'Développement RH'],
    weaknesses: ['Exigence variable', 'Difficulté à trancher', 'Surinvestissement relationnel'],
    recommended_careers: ['Formateur', 'Chargé de développement RH', 'Coach interne'],
    advice: [
      'Fixez des objectifs mesurables',
      'Osez les feedbacks correctifs',
      'Structurez vos parcours d’accompagnement',
    ],
    dominant_traits: { emotional_intelligence: 3, leadership: 2, communication: 2 },
    color: '#7C3AED',
    theme: { from: '#6D28D9', to: '#A78BFA' },
  },
  {
    id: 'profile_versatile_performer',
    code: 'versatile_performer',
    name: 'Performeur polyvalent',
    description:
      "Vous présentez un profil équilibré, capable de tenir plusieurs rôles et de s'ajuster aux besoins de l'organisation.",
    strengths: ['Polyvalence', 'Équilibre', 'Fiabilité', 'Autonomie'],
    weaknesses: ['Spécialisation à approfondir', 'Visibilité à renforcer', 'Positionnement à clarifier'],
    recommended_careers: ['Agent multi-compétences', 'Renfort transverse', 'Évolution à définir'],
    advice: [
      'Identifiez une compétence signature à développer',
      'Rendez vos contributions visibles',
      'Choisissez une trajectoire cible',
    ],
    dominant_traits: {
      communication: 2,
      teamwork: 2,
      adaptability: 2,
      problem_solving: 2,
      customer_orientation: 1,
    },
    color: '#0F766E',
    theme: { from: '#0F766E', to: '#2DD4BF' },
  },
];

export const PROFILE_BY_CODE = profileCatalog.reduce(
  (acc, p) => ({ ...acc, [p.code]: p }),
  {}
);

export function getProfile(code) {
  return PROFILE_BY_CODE[code] || null;
}
