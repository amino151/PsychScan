// Modular scoring engine with weighted dimensions and tie-breakers.

export const DIMENSIONS = [
  'introversion',
  'extraversion',
  'analytical',
  'creative',
  'emotional',
  'rational',
  'leadership',
  'collaboration',
  'adaptability',
  'communication',
  'discipline',
  'intuition',
];

export const DIMENSION_LABELS = {
  introversion: 'Introversion',
  extraversion: 'Extraversion',
  analytical: 'Analytique',
  creative: 'Créativité',
  emotional: 'Émotionnel',
  rational: 'Rationnel',
  leadership: 'Leadership',
  collaboration: 'Collaboration',
  adaptability: 'Adaptabilite',
  communication: 'Communication',
  discipline: 'Discipline',
  intuition: 'Intuition',
};

export const DIMENSION_COLORS = {
  introversion: '#6366F1',
  extraversion: '#0EA5E9',
  analytical: '#2563EB',
  creative: '#8B5CF6',
  emotional: '#EC4899',
  rational: '#475569',
  leadership: '#F97316',
  collaboration: '#14B8A6',
  adaptability: '#22C55E',
  communication: '#06B6D4',
  discipline: '#F59E0B',
  intuition: '#A855F7',
};

const QUESTION_TYPE_MULTIPLIER = {
  scale: 1.25,
  multiple_choice: 1,
  situation: 1.35,
  yes_no: 0.9,
};

const CATEGORY_TRAIT_BONUS = {
  introversion_extraversion: { communication: 0.25 },
  analytical_creative: { intuition: 0.2, discipline: 0.2 },
  emotional_rational: { communication: 0.35, adaptability: 0.2 },
  leadership_collaboration: { communication: 0.35, discipline: 0.2 },
  stress_management: { adaptability: 0.55, discipline: 0.35 },
};

function initializeScoreMap() {
  return DIMENSIONS.reduce((acc, dim) => ({ ...acc, [dim]: 0 }), {});
}

function applyOptionContribution(question, selectedOption) {
  const contribution = initializeScoreMap();
  if (!question || !selectedOption?.scores) return contribution;

  const typeMultiplier = QUESTION_TYPE_MULTIPLIER[question.type] || 1;
  const categoryBonus = CATEGORY_TRAIT_BONUS[question.category] || {};

  Object.entries(selectedOption.scores).forEach(([trait, value]) => {
    if (trait in contribution) contribution[trait] += value * typeMultiplier;
  });

  Object.entries(categoryBonus).forEach(([trait, weight]) => {
    if (trait in contribution) {
      const rawMagnitude = Object.values(selectedOption.scores).reduce((acc, n) => acc + n, 0);
      contribution[trait] += rawMagnitude * 0.1 * weight;
    }
  });

  return contribution;
}

function sumContribution(target, source) {
  DIMENSIONS.forEach((trait) => {
    target[trait] += source[trait] || 0;
  });
}

function scoreByAnswer(answers, questions) {
  const rawScores = initializeScoreMap();
  const expectedScores = initializeScoreMap();
  const minPossibleScores = initializeScoreMap();
  const maxPossibleScores = initializeScoreMap();
  const answeredQuestions = [];
  const questionById = new Map((questions || []).map((q) => [q.id, q]));

  answers.forEach((answer) => {
    const question = questionById.get(answer.question_id);
    if (!question?.options?.length) return;

    const selectedOption = question.options.find((option) => option.text === answer.answer);
    if (!selectedOption) return;

    answeredQuestions.push(question);

    const optionContributions = question.options.map((option) =>
      applyOptionContribution(question, option)
    );
    const selectedContribution = applyOptionContribution(question, selectedOption);
    sumContribution(rawScores, selectedContribution);

    DIMENSIONS.forEach((trait) => {
      const values = optionContributions.map((contrib) => contrib[trait] || 0);
      const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      expectedScores[trait] += avg;
      minPossibleScores[trait] += min;
      maxPossibleScores[trait] += max;
    });
  });

  // Balance each trait against what is statistically expected from the same answered questions.
  // This avoids over-rewarding traits that naturally collect more raw points.
  const balancedScores = initializeScoreMap();
  DIMENSIONS.forEach((trait) => {
    const min = minPossibleScores[trait];
    const max = maxPossibleScores[trait];
    const raw = rawScores[trait];
    const range = Math.max(max - min, 1e-6);

    // 0..100 score relative to feasible min/max for this exact questionnaire.
    const normalizedInRange = ((raw - min) / range) * 100;
    // Small pull toward expected midpoint to reduce deterministic dominance.
    const expectedMidpoint = ((expectedScores[trait] - min) / range) * 100;
    const fairnessAdjusted = normalizedInRange * 0.8 + expectedMidpoint * 0.2;
    balancedScores[trait] = Math.max(0, Math.min(100, fairnessAdjusted));
  });

  return { scoreMap: balancedScores, answeredQuestions };
}

export function calculateScores(answers, questions) {
  return scoreByAnswer(answers, questions).scoreMap;
}

export function normalizeScores(scores) {
  const values = Object.values(scores);
  const alreadyPercentageLike = values.every((value) => value >= 0 && value <= 100);
  if (alreadyPercentageLike) {
    return Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, Math.round(value)])
    );
  }

  const maxScore = Math.max(...values, 1);
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [key, Math.round((value / maxScore) * 100)])
  );
}

function computeProfileScore(profile, scores) {
  const weights = profile?.dominant_traits || {};
  const weightedTotal = Object.entries(weights).reduce((acc, [trait, weight]) => {
    const traitValue = scores[trait] || 0;
    return acc + traitValue * weight;
  }, 0);
  const totalWeight = Math.max(
    Object.values(weights).reduce((acc, weight) => acc + weight, 0),
    1
  );
  return weightedTotal / totalWeight;
}

function tieBreaker(a, b, scores) {
  const sortedTraits = Object.entries(scores).sort(([, va], [, vb]) => vb - va);
  const topTrait = sortedTraits[0]?.[0];
  const secondTrait = sortedTraits[1]?.[0];
  const aWeights = a.profile?.dominant_traits || {};
  const bWeights = b.profile?.dominant_traits || {};

  const topPreference =
    (aWeights[topTrait] || 0) - (bWeights[topTrait] || 0) ||
    (aWeights[secondTrait] || 0) - (bWeights[secondTrait] || 0);
  if (topPreference !== 0) return topPreference;

  const balancingTraits = ['adaptability', 'communication', 'discipline', 'intuition'];
  const balancingDelta = balancingTraits.reduce(
    (acc, trait) => acc + ((a.profile?.dominant_traits?.[trait] || 0) - (b.profile?.dominant_traits?.[trait] || 0)),
    0
  );
  if (balancingDelta !== 0) return balancingDelta;

  return a.profile.name.localeCompare(b.profile.name, 'fr');
}

export function matchProfile(scores, profiles) {
  if (!profiles?.length) return null;

  const ranked = profiles
    .map((profile) => ({ profile, score: computeProfileScore(profile, scores) }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 1) return ranked[0].profile;

  const [first, second] = ranked;
  // If close scores (<= 2.5 points), resolve with trait-sensitive tie-break.
  if (Math.abs(first.score - second.score) <= 2.5) {
    const winner = tieBreaker(first, second, scores) >= 0 ? first : second;
    return winner.profile;
  }

  return first.profile;
}

export function getTopDimensions(scores, count = 4) {
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([name, value]) => ({ name, value }));
}