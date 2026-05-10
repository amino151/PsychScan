import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DIMENSION_LABELS, DIMENSION_COLORS } from '@/lib/scoring';

export default function ScoreBars({ scores = {} }) {
  const data = Object.entries(DIMENSION_LABELS).map(([key, label]) => ({
    name: label,
    value: scores[key] ?? 0,
    fill: DIMENSION_COLORS[key] || '#6366f1',
  }));

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <defs>
            <linearGradient id="barsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="65%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.15)" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis type="category" dataKey="name" width={95} tick={{ fontSize: 11, fill: '#475569' }} />
          <Tooltip formatter={(v) => [`${v}`, 'Score']} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="url(#barsGradient)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
