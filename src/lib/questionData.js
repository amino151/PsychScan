// Questionnaires d'évaluation par département pour PsychoScan IOS.
// Chaque questionnaire cible les compétences clés de son département.
// Les 4 types de questions sont conservés : multiple_choice, scale, yes_no, situation.
// Les options créditent des compétences (voir config/skills.js).

import { profileCatalog } from '@/config/profiles';
import { DEPARTMENTS } from '@/config/departments';

export const QUESTIONNAIRES = [
  {
    id: 'quest_customer_service',
    code: 'customer_service',
    department_id: 'dept_customer_service',
    title: 'Évaluation — Service Client',
    description: 'Compétences relationnelles, orientation client et gestion du stress.',
  },
  {
    id: 'quest_sales',
    code: 'sales',
    department_id: 'dept_sales',
    title: 'Évaluation — Ventes & Commercial',
    description: 'Persuasion, orientation client, résilience et sens du résultat.',
  },
  {
    id: 'quest_technical_support',
    code: 'technical_support',
    department_id: 'dept_technical_support',
    title: 'Évaluation — Support Technique',
    description: 'Résolution de problèmes, esprit critique, rigueur et pédagogie.',
  },
  {
    id: 'quest_human_resources',
    code: 'human_resources',
    department_id: 'dept_human_resources',
    title: 'Évaluation — Ressources Humaines',
    description: 'Intelligence émotionnelle, communication et développement des talents.',
  },
];

