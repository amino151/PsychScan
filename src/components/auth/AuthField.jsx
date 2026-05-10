import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AuthField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="bg-white/80 border-primary/20 focus-visible:ring-primary/40 transition-all duration-200"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

