import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import CrudManager from '@/components/shared/CrudManager';
import { Badge } from '@/components/ui/badge';
import { appApi } from '@/services/appApi';
import { DEPARTMENTS, departmentName } from '@/config/departments';
import { SKILLS } from '@/config/skills';

const TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Choix multiple' },
  { value: 'scale', label: 'Échelle' },
  { value: 'yes_no', label: 'Oui / Non' },
  { value: 'situation', label: 'Mise en situation' },
];

function QuestionsManager({ questionnaireId }) {
  const queryClient = useQueryClient();
  const queryKey = ['questions', questionnaireId];

  const { data: questions = [] } = useQuery({
    queryKey,
    queryFn: () => appApi.entities.Question.filter({ questionnaire_id: questionnaireId }, 'order'),
    enabled: Boolean(questionnaireId),
    initialData: [],
  });

  const categoryOptions = SKILLS.map((s) => ({ value: s.key, label: s.label }));

  const fields = [
    { name: 'text', label: 'Intitulé de la question', type: 'textarea', required: true },
    { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true, default: 'multiple_choice' },
    { name: 'category', label: 'Compétence principale', type: 'select', options: categoryOptions, required: true },
    { name: 'order', label: 'Ordre', type: 'number' },
    {
      name: 'options',
      label: 'Options (JSON : [{ "text": "...", "scores": { "communication": 2 } }])',
      type: 'textarea',
      format: (val) => JSON.stringify(val ?? [], null, 2),
      parse: (val) => {
        try {
          return typeof val === 'string' ? JSON.parse(val) : val;
        } catch {
          throw new Error('JSON des options invalide.');
        }
      },
    },
  ];

  const columns = [
    { key: 'order', label: '#', render: (r) => r.order ?? '—' },
    { key: 'text', label: 'Question', render: (r) => <span className="text-sm">{r.text}</span> },
    { key: 'type', label: 'Type', render: (r) => <Badge variant="secondary" className="text-xs">{r.type}</Badge> },
    { key: 'category', label: 'Compétence' },
    { key: 'options', label: 'Options', render: (r) => (r.options?.length ?? 0) },
  ];

  async function handleSave(payload, editing) {
    try {
      const clean = { ...payload, questionnaire_id: questionnaireId, order: Number(payload.order) || 0 };
      if (editing) {
        await appApi.entities.Question.update(editing.id, clean);
        toast.success('Question mise à jour');
      } else {
        await appApi.entities.Question.create(clean);
        toast.success('Question créée');
      }
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l’enregistrement');
      throw err;
    }
  }

  async function handleDelete(id) {
    await appApi.entities.Question.remove(id);
    toast.success('Question supprimée');
    queryClient.invalidateQueries({ queryKey });
  }

  return (
    <div className="mt-6">
      <CrudManager
        title="Questions du questionnaire"
        rows={questions}
        columns={columns}
        fields={fields}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default function QuestionnairesManager() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState('');

  const { data: questionnaires = [] } = useQuery({
    queryKey: ['all-questionnaires'],
    queryFn: () => appApi.entities.Questionnaire.list('title'),
    initialData: [],
  });

  useEffect(() => {
    if (!selected && questionnaires.length) setSelected(questionnaires[0].id);
  }, [questionnaires, selected]);

  const deptOptions = DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }));

  const fields = [
    { name: 'title', label: 'Titre', required: true },
    { name: 'code', label: 'Code technique', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'department_id', label: 'Département', type: 'select', options: deptOptions, required: true },
  ];

  const columns = [
    { key: 'title', label: 'Questionnaire' },
    { key: 'department_id', label: 'Département', render: (r) => departmentName(r.department_id) },
    { key: 'code', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
  ];

  async function handleSave(payload, editing) {
    if (editing) {
      await appApi.entities.Questionnaire.update(editing.id, payload);
      toast.success('Questionnaire mis à jour');
    } else {
      await appApi.entities.Questionnaire.create({ ...payload, is_active: true });
      toast.success('Questionnaire créé');
    }
    queryClient.invalidateQueries({ queryKey: ['all-questionnaires'] });
  }

  async function handleDelete(id) {
    await appApi.entities.Questionnaire.remove(id);
    toast.success('Questionnaire supprimé');
    queryClient.invalidateQueries({ queryKey: ['all-questionnaires'] });
  }

  return (
    <div className="space-y-6">
      <CrudManager
        title="Questionnaires"
        description="Un questionnaire par département, composé de questions typées."
        rows={questionnaires}
        columns={columns}
        fields={fields}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {questionnaires.length ? (
        <div className="rounded-2xl border border-white/50 bg-white/70 p-4">
          <label className="text-sm font-medium mr-3">Gérer les questions de :</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-9 rounded-md border border-input bg-white/80 px-3 text-sm"
          >
            {questionnaires.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          {selected ? <QuestionsManager questionnaireId={selected} /> : null}
        </div>
      ) : null}
    </div>
  );
}
