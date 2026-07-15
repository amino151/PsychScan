import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import CrudManager from '@/components/shared/CrudManager';
import { appApi } from '@/services/appApi';

const TYPE_OPTIONS = [
  { value: 'training', label: 'Formation' },
  { value: 'career', label: 'Carrière' },
  { value: 'development', label: 'Développement' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Basse' },
  { value: 'medium', label: 'Moyenne' },
  { value: 'high', label: 'Haute' },
];

const PRIORITY_COLOR = { low: '#64748b', medium: '#f59e0b', high: '#ef4444' };

export default function RecommendationsManager() {
  const queryClient = useQueryClient();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['all-recommendations'],
    queryFn: () => appApi.entities.Recommendation.list('-created_at'),
    initialData: [],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => appApi.entities.Employee.list('full_name'),
    initialData: [],
  });

  const employeeMap = new Map(employees.map((e) => [e.id, e.full_name]));
  const employeeOptions = employees.map((e) => ({ value: e.id, label: e.full_name }));

  const fields = [
    { name: 'employee_id', label: 'Collaborateur', type: 'select', options: employeeOptions, required: true },
    { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, default: 'development', required: true },
    { name: 'title', label: 'Titre', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'priority', label: 'Priorité', type: 'select', options: PRIORITY_OPTIONS, default: 'medium' },
  ];

  const columns = [
    { key: 'employee_id', label: 'Collaborateur', render: (r) => employeeMap.get(r.employee_id) || '—' },
    { key: 'title', label: 'Recommandation' },
    { key: 'type', label: 'Type', render: (r) => <Badge variant="secondary" className="text-xs">{r.type}</Badge> },
    {
      key: 'priority',
      label: 'Priorité',
      render: (r) => (
        <Badge className="border-0 text-white text-xs capitalize" style={{ backgroundColor: PRIORITY_COLOR[r.priority] || '#64748b' }}>
          {r.priority}
        </Badge>
      ),
    },
  ];

  async function handleSave(payload, editing) {
    if (editing) {
      await appApi.entities.Recommendation.update(editing.id, payload);
      toast.success('Recommandation mise à jour');
    } else {
      await appApi.entities.Recommendation.create(payload);
      toast.success('Recommandation créée');
    }
    queryClient.invalidateQueries({ queryKey: ['all-recommendations'] });
  }

  async function handleDelete(id) {
    await appApi.entities.Recommendation.remove(id);
    toast.success('Recommandation supprimée');
    queryClient.invalidateQueries({ queryKey: ['all-recommendations'] });
  }

  return (
    <CrudManager
      title="Recommandations"
      description="Recommandations de formation, développement et évolution de carrière."
      rows={recommendations}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
