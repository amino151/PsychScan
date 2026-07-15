import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudManager from '@/components/shared/CrudManager';
import { appApi } from '@/services/appApi';

export default function SettingsManager() {
  const queryClient = useQueryClient();

  const { data: settings = [] } = useQuery({
    queryKey: ['all-settings'],
    queryFn: () => appApi.entities.Setting.list('label'),
    initialData: [],
  });

  const fields = [
    { name: 'label', label: 'Libellé', required: true },
    { name: 'key', label: 'Clé technique', required: true },
    { name: 'value', label: 'Valeur', required: true },
  ];

  const columns = [
    { key: 'label', label: 'Paramètre' },
    { key: 'key', label: 'Clé', render: (r) => <span className="font-mono text-xs">{r.key}</span> },
    { key: 'value', label: 'Valeur', render: (r) => <span className="font-medium">{r.value}</span> },
  ];

  async function handleSave(payload, editing) {
    if (editing) {
      await appApi.entities.Setting.update(editing.id, payload);
      toast.success('Paramètre mis à jour');
    } else {
      await appApi.entities.Setting.create(payload);
      toast.success('Paramètre créé');
    }
    queryClient.invalidateQueries({ queryKey: ['all-settings'] });
  }

  async function handleDelete(id) {
    await appApi.entities.Setting.remove(id);
    toast.success('Paramètre supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-settings'] });
  }

  return (
    <CrudManager
      title="Paramètres système"
      description="Configuration globale de la plateforme."
      rows={settings}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
