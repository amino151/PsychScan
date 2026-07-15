import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { SKILLS, SKILL_LABELS } from '@/config/skills';

// Radar de compétences générique.
// `series` : [{ key, name, scores, color }] pour comparer plusieurs entités.
// `skills` : sous-ensemble de clés de compétences (défaut : toutes).
export default function SkillRadar({ series = [], skills, height = 320 }) {
  const skillList = (skills && skills.length ? skills : SKILLS.map((s) => s.key));

  const data = skillList.map((key) => {
    const row = { skill: SKILL_LABELS[key] || key };
    series.forEach((s) => {
      row[s.key] = Math.round(s.scores?.[key] ?? 0);
    });
    return row;
  });

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="rgba(37,99,235,0.18)" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#334155' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
          <Tooltip />
          {series.length > 1 ? <Legend /> : null}
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color || '#2563EB'}
              fill={s.color || '#2563EB'}
              fillOpacity={0.35}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
