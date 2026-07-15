import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudManager from '@/components/shared/CrudManager';
import { RoleBadge, DepartmentBadge } from '@/components/shared/Badges';
import { appApi } from '@/services/appApi';
import { ROLE_LIST, roleLabel } from '@/config/roles';
import { DEPARTMENTS } from '@/config/departments';

export default function EmployeesManager() {
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => appApi.entities.Employee.list('full_name'),
    initialData: [],
  });

  const managers = employees.filter((e) => ['manager', 'hr_admin', 'super_admin'].includes(e.role));

  const roleOptions = ROLE_LIST.map((r) => ({ value: r, label: roleLabel(r) }));
  const deptOptions = DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }));
  const managerOptions = managers.map((m) => ({ value: m.id, label: `${m.full_name} (${roleLabel(m.role)})` }));

  const fields = [
    { name: 'full_name', label: 'Nom complet', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'role', label: 'Rôle', type: 'select', options: roleOptions, required: true, default: 'employee' },
    { name: 'department_id', label: 'Département', type: 'select', options: deptOptions },
    { name: 'manager_id', label: 'Manager', type: 'select', options: managerOptions },
    { name: 'position', label: 'Poste' },
    { name: 'hire_date', label: "Date d'embauche", type: 'date' },
  ];

  const columns = [
    { key: 'full_name', label: 'Nom' },
    { key: 'email', label: 'Email', render: (r) => <span className="font-mono text-xs">{r.email}</span> },
    { key: 'role', label: 'Rôle', render: (r) => <RoleBadge role={r.role} /> },
    { key: 'department_id', label: 'Département', render: (r) => <DepartmentBadge departmentId={r.department_id} /> },
    { key: 'position', label: 'Poste' },
  ];

  async function handleSave(payload, editing) {
    const clean = { ...payload };
    if (!clean.department_id) clean.department_id = null;
    if (!clean.manager_id) clean.manager_id = null;
    if (editing) {
      await appApi.entities.Employee.update(editing.id, clean);
      toast.success('Employé mis à jour');
    } else {
      await appApi.entities.Employee.create(clean);
      toast.success('Employé créé');
    }
    queryClient.invalidateQueries({ queryKey: ['all-employees'] });
  }

  async function handleDelete(id) {
    await appApi.entities.Employee.remove(id);
    toast.success('Employé supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-employees'] });
  }

  return (
    <CrudManager
      title="Employés & managers"
      description="Créez, modifiez et affectez les collaborateurs à un département et un manager."
      rows={employees}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
