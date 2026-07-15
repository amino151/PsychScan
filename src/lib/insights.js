// Générateur d'analyses à partir des scores de compétences d'une évaluation.
// Produit : forces, faiblesses, axes d'amélioration, suggestions de formation,
// recommandations de carrière et insights spécifiques au département.

import { SKILL_LABELS } from '@/config/skills';
import { getDepartment } from '@/config/departments';
import { trainingForSkill } from '@/config/trainings';
import { getTopDimensions, getBottomDimensions, averageScore } from '@/lib/scoring';

const STRONG_THRESHOLD = 65;
const WEAK_THRESHOLD = 50;

function label(key) {
  return SKILL_LABELS[key] || key;
}

export function generateInsights(scores, profile, department) {
  const dept = getDepartment(department);
  const top = getTopDimensions(scores, 4).filter((d) => d.value >= STRONG_THRESHOLD);
  const bottom = getBottomDimensions(scores, 3).filter((d) => d.value < WEAK_THRESHOLD);
  const overall = averageScore(scores);

  const strengths = (top.length ? top : getTopDimensions(scores, 3)).map(
    (d) => `${label(d.name)} (${Math.round(d.value)}%)`
  );

  const weaknesses = (bottom.length ? bottom : getBottomDimensions(scores, 2)).map(
    (d) => `${label(d.name)} (${Math.round(d.value)}%)`
  );

  const improvementAreas = (bottom.length ? bottom : getBottomDimensions(scores, 2)).map(
    (d) => `Renforcer « ${label(d.name)} » pour atteindre le niveau attendu.`
  );

  const trainingSuggestions = (bottom.length ? bottom : getBottomDimensions(scores, 2))
    .map((d) => trainingForSkill(d.name))
    .filter(Boolean);

  // Insights spécifiques au département : écart aux compétences clés attendues.
  const departmentInsights = [];
  if (dept) {
    const keySkills = Object.keys(dept.key_skills || {});
    keySkills.forEach((skill) => {
      const value = Math.round(scores?.[skill] ?? 0);
      if (value >= STRONG_THRESHOLD) {
        departmentInsights.push({
          skill,
          level: 'fort',
          message: `Atout clé pour ${dept.name} : ${label(skill)} (${value}%).`,
        });
      } else if (value < WEAK_THRESHOLD) {
        departmentInsights.push({
          skill,
          level: 'à développer',
          message: `Compétence critique de ${dept.name} à renforcer : ${label(skill)} (${value}%).`,
        });
      } else {
        departmentInsights.push({
          skill,
          level: 'satisfaisant',
          message: `Niveau correct pour ${dept.name} : ${label(skill)} (${value}%).`,
        });
      }
    });
  }

  const fit = computeDepartmentFit(scores, dept);

  return {
    overall,
    strengths,
    weaknesses,
    improvementAreas,
    trainingSuggestions,
    careerRecommendations: profile?.recommended_careers || [],
    departmentInsights,
    departmentFit: fit,
    summary: buildSummary(profile, dept, overall, fit),
  };
}

// Score d'adéquation (0-100) entre le collaborateur et son département,
// pondéré par les compétences clés attendues.
export function computeDepartmentFit(scores, department) {
  const dept = typeof department === 'object' ? department : getDepartment(department);
  if (!dept?.key_skills) return averageScore(scores);
  const entries = Object.entries(dept.key_skills);
  const totalWeight = entries.reduce((acc, [, w]) => acc + w, 0) || 1;
  const weighted = entries.reduce((acc, [skill, weight]) => {
    return acc + (scores?.[skill] ?? 0) * weight;
  }, 0);
  return Math.round(weighted / totalWeight);
}

function buildSummary(profile, dept, overall, fit) {
  const profileName = profile?.name || 'Profil professionnel';
  const deptName = dept?.name;
  if (deptName) {
    return `${profileName} — score global ${overall}%, adéquation au poste (${deptName}) de ${fit}%.`;
  }
  return `${profileName} — score global de ${overall}%.`;
}
