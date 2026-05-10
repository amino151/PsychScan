import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function QuestionCard({ question, selectedAnswer, onAnswer, direction }) {
  const options = question?.options || [];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={question?.id || question?.text}
        initial={{ opacity: 0, x: direction >= 0 ? 24 : -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: direction >= 0 ? -24 : 24 }}
        transition={{ duration: 0.22 }}
      >
        <Card className="border-white/50 bg-white/90 backdrop-blur-xl shadow-panel">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl font-display leading-snug">
              {question?.text}
            </CardTitle>
            {question?.category && (
              <p className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.14em] text-primary">
                {String(question.category).replace(/_/g, ' ')}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {options.map((opt) => {
              const isScale = question?.type === 'scale';
              const label = opt.text;
              const selected = selectedAnswer === label;
              return (
                <Button
                  key={label}
                  type="button"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left h-auto py-3.5 px-4 whitespace-normal rounded-xl border border-primary/15 bg-white/75 hover:bg-primary/10 hover:border-primary/35',
                    selected &&
                      'bg-gradient-to-r from-primary to-secondary text-white border-transparent shadow-lg shadow-primary/20 hover:from-primary hover:to-secondary',
                    isScale && 'justify-center text-lg font-medium'
                  )}
                  onClick={() => onAnswer(label)}
                >
                  {label}
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
