import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudManager from '@/components/shared/CrudManager';
import { appApi } from '@/services/appApi';

export default function DepartmentsManager() {
  const queryClient = useQueryClient();

  const { data: departments = [] } = useQuery({
    queryKey: ['all-departments'],
    queryFn: () => appApi.entities.Department.list('name'),
    initialData: [],
  });

  const fields = [
    { name: 'name', label: 'Nom du département', required: true },
    { name: 'code', label: 'Code technique', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'color', label: 'Couleur (hex)', default: '#2563EB' },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Département',
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
          {r.name}
        </span>
      ),
    },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'description', label: 'Description', render: (r) => <span className="text-sm text-muted-foreground">{r.description}</span> },
  ];

  async function handleSave(payload, editing) {
    if (editing) {
      await appApi.entities.Department.update(editing.id, payload);
      toast.success('Département mis à jour');
    } else {
      await appApi.entities.Department.create(payload);
      toast.success('Département créé');
    }
    queryClient.invalidateQueries({ queryKey: ['all-departments'] });
  }

  async function handleDelete(id) {
    await appApi.entities.Department.remove(id);
    toast.success('Département supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-departments'] });
  }

  return (
    <CrudManager
      title="Départements"
      description="Gérez les départements du centre d'appels."
      rows={departments}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
