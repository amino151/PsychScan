import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressBar from '@/components/test/ProgressBar';
import QuestionCard from '@/components/test/QuestionCard';
import { useAuth } from '@/lib/AuthContext';
import { appApi } from '@/services/appApi';
import { getDepartment } from '@/config/departments';
import { getQuestionnaireForDepartment, getQuestionnaire } from '@/lib/questionData';
import { profileCatalog } from '@/config/profiles';
import { calculateScores, normalizeScores, matchProfile } from '@/lib/scoring';
import { generateInsights, computeDepartmentFit } from '@/lib/insights';

export default function Assessment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const startTime = useRef(Date.now());

  // Charge l'affectation si fournie, sinon utilise le département de l'employé.
  const { data: assignment } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => appApi.entities.Assignment.get(assignmentId),
    enabled: Boolean(assignmentId),
  });

  const questionnaire = useMemo(() => {
    if (assignment?.questionnaire_id) return getQuestionnaire(assignment.questionnaire_id);
    return getQuestionnaireForDepartment(user?.department_id || 'customer_service');
  }, [assignment, user]);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['assessment-questions', questionnaire?.id],
    queryFn: () => appApi.entities.Question.filter({ questionnaire_id: questionnaire.id }, 'order', 100),
    enabled: Boolean(questionnaire?.id),
    initialData: [],
  });

  const department = getDepartment(questionnaire?.department_id);
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const answeredCount = Object.keys(answers).length;
  const isLast = currentIndex === totalQuestions - 1;

  const handleAnswer = (answer) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((p) => p - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const answersList = Object.entries(answers).map(([question_id, answer]) => ({ question_id, answer }));
      const rawScores = calculateScores(answersList, questions);
      const scores = normalizeScores(rawScores);
      const profile = matchProfile(rawScores, profileCatalog);
      const departmentFit = computeDepartmentFit(scores, department);
      const insights = generateInsights(scores, profile, department?.code);

      const result = await appApi.submitAssessment({
        employee: user,
        assignmentId: assignment?.id || null,
        questionnaireId: questionnaire.id,
        departmentId: department?.id,
        scores,
        profile,
        insights,
        answers: answersList,
        completionTimeSeconds: Math.round((Date.now() - startTime.current) / 1000),
        departmentFit,
      });

      navigate(`/app/resultats/${result.id}`);
    } catch (err) {
      setError(err?.message || 'Une erreur est survenue lors de la soumission.');
      setSubmitting(false);
    }
  };

  if (isLoading || !questionnaire) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <p className="text-muted-foreground">Aucune question disponible pour ce questionnaire.</p>
        <Button onClick={() => navigate('/app/employe')}>Retour</Button>
      </div>
    );
  }

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
                <ClipboardCheck className="h-3.5 w-3.5" />
                {department?.name || 'Évaluation'}
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-display font-bold">{questionnaire.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{questionnaire.description}</p>
            </div>
            <div className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-semibold">
              {answeredCount}/{totalQuestions}
            </div>
          </div>
        </motion.div>

        <div className="mb-6 rounded-2xl border border-white/45 bg-white/85 p-4 shadow-panel">
          <ProgressBar current={currentIndex + 1} total={totalQuestions} />
        </div>

        <QuestionCard question={currentQuestion} selectedAnswer={selectedAnswer} onAnswer={handleAnswer} direction={direction} />

        {error ? (
          <p className="mt-4 text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">{error}</p>
        ) : null}

        <div className="flex items-center justify-between mt-6 rounded-2xl border border-white/45 bg-white/85 p-4 shadow-panel">
          <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0} className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </Button>

          {isLast ? (
            <Button onClick={handleSubmit} disabled={!selectedAnswer || submitting} className="gap-2 rounded-xl px-8">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  Voir mes résultats
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!selectedAnswer} className="gap-2 rounded-xl">
              Suivant
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
