import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import GlobalOverview from '@/components/management/GlobalOverview';
import EmployeesManager from '@/components/management/EmployeesManager';
import DepartmentsManager from '@/components/management/DepartmentsManager';
import QuestionnairesManager from '@/components/management/QuestionnairesManager';
import TrainingPlansManager from '@/components/management/TrainingPlansManager';
import RecommendationsManager from '@/components/management/RecommendationsManager';
import ProfilesManager from '@/components/management/ProfilesManager';
import SettingsManager from '@/components/management/SettingsManager';
import AuditLogViewer from '@/components/management/AuditLogViewer';

export default function SuperAdminDashboard() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[240px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <PageHeader
          eyebrow="Console Super Administrateur"
          icon={ShieldCheck}
          title="Administration système"
          subtitle="Supervision globale, configuration et audit de la plateforme."
        />

        <div className="rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl p-5 md:p-6 shadow-panel">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 flex flex-wrap h-auto bg-primary/5 border border-primary/10 rounded-xl">
              <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="employees">Employés</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
              <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
              <TabsTrigger value="profiles">Profils</TabsTrigger>
              <TabsTrigger value="trainings">Formations</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
              <TabsTrigger value="settings">Paramètres</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><GlobalOverview /></TabsContent>
            <TabsContent value="employees"><EmployeesManager /></TabsContent>
            <TabsContent value="departments"><DepartmentsManager /></TabsContent>
            <TabsContent value="questionnaires"><QuestionnairesManager /></TabsContent>
            <TabsContent value="profiles"><ProfilesManager /></TabsContent>
            <TabsContent value="trainings"><TrainingPlansManager /></TabsContent>
            <TabsContent value="recommendations"><RecommendationsManager /></TabsContent>
            <TabsContent value="settings"><SettingsManager /></TabsContent>
            <TabsContent value="audit"><AuditLogViewer /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
