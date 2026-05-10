import React from 'react';
import { appApi } from '@/services/appApi';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminStats from '@/components/admin/AdminStats';
import AdminQuestions from '@/components/admin/AdminQuestions';
import AdminProfiles from '@/components/admin/AdminProfiles';
import AdminUsers from '@/components/admin/AdminUsers';

export default function AdminDashboard() {
  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: ['admin-results'],
    queryFn: () => appApi.entities.TestResult.list('-created_date', 500),
    initialData: [],
  });

  const { data: questions, isLoading: loadingQ } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => appApi.entities.Question.list('order', 100),
    initialData: [],
  });

  const { data: profiles, isLoading: loadingP } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: () => appApi.entities.PsychProfile.list(),
    initialData: [],
  });

  const { data: users, isLoading: loadingU } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => appApi.entities.User.list(),
    initialData: [],
  });

  const isLoading = loadingResults || loadingQ || loadingP || loadingU;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[260px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl border border-white/40 bg-white/75 backdrop-blur-xl shadow-panel p-6"
        >
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary/80">
            <ShieldCheck className="h-3.5 w-3.5" />
            Console admin
          </p>
          <h1 className="text-3xl font-display font-bold mt-2">Administration</h1>
          <p className="text-muted-foreground mt-1">Gérez votre plateforme MindScan</p>
        </motion.div>

        <div className="rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl p-5 md:p-6 shadow-panel">
          <AdminStats results={results} users={users} questions={questions} />

          <Tabs defaultValue="questions" className="mt-8">
            <TabsList className="mb-6 bg-primary/5 border border-primary/10 rounded-xl">
              <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
              <TabsTrigger value="profiles">Profils ({profiles.length})</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs ({users.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="questions">
              <AdminQuestions questions={questions} />
            </TabsContent>
            <TabsContent value="profiles">
              <AdminProfiles profiles={profiles} />
            </TabsContent>
            <TabsContent value="users">
              <AdminUsers users={users} results={results} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}