import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { appApi } from '@/services/appApi';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, RotateCcw } from 'lucide-react';
import { defaultProfiles } from '@/lib/questionData';
import { motion } from 'framer-motion';
import ProfileCard from '@/components/results/ProfileCard';
import ScoreRadar from '@/components/results/ScoreRadar';
import ScoreBars from '@/components/results/ScoreBars';
import StrengthsWeaknesses from '@/components/results/StrengthsWeaknesses';
import CareerAdvice from '@/components/results/CareerAdvice';
import { generateReportPDF } from '@/utils/generateReportPDF';

export default function Results() {
  const { id } = useParams();
  const radarContainerRef = useRef(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', id],
    queryFn: () => appApi.entities.TestResult.filter({ id }),
    select: (data) => data[0],
  });

  const { data: dbProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => appApi.entities.PsychProfile.list(),
    initialData: [],
  });

  const profiles = dbProfiles.length > 0 ? dbProfiles : defaultProfiles;

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
        <Link to="/test">
          <Button>Passer le test</Button>
        </Link>
      </div>
    );
  }

  const profile = profiles.find(p => p.code === result.profile_code) || profiles[0];
  const from = profile?.theme?.from || '#2563EB';
  const to = profile?.theme?.to || '#8B5CF6';

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      await generateReportPDF({
        result,
        profile,
        userName: result?.user_name,
        radarElement: radarContainerRef.current,
      });
    } catch (error) {
      // Keep UX simple; fail silently in-page.
      console.error('PDF generation failed:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div
        className="absolute inset-x-0 top-0 h-[330px] opacity-90"
        style={{ background: `linear-gradient(135deg, ${from}22 0%, ${to}25 60%, #0ea5e922 100%)` }}
      />
      <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10">
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Accueil
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isGeneratingPdf ? 'Génération…' : 'Download PDF Report'}
            </Button>
            <Link to="/test">
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Refaire le test
              </Button>
            </Link>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-3xl border border-white/35 bg-white/70 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-brand-primary/10"
        >
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">Votre analyse</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900">
            Resultat de personnalite
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Profil calcule a partir d&apos;un moteur de scoring multi-dimensions.
          </p>
        </motion.section>

        <ProfileCard profile={profile} />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div
            ref={radarContainerRef}
            className="p-6 rounded-2xl bg-white/90 border border-white/45 shadow-lg shadow-brand-primary/5"
          >
            <h3 className="font-semibold mb-4">Vue radar</h3>
            <ScoreRadar scores={result.scores} />
          </div>
          <div className="p-6 rounded-2xl bg-white/90 border border-white/45 shadow-lg shadow-brand-primary/5">
            <h3 className="font-semibold mb-4">Scores détaillés</h3>
            <ScoreBars scores={result.scores} />
          </div>
        </motion.div>

        <StrengthsWeaknesses
          strengths={profile?.strengths}
          weaknesses={profile?.weaknesses}
        />

        <CareerAdvice
          careers={profile?.recommended_careers}
          advice={profile?.advice}
        />

        {result.completion_time_seconds && (
          <div className="text-center text-sm text-muted-foreground">
            Temps de complétion : {Math.floor(result.completion_time_seconds / 60)} min {result.completion_time_seconds % 60} sec
          </div>
        )}
      </div>
    </div>
  );
}