import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/shared/PageHeader';
import AnalyticsPanel from '@/components/shared/AnalyticsPanel';
import { DepartmentBadge } from '@/components/shared/Badges';
import { useAuth } from '@/lib/AuthContext';
import { appApi } from '@/services/appApi';
import { getDepartment } from '@/config/departments';
import { getQuestionnaireForDepartment } from '@/lib/questionData';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const department = user?.department_id ? getDepartment(user.department_id) : null;

  const { data: members = [] } = useQuery({
    queryKey: ['mgr-members', user?.department_id],
    queryFn: () => appApi.listDepartmentMembers(user.department_id),
    enabled: Boolean(user?.department_id),
    initialData: [],
  });

  const { data: results = [] } = useQuery({
    queryKey: ['mgr-results', user?.department_id],
    queryFn: () => appApi.listResultsForDepartment(user.department_id),
    enabled: Boolean(user?.department_id),
    initialData: [],
  });

  const memberIds = members.map((m) => m.id);

  const { data: allAssignments = [] } = useQuery({
    queryKey: ['mgr-assignments', user?.department_id],
    queryFn: async () => {
      const lists = await Promise.all(memberIds.map((id) => appApi.listAssignmentsForEmployee(id)));
      return lists.flat();
    },
    enabled: memberIds.length > 0,
    initialData: [],
  });

  async function handleAssign(member) {
    const questionnaire = getQuestionnaireForDepartment(member.department_id || user.department_id);
    const due = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await appApi.assignQuestionnaire({
      employeeId: member.id,
      questionnaireId: questionnaire.id,
      assignedBy: user.id,
      dueDate: due,
    });
    toast.success(`Évaluation affectée à ${member.full_name}`);
    queryClient.invalidateQueries({ queryKey: ['mgr-assignments', user?.department_id] });
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[240px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        <PageHeader
          eyebrow="Tableau de bord manager"
          icon={Users}
          title="Mon équipe"
          subtitle="Vue d'ensemble des compétences et de la progression de votre département."
          actions={department ? <DepartmentBadge departmentId={department.id} /> : null}
        />

        {user?.department_id ? (
          <AnalyticsPanel results={results} members={members} assignments={allAssignments} onAssign={handleAssign} />
        ) : (
          <p className="text-muted-foreground">Aucun département n&apos;est associé à votre compte.</p>
        )}
      </div>
    </div>
  );
}
