import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import CrudManager from '@/components/shared/CrudManager';
import { appApi } from '@/services/appApi';
import { SKILLS } from '@/config/skills';

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planifiée' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'done', label: 'Terminée' },
];

export default function TrainingPlansManager() {
  const queryClient = useQueryClient();

  const { data: plans = [] } = useQuery({
    queryKey: ['all-trainings'],
    queryFn: () => appApi.entities.TrainingPlan.list('-start_date'),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => appApi.entities.Employee.list('full_name'),
    initialData: [],
  });

  const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));
  const employeeOptions = employees.map((e) => ({ value: e.id, label: e.full_name }));
  const skillOptions = SKILLS.map((s) => ({ value: s.key, label: s.label }));

  const fields = [
    { name: 'employee_id', label: 'Collaborateur', type: 'select', options: employeeOptions, required: true },
    { name: 'title', label: 'Intitulé de la formation', required: true },
    { name: 'skill', label: 'Compétence visée', type: 'select', options: skillOptions },
    { name: 'status', label: 'Statut', type: 'select', options: STATUS_OPTIONS, default: 'planned' },
    { name: 'start_date', label: 'Date de début', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const columns = [
    { key: 'employee_id', label: 'Collaborateur', render: (r) => employeeMap.get(r.employee_id) || '—' },
    { key: 'title', label: 'Formation' },
    { key: 'status', label: 'Statut', render: (r) => <Badge variant="secondary" className="capitalize">{r.status}</Badge> },
  ];

  async function handleSave(payload, editing) {
    if (editing) {
      await appApi.entities.TrainingPlan.update(editing.id, payload);
      toast.success('Plan de formation mis à jour');
    } else {
      await appApi.entities.TrainingPlan.create(payload);
      toast.success('Plan de formation créé');
    }
    queryClient.invalidateQueries({ queryKey: ['all-trainings'] });
  }

  async function handleDelete(id) {
    await appApi.entities.TrainingPlan.remove(id);
    toast.success('Plan supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-trainings'] });
  }

  return (
    <CrudManager
      title="Plans de formation"
      description="Planifiez et suivez les formations des collaborateurs."
      rows={plans}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
