import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, Loader2, GraduationCap, Briefcase, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import SkillRadar from '@/components/shared/SkillRadar';
import SkillBars from '@/components/shared/SkillBars';
import { FitBadge, DepartmentBadge } from '@/components/shared/Badges';
import ProfileCard from '@/components/results/ProfileCard';
import StrengthsWeaknesses from '@/components/results/StrengthsWeaknesses';
import { appApi } from '@/services/appApi';
import { getProfile } from '@/config/profiles';
import { getDepartment } from '@/config/departments';
import { generateInsights } from '@/lib/insights';
import { generateReportPDF } from '@/utils/generateReportPDF';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const radarRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', id],
    queryFn: () => appApi.entities.Result.get(id),
    enabled: Boolean(id),
  });

  const { data: employee } = useQuery({
    queryKey: ['result-employee', result?.employee_id],
    queryFn: () => appApi.entities.Employee.get(result.employee_id),
    enabled: Boolean(result?.employee_id),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Résultat introuvable</p>
        <Button onClick={() => navigate('/app/employe')}>Retour</Button>
      </div>
    );
  }

  const profile = getProfile(result.profile_code) || null;
  const department = getDepartment(result.department_id);
  const insights = generateInsights(result.scores, profile, department?.code);
  const from = profile?.theme?.from || '#2563EB';
  const to = profile?.theme?.to || '#8B5CF6';

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await generateReportPDF({
        result,
        profile,
        department,
        employee,
        insights,
        radarElement: radarRef.current,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div
        className="absolute inset-x-0 top-0 h-[300px] opacity-90"
        style={{ background: `linear-gradient(135deg, ${from}22 0%, ${to}25 60%, #0ea5e922 100%)` }}
      />
      <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
        <PageHeader
          eyebrow="Bilan d'évaluation"
          icon={Target}
          title="Résultat de compétences"
          subtitle={employee ? `${employee.full_name} · ${employee.position || ''}` : undefined}
          actions={
            <>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isGeneratingPdf ? 'Génération…' : 'Rapport PDF'}
              </Button>
            </>
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          {department ? <DepartmentBadge departmentId={department.id} /> : null}
          <span className="text-sm text-muted-foreground">Adéquation au poste :</span>
          <FitBadge value={result.department_fit} />
        </div>

        <ProfileCard profile={profile} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div ref={radarRef} className="p-6 rounded-2xl bg-white/90 border border-white/45 shadow-lg">
            <h3 className="font-semibold mb-4">Radar des compétences</h3>
            <SkillRadar series={[{ key: 'me', name: 'Compétences', scores: result.scores, color: from }]} />
          </div>
          <div className="p-6 rounded-2xl bg-white/90 border border-white/45 shadow-lg">
            <h3 className="font-semibold mb-4">Scores détaillés</h3>
            <SkillBars scores={result.scores} height={360} />
          </div>
        </div>

        <StrengthsWeaknesses strengths={insights.strengths} weaknesses={insights.weaknesses} />

        {department ? (
          <Card className="border-white/45 bg-white/85 shadow-panel">
            <CardHeader>
              <CardTitle className="text-base">Insights département — {department.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insights.departmentInsights.map((d) => (
                <div key={d.skill} className="flex items-center gap-2 text-sm">
                  <Badge
                    className="border-0 text-white text-xs"
                    style={{ backgroundColor: d.level === 'fort' ? '#16a34a' : d.level === 'à développer' ? '#ef4444' : '#f59e0b' }}
                  >
                    {d.level}
                  </Badge>
                  <span className="text-muted-foreground">{d.message}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/45 bg-white/85 shadow-panel">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-secondary" />
                Formations suggérées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {insights.trainingSuggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune formation prioritaire — profil équilibré.</p>
              ) : (
                insights.trainingSuggestions.map((t) => (
                  <div key={t.id} className="rounded-xl border border-white/60 bg-white/70 p-3">
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.description} · {t.duration} · {t.format}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="border-white/45 bg-white/85 shadow-panel">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                Recommandations de carrière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {insights.careerRecommendations.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                    {c}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {result.completion_time_seconds ? (
          <p className="text-center text-sm text-muted-foreground">
            Temps de complétion : {Math.floor(result.completion_time_seconds / 60)} min {result.completion_time_seconds % 60} sec
          </p>
        ) : null}
      </div>
    </div>
  );
}
