// Moteur d'évaluation configurable par compétences.
// Les dimensions de scoring sont les compétences définies dans config/skills.js,
// mais le moteur accepte n'importe quelle liste de dimensions pour rester générique.

import { SKILL_KEYS, SKILL_LABELS, SKILL_COLORS } from '@/config/skills';

export const DIMENSIONS = SKILL_KEYS;
export const DIMENSION_LABELS = SKILL_LABELS;
export const DIMENSION_COLORS = SKILL_COLORS;

const QUESTION_TYPE_MULTIPLIER = {
  scale: 1.25,
  multiple_choice: 1,
  situation: 1.35,
  yes_no: 0.9,
};

function resolveDimensions(dimensions) {
  return Array.isArray(dimensions) && dimensions.length ? dimensions : SKILL_KEYS;
}

function initializeScoreMap(dimensions) {
  return resolveDimensions(dimensions).reduce((acc, dim) => ({ ...acc, [dim]: 0 }), {});
}

function applyOptionContribution(question, selectedOption, dimensions) {
  const contribution = initializeScoreMap(dimensions);
  if (!question || !selectedOption?.scores) return contribution;

  const typeMultiplier = QUESTION_TYPE_MULTIPLIER[question.type] || 1;

  Object.entries(selectedOption.scores).forEach(([trait, value]) => {
    if (trait in contribution) contribution[trait] += value * typeMultiplier;
  });

  return contribution;
}

function sumContribution(target, source, dimensions) {
  resolveDimensions(dimensions).forEach((trait) => {
    target[trait] += source[trait] || 0;
  });
}

function scoreByAnswer(answers, questions, dimensions) {
  const dims = resolveDimensions(dimensions);
  const rawScores = initializeScoreMap(dims);
  const expectedScores = initializeScoreMap(dims);
  const minPossibleScores = initializeScoreMap(dims);
  const maxPossibleScores = initializeScoreMap(dims);
  const answeredQuestions = [];
  const questionById = new Map((questions || []).map((q) => [q.id, q]));

  (answers || []).forEach((answer) => {
    const question = questionById.get(answer.question_id);
    if (!question?.options?.length) return;

    const selectedOption = question.options.find((option) => option.text === answer.answer);
    if (!selectedOption) return;

    answeredQuestions.push(question);

    const optionContributions = question.options.map((option) =>
      applyOptionContribution(question, option, dims)
    );
    const selectedContribution = applyOptionContribution(question, selectedOption, dims);
    sumContribution(rawScores, selectedContribution, dims);

    dims.forEach((trait) => {
      const values = optionContributions.map((contrib) => contrib[trait] || 0);
      const avg = values.reduce((acc, value) => acc + value, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      expectedScores[trait] += avg;
      minPossibleScores[trait] += min;
      maxPossibleScores[trait] += max;
    });
  });

  // Normalisation min/max relative au questionnaire réellement répondu,
  // avec un léger recentrage vers la moyenne attendue pour éviter les dominances mécaniques.
  const balancedScores = initializeScoreMap(dims);
  dims.forEach((trait) => {
    const min = minPossibleScores[trait];
    const max = maxPossibleScores[trait];
    const raw = rawScores[trait];
    const range = Math.max(max - min, 1e-6);

    const normalizedInRange = ((raw - min) / range) * 100;
    const expectedMidpoint = ((expectedScores[trait] - min) / range) * 100;
    const fairnessAdjusted = normalizedInRange * 0.8 + expectedMidpoint * 0.2;
    balancedScores[trait] = Math.max(0, Math.min(100, fairnessAdjusted));
  });

  return { scoreMap: balancedScores, answeredQuestions };
}

export function calculateScores(answers, questions, dimensions) {
  return scoreByAnswer(answers, questions, dimensions).scoreMap;
}

export function normalizeScores(scores) {
  const values = Object.values(scores);
  if (!values.length) return {};
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

  return a.profile.name.localeCompare(b.profile.name, 'fr');
}

export function matchProfile(scores, profiles) {
  if (!profiles?.length) return null;

  const ranked = profiles
    .map((profile) => ({ profile, score: computeProfileScore(profile, scores) }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 1) return ranked[0].profile;

  const [first, second] = ranked;
  if (Math.abs(first.score - second.score) <= 2.5) {
    const winner = tieBreaker(first, second, scores) >= 0 ? first : second;
    return winner.profile;
  }

  return first.profile;
}

export function getTopDimensions(scores, count = 4) {
  return Object.entries(scores || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, count)
    .map(([name, value]) => ({ name, value }));
}

export function getBottomDimensions(scores, count = 3) {
  return Object.entries(scores || {})
    .sort(([, a], [, b]) => a - b)
    .slice(0, count)
    .map(([name, value]) => ({ name, value }));
}

export function averageScore(scores) {
  const values = Object.values(scores || {});
  if (!values.length) return 0;
  return Math.round(values.reduce((acc, v) => acc + v, 0) / values.length);
}
