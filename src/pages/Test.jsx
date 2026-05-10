import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appApi, getGuestEmail } from '@/services/appApi';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/test/ProgressBar';
import QuestionCard from '@/components/test/QuestionCard';
import { defaultQuestions, defaultProfiles } from '@/lib/questionData';
import { calculateScores, normalizeScores, matchProfile } from '@/lib/scoring';

export default function Test() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  const { data: dbQuestions } = useQuery({
    queryKey: ['questions'],
    queryFn: () => appApi.entities.Question.list('order', 100),
    initialData: [],
  });

  const { data: dbProfiles } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => appApi.entities.PsychProfile.list(),
    initialData: [],
  });

  const questions = dbQuestions.length > 0
    ? dbQuestions.filter(q => q.is_active !== false).sort((a, b) => (a.order || 0) - (b.order || 0))
    : defaultQuestions.map((q, i) => ({ ...q, id: `default_${i}` }));

  const profiles = dbProfiles.length > 0 ? dbProfiles : defaultProfiles;

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id || `default_${currentIndex}`] : null;

  const handleAnswer = (answer) => {
    const key = currentQuestion.id || `default_${currentIndex}`;
    setAnswers(prev => ({ ...prev, [key]: answer }));
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const answersList = Object.entries(answers).map(([qId, answer]) => ({
      question_id: qId,
      answer
    }));

    const scores = calculateScores(answersList, questions);
    const normalizedScores = normalizeScores(scores);
    const profile = matchProfile(scores, profiles);

    let user = null;
    try {
      user = await appApi.auth.me();
    } catch {
      // guest: stable per-browser email for history
    }

    const guestEmail = getGuestEmail();
    const resultData = {
      user_email: user?.email || guestEmail,
      user_name: user?.full_name || 'Invité',
      scores: normalizedScores,
      profile_code: profile?.code || 'visionary',
      profile_name: profile?.name || 'Le Visionnaire',
      answers: answersList,
      completion_time_seconds: Math.round((Date.now() - startTime.current) / 1000),
      is_guest: !user
    };

    const created = await appApi.entities.TestResult.create(resultData);
    navigate(`/results/${created.id}`);
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLast = currentIndex === totalQuestions - 1;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="absolute inset-x-0 top-0 h-[300px] bg-brand-gradient opacity-[0.08]" />
      <div className="relative max-w-3xl mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-panel p-5 md:p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-primary/80">
                <Sparkles className="h-3.5 w-3.5" />
                Parcours personnalite
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold">Test psychologique</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Repondez spontanement. Chaque choix influence plusieurs dimensions.
              </p>
            </div>
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-semibold">
              {answeredCount}/{totalQuestions}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-white/45 bg-white/85 p-4 shadow-panel"
        >
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </motion.div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
          direction={direction}
        />

        <div className="flex items-center justify-between mt-6 rounded-2xl border border-white/45 bg-white/85 p-4 shadow-panel">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          {isLast ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || submitting}
              className="gap-2 rounded-xl px-8"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Voir mes résultats
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!selectedAnswer}
              className="gap-2 rounded-xl"
            >
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}