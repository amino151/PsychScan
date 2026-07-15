import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatCard({ title, value, icon: Icon, hint, accent = '#2563EB' }) {
  return (
    <Card className="border-white/45 bg-white/85 shadow-panel">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? (
          <div className="rounded-lg p-2" style={{ backgroundColor: `${accent}1a` }}>
            <Icon className="w-4 h-4" style={{ color: accent }} />
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold" style={{ color: accent }}>
          {value}
        </p>
        {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
