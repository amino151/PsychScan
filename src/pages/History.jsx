import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appApi, getGuestEmail } from '@/services/appApi';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, Clock, Brain, Plus, History as HistoryIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { defaultProfiles } from '@/lib/questionData';

function readSessionEmail() {
  try {
    const raw = localStorage.getItem('mindscan_session');
    if (raw) return JSON.parse(raw).email;
  } catch {
    /* ignore */
  }
  return null;
}

export default function History() {
  const [userEmail, setUserEmail] = useState(() => readSessionEmail() || getGuestEmail());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await appApi.auth.me();
        if (!cancelled) setUserEmail(u.email);
      } catch {
        if (!cancelled) setUserEmail(getGuestEmail());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { data: results, isLoading } = useQuery({
    queryKey: ['my-results', userEmail],
    queryFn: () => appApi.entities.TestResult.filter({ user_email: userEmail }, '-created_date', 50),
    enabled: Boolean(userEmail),
    initialData: [],
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

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[280px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-5xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl border border-white/40 bg-white/75 backdrop-blur-xl shadow-panel p-6"
        >
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary/80">
            <HistoryIcon className="h-3.5 w-3.5" />
            Historique personnel
          </p>
          <div className="flex items-center justify-between mt-2 gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold">Historique</h1>
              <p className="text-muted-foreground mt-1">Vos tests précédents</p>
            </div>
            <Link to="/test">
              <Button className="gap-2 rounded-xl">
                <Plus className="w-4 h-4" />
                Nouveau test
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="rounded-3xl border border-white/45 bg-white/80 backdrop-blur-xl p-5 md:p-6 shadow-panel">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {results.length} résultat{results.length > 1 ? 's' : ''} enregistré{results.length > 1 ? 's' : ''}
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-20">
              <Brain className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun test encore</h2>
              <p className="text-muted-foreground mb-6">Passez votre premier test psychologique pour commencer.</p>
              <Link to="/test">
                <Button className="rounded-xl">Commencer le test</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, i) => {
                const profile = profiles.find(p => p.code === result.profile_code);
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/results/${result.id}`}>
                      <div className="p-5 rounded-2xl bg-white/85 border border-white/55 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200 flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${(profile?.theme?.from || profile?.color || '#8B5CF6')}30, ${(profile?.theme?.to || '#14B8A6')}35)`,
                          }}
                        >
                          <Brain className="w-6 h-6" style={{ color: profile?.color || '#8B5CF6' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{result.profile_name || profile?.name || 'Profil'}</h3>
                            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {result.profile_code}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {result.created_date ? format(new Date(result.created_date), 'dd MMM yyyy, HH:mm', { locale: fr }) : '—'}
                            </span>
                            {result.completion_time_seconds && (
                              <span>{Math.floor(result.completion_time_seconds / 60)} min</span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}