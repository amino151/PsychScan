import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SKILLS, SKILL_LABELS, SKILL_COLORS } from '@/config/skills';

// Barres horizontales de compétences pour un jeu de scores unique.
export default function SkillBars({ scores = {}, skills, height = 320 }) {
  const skillList = skills && skills.length ? skills : SKILLS.map((s) => s.key);
  const data = skillList
    .map((key) => ({
      key,
      name: SKILL_LABELS[key] || key,
      value: Math.round(scores?.[key] ?? 0),
      fill: SKILL_COLORS[key] || '#6366f1',
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="w-full min-w-0" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.12)" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: '#475569' }} />
          <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
