import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DIMENSION_LABELS, DIMENSION_COLORS } from '@/lib/scoring';

export default function ScoreRadar({ scores = {} }) {
  const data = Object.entries(DIMENSION_LABELS).map(([key, label]) => ({
    dimension: label,
    value: scores[key] ?? 0,
    fill: DIMENSION_COLORS[key] || '#6366f1',
  }));

  return (
    <div className="h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data}>
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.85} />
              <stop offset="55%" stopColor="#8B5CF6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(37,99,235,0.18)" />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: '#334155' }} />
          <Tooltip formatter={(value) => [`${value}`, 'Niveau']} />
          <Radar name="Score" dataKey="value" stroke="#4338CA" fill="url(#radarGradient)" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
