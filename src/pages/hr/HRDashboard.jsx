import React from 'react';
import { Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import GlobalOverview from '@/components/management/GlobalOverview';
import EmployeesManager from '@/components/management/EmployeesManager';
import DepartmentsManager from '@/components/management/DepartmentsManager';
import QuestionnairesManager from '@/components/management/QuestionnairesManager';
import TrainingPlansManager from '@/components/management/TrainingPlansManager';
import RecommendationsManager from '@/components/management/RecommendationsManager';

export default function HRDashboard() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[240px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <PageHeader
          eyebrow="Espace Ressources Humaines"
          icon={Building2}
          title="Administration RH"
          subtitle="Pilotez les collaborateurs, les évaluations et les plans de développement."
        />

        <div className="rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl p-5 md:p-6 shadow-panel">
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 flex flex-wrap h-auto bg-primary/5 border border-primary/10 rounded-xl">
              <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
              <TabsTrigger value="employees">Employés</TabsTrigger>
              <TabsTrigger value="departments">Départements</TabsTrigger>
              <TabsTrigger value="questionnaires">Questionnaires</TabsTrigger>
              <TabsTrigger value="trainings">Formations</TabsTrigger>
              <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview"><GlobalOverview /></TabsContent>
            <TabsContent value="employees"><EmployeesManager /></TabsContent>
            <TabsContent value="departments"><DepartmentsManager /></TabsContent>
            <TabsContent value="questionnaires"><QuestionnairesManager /></TabsContent>
            <TabsContent value="trainings"><TrainingPlansManager /></TabsContent>
            <TabsContent value="recommendations"><RecommendationsManager /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