// Banque de questions par questionnaire.
const QUESTIONS = {
  quest_customer_service: [
    {
      text: 'Un client mécontent hausse le ton au téléphone. Votre première réaction :',
      type: 'situation',
      category: 'customer_orientation',
      options: [
        { text: 'Rester calme, reconnaître son émotion et reformuler son besoin', scores: { emotional_intelligence: 3, communication: 2, stress_management: 2 } },
        { text: "Appliquer strictement la procédure sans m'attarder sur l'émotion", scores: { rigor: 2, critical_thinking: 1 } },
        { text: 'Transférer rapidement à un collègue ou au superviseur', scores: { teamwork: 1, stress_management: 0 } },
        { text: 'Proposer immédiatement un geste commercial pour clore', scores: { customer_orientation: 2, communication: 1 } },
      ],
    },
    {
      text: 'La satisfaction du client prime sur le respect strict du script.',
      type: 'scale',
      category: 'customer_orientation',
      options: [
        { text: '1', scores: { rigor: 3 } },
        { text: '2', scores: { rigor: 2, customer_orientation: 1 } },
        { text: '3', scores: { customer_orientation: 1, adaptability: 1 } },
        { text: '4', scores: { customer_orientation: 2, adaptability: 2 } },
        { text: '5', scores: { customer_orientation: 3, adaptability: 2 } },
      ],
    },
    {
      text: 'Face à un pic d’appels ininterrompu, comment gérez-vous la pression ?',
      type: 'multiple_choice',
      category: 'stress_management',
      options: [
        { text: 'Je garde un rythme régulier et je respire entre les appels', scores: { stress_management: 3, adaptability: 1 } },
        { text: "Je m'organise une file de priorités mentale", scores: { stress_management: 2, problem_solving: 2 } },
        { text: 'Je demande du renfort à l’équipe', scores: { teamwork: 2, communication: 1 } },
        { text: 'Je ressens vite de la tension mais je tiens', scores: { stress_management: 1 } },
      ],
    },
    {
      text: 'Savez-vous adapter votre langage au profil de votre interlocuteur ?',
      type: 'yes_no',
      category: 'communication',
      options: [
        { text: 'Oui, systématiquement', scores: { communication: 3, adaptability: 2, emotional_intelligence: 1 } },
        { text: 'Pas toujours', scores: { communication: 1 } },
      ],
    },
    {
      text: 'Un client vous demande une information que vous ignorez. Vous :',
      type: 'situation',
      category: 'problem_solving',
      options: [
        { text: 'Cherchez la réponse fiable puis rappelez le client', scores: { rigor: 2, customer_orientation: 2, problem_solving: 1 } },
        { text: 'Improvisez une réponse plausible', scores: { communication: 1 } },
        { text: 'Renvoyez vers le site ou la FAQ', scores: { customer_orientation: 1 } },
        { text: "Sollicitez un collègue en direct pendant l'appel", scores: { teamwork: 2, communication: 1 } },
      ],
    },
    {
      text: 'Je perçois facilement l’état émotionnel d’un client à sa voix.',
      type: 'scale',
      category: 'emotional_intelligence',
      options: [
        { text: '1', scores: { critical_thinking: 1 } },
        { text: '2', scores: { emotional_intelligence: 1 } },
        { text: '3', scores: { emotional_intelligence: 2 } },
        { text: '4', scores: { emotional_intelligence: 3 } },
        { text: '5', scores: { emotional_intelligence: 3, communication: 1 } },
      ],
    },
    {
      text: "Un changement d'outil est déployé du jour au lendemain. Vous :",
      type: 'multiple_choice',
      category: 'adaptability',
      options: [
        { text: "L'explorez tout de suite et aidez les collègues", scores: { adaptability: 3, teamwork: 2 } },
        { text: 'Suivez la formation puis vous lancez', scores: { adaptability: 2, rigor: 1 } },
        { text: 'Attendez des consignes précises', scores: { rigor: 2 } },
        { text: 'Exprimez vos réticences avant d’adhérer', scores: { critical_thinking: 2 } },
      ],
    },
    {
      text: 'Je note les cas récurrents pour améliorer le service.',
      type: 'yes_no',
      category: 'rigor',
      options: [
        { text: 'Oui', scores: { rigor: 2, critical_thinking: 2, customer_orientation: 1 } },
        { text: 'Non', scores: { adaptability: 1 } },
      ],
    },
  ],

  quest_sales: [
    {
      text: 'Un prospect objecte « c’est trop cher ». Vous :',
      type: 'situation',
      category: 'communication',
      options: [
        { text: 'Questionnez pour comprendre la valeur perçue puis argumentez', scores: { communication: 3, customer_orientation: 2, critical_thinking: 1 } },
        { text: 'Proposez immédiatement une remise', scores: { customer_orientation: 1 } },
        { text: 'Mettez en avant les bénéfices concrets', scores: { communication: 2, customer_orientation: 2 } },
        { text: 'Reportez la décision à plus tard', scores: { adaptability: 1 } },
      ],
    },
    {
      text: 'J’aime relever des objectifs chiffrés ambitieux.',
      type: 'scale',
      category: 'leadership',
      options: [
        { text: '1', scores: { teamwork: 1 } },
        { text: '2', scores: { adaptability: 1 } },
        { text: '3', scores: { leadership: 1, communication: 1 } },
        { text: '4', scores: { leadership: 2, communication: 1 } },
        { text: '5', scores: { leadership: 3, communication: 2 } },
      ],
    },
    {
      text: 'Après plusieurs refus consécutifs, comment réagissez-vous ?',
      type: 'multiple_choice',
      category: 'stress_management',
      options: [
        { text: 'Je relativise et j’enchaîne avec énergie', scores: { stress_management: 3, adaptability: 2 } },
        { text: "J'analyse ce qui n'a pas marché", scores: { critical_thinking: 3, problem_solving: 2 } },
        { text: 'Je demande conseil à un collègue performant', scores: { teamwork: 2, communication: 1 } },
        { text: 'Je perds un peu de motivation', scores: { stress_management: 0 } },
      ],
    },
    {
      text: 'Adaptez-vous votre argumentaire à chaque client ?',
      type: 'yes_no',
      category: 'customer_orientation',
      options: [
        { text: 'Oui, toujours', scores: { customer_orientation: 3, communication: 2, adaptability: 2 } },
        { text: "J'utilise surtout un pitch standard", scores: { rigor: 1 } },
      ],
    },
    {
      text: 'Un client hésite entre vous et un concurrent. Vous :',
      type: 'situation',
      category: 'communication',
      options: [
        { text: 'Différenciez avec des preuves et un suivi personnalisé', scores: { communication: 2, customer_orientation: 3, critical_thinking: 1 } },
        { text: 'Insistez sur le prix', scores: { communication: 1 } },
        { text: 'Créez un sentiment d’urgence', scores: { leadership: 2, communication: 1 } },
        { text: 'Laissez le client décider seul', scores: { adaptability: 1 } },
      ],
    },
    {
      text: 'Je sais rester convaincant sans être insistant.',
      type: 'scale',
      category: 'emotional_intelligence',
      options: [
        { text: '1', scores: { leadership: 1 } },
        { text: '2', scores: { communication: 1 } },
        { text: '3', scores: { communication: 1, emotional_intelligence: 1 } },
        { text: '4', scores: { emotional_intelligence: 2, communication: 2 } },
        { text: '5', scores: { emotional_intelligence: 3, communication: 2 } },
      ],
    },
    {
      text: 'Le marché évolue et vos produits changent souvent. Vous :',
      type: 'multiple_choice',
      category: 'adaptability',
      options: [
        { text: 'Vous formez en continu avec plaisir', scores: { adaptability: 3, rigor: 1 } },
        { text: 'Vous suivez les nouveautés essentielles', scores: { adaptability: 2 } },
        { text: 'Vous préférez la stabilité', scores: { rigor: 2 } },
        { text: 'Vous vous appuyez sur l’équipe', scores: { teamwork: 2 } },
      ],
    },
    {
      text: 'Je tiens rigoureusement mon suivi et mes relances.',
      type: 'yes_no',
      category: 'rigor',
      options: [
        { text: 'Oui', scores: { rigor: 3, customer_orientation: 1 } },
        { text: 'Pas systématiquement', scores: { adaptability: 1 } },
      ],
    },
  ],

  quest_technical_support: [
    {
      text: 'Un incident inédit bloque un client. Votre démarche :',
      type: 'situation',
      category: 'problem_solving',
      options: [
        { text: 'Reproduire, isoler la cause, tester une solution', scores: { problem_solving: 3, critical_thinking: 2, rigor: 1 } },
        { text: 'Appliquer la procédure connue la plus proche', scores: { rigor: 2 } },
        { text: 'Escalader immédiatement au niveau 2', scores: { teamwork: 1 } },
        { text: 'Chercher dans la base de connaissances', scores: { problem_solving: 1, rigor: 1 } },
      ],
    },
    {
      text: 'Je vérifie mes hypothèses avant de conclure.',
      type: 'scale',
      category: 'critical_thinking',
      options: [
        { text: '1', scores: { adaptability: 1 } },
        { text: '2', scores: { problem_solving: 1 } },
        { text: '3', scores: { critical_thinking: 1 } },
        { text: '4', scores: { critical_thinking: 2, rigor: 1 } },
        { text: '5', scores: { critical_thinking: 3, rigor: 2 } },
      ],
    },
    {
      text: 'Comment expliquez-vous une solution technique à un client non initié ?',
      type: 'multiple_choice',
      category: 'communication',
      options: [
        { text: 'Avec des analogies simples et des étapes claires', scores: { communication: 3, emotional_intelligence: 1, customer_orientation: 1 } },
        { text: 'En donnant les termes exacts, quitte à être technique', scores: { rigor: 2, critical_thinking: 1 } },
        { text: 'En envoyant une procédure écrite', scores: { rigor: 1 } },
        { text: 'En prenant la main à distance', scores: { problem_solving: 2, customer_orientation: 1 } },
      ],
    },
    {
      text: 'Documentez-vous systématiquement les incidents résolus ?',
      type: 'yes_no',
      category: 'rigor',
      options: [
        { text: 'Oui, toujours', scores: { rigor: 3, critical_thinking: 1, teamwork: 1 } },
        { text: 'Rarement', scores: { adaptability: 1 } },
      ],
    },
    {
      text: 'Plusieurs tickets urgents arrivent en même temps. Vous :',
      type: 'situation',
      category: 'stress_management',
      options: [
        { text: 'Priorisez selon l’impact et communiquez les délais', scores: { problem_solving: 2, stress_management: 2, communication: 2 } },
        { text: 'Traitez dans l’ordre d’arrivée', scores: { rigor: 2 } },
        { text: 'Demandez de l’aide pour répartir', scores: { teamwork: 3 } },
        { text: 'Vous sentez la pression monter', scores: { stress_management: 0 } },
      ],
    },
    {
      text: 'Je reste méthodique même quand la solution tarde.',
      type: 'scale',
      category: 'rigor',
      options: [
        { text: '1', scores: { adaptability: 1 } },
        { text: '2', scores: { stress_management: 1 } },
        { text: '3', scores: { rigor: 1, stress_management: 1 } },
        { text: '4', scores: { rigor: 2, problem_solving: 1 } },
        { text: '5', scores: { rigor: 3, problem_solving: 2 } },
      ],
    },
    {
      text: 'Un outil de diagnostic est remplacé. Vous :',
      type: 'multiple_choice',
      category: 'adaptability',
      options: [
        { text: 'L’adoptez vite et partagez vos astuces', scores: { adaptability: 3, teamwork: 2 } },
        { text: 'Le testez prudemment', scores: { adaptability: 1, critical_thinking: 1 } },
        { text: 'Attendez une documentation complète', scores: { rigor: 2 } },
        { text: 'Comparez avec l’ancien avant d’adhérer', scores: { critical_thinking: 2 } },
      ],
    },
    {
      text: 'Je garde le client informé tout au long de la résolution.',
      type: 'yes_no',
      category: 'customer_orientation',
      options: [
        { text: 'Oui', scores: { customer_orientation: 2, communication: 2, emotional_intelligence: 1 } },
        { text: 'Seulement à la fin', scores: { rigor: 1 } },
      ],
    },
  ],

  quest_human_resources: [
    {
      text: 'Deux collaborateurs sont en conflit ouvert. Vous :',
      type: 'situation',
      category: 'emotional_intelligence',
      options: [
        { text: 'Écoutez chacun séparément puis cherchez un terrain d’entente', scores: { emotional_intelligence: 3, communication: 2, teamwork: 1 } },
        { text: 'Rappelez les règles et tranchez', scores: { leadership: 2, rigor: 1 } },
        { text: 'Laissez le temps apaiser la situation', scores: { adaptability: 1 } },
        { text: 'Escaladez à la direction', scores: { critical_thinking: 1 } },
      ],
    },
    {
      text: 'Je repère facilement les signes de démotivation dans une équipe.',
      type: 'scale',
      category: 'emotional_intelligence',
      options: [
        { text: '1', scores: { rigor: 1 } },
        { text: '2', scores: { communication: 1 } },
        { text: '3', scores: { emotional_intelligence: 1 } },
        { text: '4', scores: { emotional_intelligence: 2, communication: 1 } },
        { text: '5', scores: { emotional_intelligence: 3, leadership: 1 } },
      ],
    },
    {
      text: 'Comment abordez-vous un entretien de recadrage ?',
      type: 'multiple_choice',
      category: 'communication',
      options: [
        { text: 'Faits précis, écoute, puis plan d’amélioration', scores: { communication: 3, critical_thinking: 2, emotional_intelligence: 1 } },
        { text: 'Directement, sans détour', scores: { leadership: 2 } },
        { text: 'Avec beaucoup de précautions', scores: { emotional_intelligence: 2 } },
        { text: 'En vous appuyant sur la procédure RH', scores: { rigor: 2 } },
      ],
    },
    {
      text: 'Aimez-vous accompagner la montée en compétence des autres ?',
      type: 'yes_no',
      category: 'leadership',
      options: [
        { text: 'Oui, beaucoup', scores: { leadership: 2, emotional_intelligence: 2, teamwork: 2 } },
        { text: 'Modérément', scores: { teamwork: 1 } },
      ],
    },
    {
      text: 'Vous devez déployer une nouvelle politique impopulaire. Vous :',
      type: 'situation',
      category: 'leadership',
      options: [
        { text: 'Expliquez le sens, écoutez les craintes, accompagnez', scores: { communication: 3, emotional_intelligence: 2, leadership: 2 } },
        { text: 'Appliquez et assumez la décision', scores: { leadership: 2, rigor: 1 } },
        { text: 'Négociez des ajustements', scores: { adaptability: 2, communication: 1 } },
        { text: 'Reportez tant que l’adhésion est faible', scores: { critical_thinking: 1 } },
      ],
    },
    {
      text: 'Je traite les données personnelles avec une rigueur absolue.',
      type: 'scale',
      category: 'rigor',
      options: [
        { text: '1', scores: { adaptability: 1 } },
        { text: '2', scores: { communication: 1 } },
        { text: '3', scores: { rigor: 1 } },
        { text: '4', scores: { rigor: 2, critical_thinking: 1 } },
        { text: '5', scores: { rigor: 3, critical_thinking: 2 } },
      ],
    },
    {
      text: 'Un manager vous demande un avis qui contredit le sien. Vous :',
      type: 'multiple_choice',
      category: 'critical_thinking',
      options: [
        { text: 'Donnez un avis argumenté et honnête', scores: { critical_thinking: 3, communication: 2 } },
        { text: 'Nuancez pour préserver la relation', scores: { emotional_intelligence: 2 } },
        { text: 'Vous alignez sur sa position', scores: { teamwork: 1 } },
        { text: 'Proposez de creuser avec des données', scores: { critical_thinking: 2, problem_solving: 1 } },
      ],
    },
    {
      text: 'Je favorise activement la cohésion et le bien-être d’équipe.',
      type: 'yes_no',
      category: 'teamwork',
      options: [
        { text: 'Oui', scores: { teamwork: 3, emotional_intelligence: 1, leadership: 1 } },
        { text: 'Pas prioritairement', scores: { rigor: 1 } },
      ],
    },
  ],
};

