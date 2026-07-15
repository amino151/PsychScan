import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  LayoutDashboard,
  ClipboardCheck,
  GraduationCap,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import SkillRadar from '@/components/shared/SkillRadar';
import { FitBadge, DepartmentBadge } from '@/components/shared/Badges';
import { useAuth } from '@/lib/AuthContext';
import { appApi } from '@/services/appApi';
import { getDepartment } from '@/config/departments';
import { getProfile } from '@/config/profiles';
import { generateInsights } from '@/lib/insights';
import { averageScore } from '@/lib/scoring';

export default function EmployeeDashboard() {
  const { user } = useAuth();

  const { data: assignments = [] } = useQuery({
    queryKey: ['emp-assignments', user?.id],
    queryFn: () => appApi.listAssignmentsForEmployee(user.id),
    enabled: Boolean(user?.id),
    initialData: [],
  });

  const { data: results = [] } = useQuery({
    queryKey: ['emp-results', user?.id],
    queryFn: () => appApi.listResultsForEmployee(user.id),
    enabled: Boolean(user?.id),
    initialData: [],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['emp-recos', user?.id],
    queryFn: () => appApi.entities.Recommendation.filter({ employee_id: user.id }, '-created_at'),
    enabled: Boolean(user?.id),
    initialData: [],
  });

  const { data: trainings = [] } = useQuery({
    queryKey: ['emp-trainings', user?.id],
    queryFn: () => appApi.entities.TrainingPlan.filter({ employee_id: user.id }),
    enabled: Boolean(user?.id),
    initialData: [],
  });

  const department = user?.department_id ? getDepartment(user.department_id) : null;
  const pending = assignments.filter((a) => a.status !== 'completed');
  const latest = results[0] || null;
  const profile = latest ? getProfile(latest.profile_code) : null;
  const insights = latest ? generateInsights(latest.scores, profile, department?.code) : null;

  const progression = [...results]
    .reverse()
    .map((r) => ({
      date: r.created_at ? format(new Date(r.created_at), 'dd/MM', { locale: fr }) : '—',
      adequation: r.department_fit ?? 0,
      global: averageScore(r.scores),
    }));

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[240px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-6xl mx-auto px-4 py-8 md:py-12">
        <PageHeader
          eyebrow="Mon espace collaborateur"
          icon={LayoutDashboard}
          title={`Bonjour, ${user?.full_name?.split(' ')[0] || ''}`}
          subtitle="Suivez vos évaluations, vos compétences et votre plan de développement."
          actions={
            <Link to="/app/evaluation">
              <Button className="gap-2 rounded-xl">
                <ClipboardCheck className="w-4 h-4" />
                Passer une évaluation
              </Button>
            </Link>
          }
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Évaluations réalisées" value={results.length} icon={ClipboardCheck} accent="#2563EB" />
          <StatCard title="Score global" value={latest ? `${averageScore(latest.scores)}%` : '—'} icon={TrendingUp} accent="#14B8A6" />
          <StatCard title="Recommandations" value={recommendations.length} icon={Lightbulb} accent="#F97316" />
          <StatCard title="Formations" value={trainings.length} icon={GraduationCap} accent="#7C3AED" />
        </div>

        {pending.length > 0 ? (
          <Card className="mb-6 border-amber-200 bg-amber-50/70">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-amber-600" />
                Évaluations à compléter ({pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pending.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl bg-white/80 border border-amber-100 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{department?.name || 'Évaluation'}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.due_date ? `Échéance : ${format(new Date(a.due_date), 'dd MMM yyyy', { locale: fr })}` : 'Sans échéance'}
                    </p>
                  </div>
                  <Link to={`/app/evaluation/${a.id}`}>
                    <Button size="sm" className="gap-1.5 rounded-lg">
                      Démarrer <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        {latest ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="border-white/45 bg-white/85 shadow-panel">
              <CardHeader>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <CardTitle>Profil : {latest.profile_name || profile?.name}</CardTitle>
                  {department ? <DepartmentBadge departmentId={department.id} /> : null}
                </div>
                <p className="text-sm text-muted-foreground">{profile?.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Adéquation au poste :</span>
                  <FitBadge value={latest.department_fit} />
                </div>
                <SkillRadar
                  series={[{ key: 'me', name: 'Mes compétences', scores: latest.scores, color: '#2563EB' }]}
                  skills={department ? Object.keys(department.key_skills) : undefined}
                  height={280}
                />
                <Link to={`/app/resultats/${latest.id}`}>
                  <Button variant="outline" className="w-full gap-2 rounded-xl">
                    Voir le détail & rapport PDF <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-white/45 bg-white/85 shadow-panel">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Progression
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {progression.length > 1 ? (
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progression}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.12)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="adequation" name="Adéquation" stroke="#2563EB" strokeWidth={2} />
                          <Line type="monotone" dataKey="global" name="Score global" stroke="#14B8A6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Passez une seconde évaluation pour visualiser votre progression.
                    </p>
                  )}
                </CardContent>
              </Card>

              {insights ? (
                <Card className="border-white/45 bg-white/85 shadow-panel">
                  <CardHeader>
                    <CardTitle className="text-base">Forces & axes d&apos;amélioration</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-emerald-700 mb-2">Forces</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {insights.strengths.map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-amber-700 mb-2">À développer</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {insights.weaknesses.map((w) => (
                          <li key={w}>• {w}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        ) : (
          <Card className="mb-6 border-white/45 bg-white/85 shadow-panel">
            <CardContent className="py-12 text-center">
              <ClipboardCheck className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Vous n&apos;avez pas encore passé d&apos;évaluation.</p>
              <Link to="/app/evaluation">
                <Button className="rounded-xl">Passer ma première évaluation</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/45 bg-white/85 shadow-panel">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Recommandations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune recommandation pour le moment.</p>
              ) : (
                recommendations.map((r) => (
                  <div key={r.id} className="rounded-xl border border-white/60 bg-white/70 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{r.title}</p>
                      <Badge variant="secondary" className="text-xs">{r.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/45 bg-white/85 shadow-panel">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-secondary" />
                Mes formations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune formation planifiée.</p>
              ) : (
                trainings.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-xl border border-white/60 bg-white/70 p-3">
                    <div>
                      <p className="font-medium text-sm">{t.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.start_date ? format(new Date(t.start_date), 'dd MMM yyyy', { locale: fr }) : 'À planifier'}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {t.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
