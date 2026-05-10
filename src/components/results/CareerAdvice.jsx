export default function CareerAdvice({ careers = [], advice = [] }) {
  return (
    <div className="space-y-8">
      {careers?.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border">
          <h3 className="font-semibold mb-4">Métiers suggérés</h3>
          <div className="flex flex-wrap gap-2">
            {careers.map((c) => (
              <span
                key={c}
                className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {advice?.length > 0 && (
        <div className="p-6 rounded-2xl bg-card border">
          <h3 className="font-semibold mb-4">Conseils personnalisés</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {advice.map((line) => (
              <li key={line} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