// Normalise et enrichit les questions (ids stables, order, is_active).
function buildQuestionnaireQuestions() {
  const map = {};
  Object.entries(QUESTIONS).forEach(([questionnaireId, list]) => {
    map[questionnaireId] = list.map((q, index) => ({
      id: `${questionnaireId}_q${index + 1}`,
      questionnaire_id: questionnaireId,
      order: index + 1,
      is_active: true,
      ...q,
    }));
  });
  return map;
}

export const QUESTIONS_BY_QUESTIONNAIRE = buildQuestionnaireQuestions();

export const ALL_QUESTIONS = Object.values(QUESTIONS_BY_QUESTIONNAIRE).flat();

export function getQuestionnaire(idOrCode) {
  return (
    QUESTIONNAIRES.find((q) => q.id === idOrCode || q.code === idOrCode) || null
  );
}

export function getQuestionnaireForDepartment(departmentIdOrCode) {
  const dept = DEPARTMENTS.find(
    (d) => d.id === departmentIdOrCode || d.code === departmentIdOrCode
  );
  if (!dept) return QUESTIONNAIRES[0];
  return getQuestionnaire(dept.questionnaire_id) || QUESTIONNAIRES[0];
}

export function getQuestions(questionnaireId) {
  return QUESTIONS_BY_QUESTIONNAIRE[questionnaireId] || [];
}

// Compat : profils par défaut réutilisés par les vues résultats.
export const defaultProfiles = profileCatalog;
