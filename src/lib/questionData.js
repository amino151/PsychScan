import { profileCatalog } from '@/config/profiles';

// Predefined questions for the MindScan psychological test
export const defaultQuestions = [
  // Introversion / Extraversion
  {
    text: "Lors d'une soirée, vous préférez :",
    type: "multiple_choice",
    category: "introversion_extraversion",
    order: 1,
    is_active: true,
    options: [
      { text: "Discuter avec un petit groupe d'amis proches", scores: { introversion: 3, extraversion: 0, collaboration: 1 } },
      { text: "Rencontrer le maximum de nouvelles personnes", scores: { introversion: 0, extraversion: 3, leadership: 1 } },
      { text: "Observer les gens depuis un coin tranquille", scores: { introversion: 3, analytical: 1 } },
      { text: "Être au centre de l'attention et animer la soirée", scores: { extraversion: 3, creative: 1, leadership: 2 } }
    ]
  },
  {
    text: "Après une longue journée de travail, vous rechargez vos batteries en :",
    type: "multiple_choice",
    category: "introversion_extraversion",
    order: 2,
    is_active: true,
    options: [
      { text: "Lisant un livre ou regardant un film seul(e)", scores: { introversion: 3, emotional: 1 } },
      { text: "Appelant un ami pour discuter", scores: { extraversion: 2, emotional: 1, collaboration: 1 } },
      { text: "Faisant du sport ou une activité physique", scores: { extraversion: 1, rational: 1 } },
      { text: "Sortant dans un bar ou un restaurant avec des amis", scores: { extraversion: 3, collaboration: 1 } }
    ]
  },
  {
    text: "Vous aimez travailler en équipe plutôt que seul(e).",
    type: "scale",
    category: "introversion_extraversion",
    order: 3,
    is_active: true,
    options: [
      { text: "1", scores: { introversion: 3, extraversion: 0 } },
      { text: "2", scores: { introversion: 2, extraversion: 1 } },
      { text: "3", scores: { introversion: 1, extraversion: 1 } },
      { text: "4", scores: { extraversion: 2, collaboration: 1 } },
      { text: "5", scores: { extraversion: 3, collaboration: 2 } }
    ]
  },
  // Analytical / Creative
  {
    text: "Face à un problème complexe, votre première réaction est de :",
    type: "multiple_choice",
    category: "analytical_creative",
    order: 4,
    is_active: true,
    options: [
      { text: "Analyser méthodiquement chaque aspect", scores: { analytical: 3, rational: 2 } },
      { text: "Chercher une solution créative et originale", scores: { creative: 3, emotional: 1 } },
      { text: "Consulter des experts ou des collègues", scores: { collaboration: 2, extraversion: 1 } },
      { text: "Suivre votre intuition", scores: { creative: 2, emotional: 2 } }
    ]
  },
  {
    text: "Vous préférez les tâches bien structurées avec des règles claires.",
    type: "scale",
    category: "analytical_creative",
    order: 5,
    is_active: true,
    options: [
      { text: "1", scores: { creative: 3, analytical: 0 } },
      { text: "2", scores: { creative: 2, analytical: 1 } },
      { text: "3", scores: { creative: 1, analytical: 1 } },
      { text: "4", scores: { analytical: 2, rational: 1 } },
      { text: "5", scores: { analytical: 3, rational: 2 } }
    ]
  },
  {
    text: "Quand vous planifiez un voyage, vous :",
    type: "multiple_choice",
    category: "analytical_creative",
    order: 6,
    is_active: true,
    options: [
      { text: "Planifiez chaque détail à l'avance", scores: { analytical: 3, rational: 2 } },
      { text: "Laissez place à l'improvisation totale", scores: { creative: 3, extraversion: 1 } },
      { text: "Faites un plan général mais restez flexible", scores: { analytical: 1, creative: 1, collaboration: 1 } },
      { text: "Demandez à quelqu'un d'autre de planifier", scores: { collaboration: 2, introversion: 1 } }
    ]
  },
  // Emotional / Rational
  {
    text: "Prenez-vous vos décisions importantes plutôt avec le cœur ou la raison ?",
    type: "yes_no",
    category: "emotional_rational",
    order: 7,
    is_active: true,
    options: [
      { text: "Le cœur (Oui)", scores: { emotional: 3, creative: 1 } },
      { text: "La raison (Non)", scores: { rational: 3, analytical: 1 } }
    ]
  },
  {
    text: "Face à un conflit entre collègues, vous :",
    type: "situation",
    category: "emotional_rational",
    order: 8,
    is_active: true,
    options: [
      { text: "Écoutez les deux parties avec empathie", scores: { emotional: 2, collaboration: 2 } },
      { text: "Analysez objectivement la situation", scores: { rational: 3, analytical: 2 } },
      { text: "Proposez un compromis pratique", scores: { rational: 1, collaboration: 2, leadership: 1 } },
      { text: "Prenez parti pour celui qui a raison", scores: { rational: 2, leadership: 2 } }
    ]
  },
  {
    text: "Vous êtes sensible aux émotions des autres et les percevez facilement.",
    type: "scale",
    category: "emotional_rational",
    order: 9,
    is_active: true,
    options: [
      { text: "1", scores: { rational: 3, emotional: 0 } },
      { text: "2", scores: { rational: 2, emotional: 1 } },
      { text: "3", scores: { rational: 1, emotional: 1 } },
      { text: "4", scores: { emotional: 2, collaboration: 1 } },
      { text: "5", scores: { emotional: 3, collaboration: 1 } }
    ]
  },
  // Leadership / Collaboration
  {
    text: "Dans un projet de groupe, vous prenez naturellement le rôle de :",
    type: "multiple_choice",
    category: "leadership_collaboration",
    order: 10,
    is_active: true,
    options: [
      { text: "Leader qui organise et délègue", scores: { leadership: 3, extraversion: 2, rational: 1 } },
      { text: "Membre actif qui contribue ses idées", scores: { collaboration: 2, creative: 1, extraversion: 1 } },
      { text: "Expert technique qui résout les problèmes", scores: { analytical: 2, introversion: 1, rational: 1 } },
      { text: "Médiateur qui assure la cohésion du groupe", scores: { collaboration: 3, emotional: 2 } }
    ]
  },
  {
    text: "Vous vous sentez à l'aise pour prendre des décisions qui affectent les autres.",
    type: "scale",
    category: "leadership_collaboration",
    order: 11,
    is_active: true,
    options: [
      { text: "1", scores: { collaboration: 2, introversion: 1 } },
      { text: "2", scores: { collaboration: 1, introversion: 1 } },
      { text: "3", scores: { leadership: 1, collaboration: 1 } },
      { text: "4", scores: { leadership: 2, extraversion: 1 } },
      { text: "5", scores: { leadership: 3, extraversion: 1, rational: 1 } }
    ]
  },
  {
    text: "Préférez-vous diriger ou suivre ?",
    type: "yes_no",
    category: "leadership_collaboration",
    order: 12,
    is_active: true,
    options: [
      { text: "Diriger (Oui)", scores: { leadership: 3, extraversion: 1 } },
      { text: "Suivre (Non)", scores: { collaboration: 2, introversion: 1 } }
    ]
  },
  // Stress Management
  {
    text: "Quand vous êtes sous pression, vous :",
    type: "situation",
    category: "stress_management",
    order: 13,
    is_active: true,
    options: [
      { text: "Restez calme et établissez un plan d'action", scores: { rational: 3, analytical: 2, leadership: 1 } },
      { text: "Exprimez vos émotions et cherchez du soutien", scores: { emotional: 3, extraversion: 1, collaboration: 1 } },
      { text: "Vous isolez pour réfléchir tranquillement", scores: { introversion: 3, analytical: 1 } },
      { text: "Canalisez le stress dans une activité créative", scores: { creative: 3, emotional: 1 } }
    ]
  },
  {
    text: "Vous adaptez-vous facilement aux changements imprévus ?",
    type: "scale",
    category: "stress_management",
    order: 14,
    is_active: true,
    options: [
      { text: "1", scores: { analytical: 2, introversion: 1 } },
      { text: "2", scores: { analytical: 1, rational: 1 } },
      { text: "3", scores: { creative: 1, rational: 1 } },
      { text: "4", scores: { creative: 2, extraversion: 1 } },
      { text: "5", scores: { creative: 3, extraversion: 1, leadership: 1 } }
    ]
  },
  {
    text: "Imaginez que votre entreprise traverse une crise majeure. Que faites-vous ?",
    type: "situation",
    category: "stress_management",
    order: 15,
    is_active: true,
    options: [
      { text: "Vous prenez les commandes et mobilisez l'équipe", scores: { leadership: 3, extraversion: 2, rational: 1 } },
      { text: "Vous analysez les données pour trouver la cause", scores: { analytical: 3, rational: 2 } },
      { text: "Vous innovez et proposez une direction nouvelle", scores: { creative: 3, leadership: 1 } },
      { text: "Vous soutenez émotionnellement vos collègues", scores: { emotional: 2, collaboration: 3 } }
    ]
  }
];

export const defaultProfiles = profileCatalog;