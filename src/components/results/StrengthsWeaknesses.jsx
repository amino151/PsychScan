export default function StrengthsWeaknesses({ strengths = [], weaknesses = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-card border">
        <h3 className="font-semibold mb-4 text-emerald-700 dark:text-emerald-400">Points forts</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {strengths.length === 0 && <li>Aucune donnée</li>}
          {strengths.map((s) => (
            <li key={s} className="flex gap-2">
              <span className="text-emerald-600 dark:text-emerald-500">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 rounded-2xl bg-card border">
        <h3 className="font-semibold mb-4 text-amber-700 dark:text-amber-400">Axes de progression</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {weaknesses.length === 0 && <li>Aucune donnée</li>}
          {weaknesses.map((w) => (
            <li key={w} className="flex gap-2">
              <span className="text-amber-600 dark:text-amber-500">•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
