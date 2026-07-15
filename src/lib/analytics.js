// Fonctions d'agrégation pour les tableaux de bord (KPIs, moyennes, distributions).

import { SKILL_KEYS, SKILL_LABELS } from '@/config/skills';
import { averageScore } from '@/lib/scoring';

// Moyenne de chaque compétence sur un ensemble de résultats.
export function skillAverages(results = []) {
  const totals = SKILL_KEYS.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
  const counts = SKILL_KEYS.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
  results.forEach((r) => {
    SKILL_KEYS.forEach((k) => {
      const v = r.scores?.[k];
      if (typeof v === 'number') {
        totals[k] += v;
        counts[k] += 1;
      }
    });
  });
  return SKILL_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: counts[k] ? Math.round(totals[k] / counts[k]) : 0 }),
    {}
  );
}

// Renvoie les données prêtes pour un BarChart des moyennes de compétences.
export function skillAveragesChartData(results = []) {
  const avgs = skillAverages(results);
  return SKILL_KEYS.map((k) => ({ key: k, name: SKILL_LABELS[k], value: avgs[k] }));
}

// KPIs d'une équipe / d'un département.
export function computeKpis(members = [], results = [], assignments = []) {
  const latestByEmployee = new Map();
  results.forEach((r) => {
    const existing = latestByEmployee.get(r.employee_id);
    if (!existing || new Date(r.created_at) > new Date(existing.created_at)) {
      latestByEmployee.set(r.employee_id, r);
    }
  });
  const latestResults = Array.from(latestByEmployee.values());

  const avgFit = latestResults.length
    ? Math.round(latestResults.reduce((acc, r) => acc + (r.department_fit ?? averageScore(r.scores)), 0) / latestResults.length)
    : 0;

  const avgGlobal = latestResults.length
    ? Math.round(latestResults.reduce((acc, r) => acc + averageScore(r.scores), 0) / latestResults.length)
    : 0;

  const pending = assignments.filter((a) => a.status !== 'completed').length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const completionRate = assignments.length ? Math.round((completed / assignments.length) * 100) : 0;
  const evaluatedCount = latestByEmployee.size;
  const coverage = members.length ? Math.round((evaluatedCount / members.length) * 100) : 0;

  return {
    memberCount: members.length,
    evaluatedCount,
    coverage,
    avgFit,
    avgGlobal,
    pending,
    completed,
    completionRate,
    latestResults,
  };
}

// Distribution des profils dominants.
export function profileDistribution(results = []) {
  const map = new Map();
  results.forEach((r) => {
    const name = r.profile_name || r.profile_code || 'Non défini';
    map.set(name, (map.get(name) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

// Classement des membres par adéquation (top / à accompagner).
export function rankByFit(members = [], latestResults = []) {
  const byEmployee = new Map(latestResults.map((r) => [r.employee_id, r]));
  return members
    .map((m) => {
      const r = byEmployee.get(m.id);
      return {
        ...m,
        fit: r?.department_fit ?? (r ? averageScore(r.scores) : null),
        global: r ? averageScore(r.scores) : null,
        profile_name: r?.profile_name ?? null,
        result_id: r?.id ?? null,
      };
    })
    .sort((a, b) => (b.fit ?? -1) - (a.fit ?? -1));
}
