import { Badge } from '@/components/ui/badge';
import { getRole } from '@/config/roles';
import { getDepartment } from '@/config/departments';

export function RoleBadge({ role }) {
  const def = getRole(role);
  return (
    <Badge
      className="border-0 text-white"
      style={{ backgroundColor: def.color }}
      title={def.description}
    >
      {def.label}
    </Badge>
  );
}

export function DepartmentBadge({ departmentId, code }) {
  const dept = getDepartment(departmentId || code);
  if (!dept) {
    return <Badge variant="secondary">Non affecté</Badge>;
  }
  return (
    <Badge className="border-0 text-white" style={{ backgroundColor: dept.color }}>
      {dept.name}
    </Badge>
  );
}

const FIT_STYLES = [
  { min: 75, label: 'Excellente', color: '#16a34a' },
  { min: 60, label: 'Bonne', color: '#0ea5e9' },
  { min: 45, label: 'Moyenne', color: '#f59e0b' },
  { min: 0, label: 'À renforcer', color: '#ef4444' },
];

export function FitBadge({ value }) {
  const v = Math.round(value ?? 0);
  const style = FIT_STYLES.find((s) => v >= s.min) || FIT_STYLES[FIT_STYLES.length - 1];
  return (
    <Badge className="border-0 text-white" style={{ backgroundColor: style.color }}>
      {style.label} · {v}%
    </Badge>
  );
}
