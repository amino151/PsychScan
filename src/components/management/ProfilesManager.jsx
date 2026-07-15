import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudManager from '@/components/shared/CrudManager';
import { appApi } from '@/services/appApi';

const listFormat = (val) => (Array.isArray(val) ? val.join(', ') : val ?? '');
const listParse = (val) =>
  String(val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export default function ProfilesManager() {
  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['all-psych-profiles'],
    queryFn: () => appApi.entities.PsychProfile.list('name'),
    initialData: [],
  });

  const fields = [
    { name: 'name', label: 'Nom du profil', required: true },
    { name: 'code', label: 'Code technique', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'strengths', label: 'Forces (séparées par des virgules)', type: 'textarea', format: listFormat, parse: listParse },
    { name: 'weaknesses', label: 'Faiblesses (virgules)', type: 'textarea', format: listFormat, parse: listParse },
    { name: 'recommended_careers', label: 'Carrières recommandées (virgules)', type: 'textarea', format: listFormat, parse: listParse },
    {
      name: 'dominant_traits',
      label: 'Traits dominants (JSON : { "communication": 3 })',
      type: 'textarea',
      format: (val) => JSON.stringify(val ?? {}, null, 2),
      parse: (val) => {
        try {
          return typeof val === 'string' ? JSON.parse(val) : val;
        } catch {
          throw new Error('JSON des traits dominants invalide.');
        }
      },
    },
    { name: 'color', label: 'Couleur (hex)', default: '#2563EB' },
  ];

  const columns = [
    {
      key: 'name',
      label: 'Profil',
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
          {r.name}
        </span>
      ),
    },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'description', label: 'Description', render: (r) => <span className="text-sm text-muted-foreground line-clamp-2">{r.description}</span> },
  ];

  async function handleSave(payload, editing) {
    try {
      if (editing) {
        await appApi.entities.PsychProfile.update(editing.id, payload);
        toast.success('Profil mis à jour');
      } else {
        await appApi.entities.PsychProfile.create(payload);
        toast.success('Profil créé');
      }
      queryClient.invalidateQueries({ queryKey: ['all-psych-profiles'] });
    } catch (err) {
      toast.error(err.message || 'Erreur');
      throw err;
    }
  }

  async function handleDelete(id) {
    await appApi.entities.PsychProfile.remove(id);
    toast.success('Profil supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-psych-profiles'] });
  }

  return (
    <CrudManager
      title="Profils psychologiques"
      description="Référentiel des profils professionnels et de leurs pondérations de compétences."
      rows={profiles}
      columns={columns}
      fields={fields}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
