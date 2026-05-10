import { Progress } from '@/components/ui/progress';

export default function ProgressBar({ current, total }) {
  const pct = total ? Math.min(100, Math.round((current / total) * 100)) : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          Question {current} / {total}
        </span>
        <span className="font-semibold text-primary">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2.5 bg-primary/10 [&>div]:bg-brand-gradient" />
    </div>
  );
}
