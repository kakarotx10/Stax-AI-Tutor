'use client';

import { ArrowRight, BookOpen, CheckCircle2, Code2, Mic, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import type {
  EvaluationNextStep,
  EvaluationResult,
} from '@/src/validators/evaluator.validator';

type EvaluationCardProps = {
  result: EvaluationResult;
  className?: string;
  onAction?: (nextStep: EvaluationNextStep) => void;
};

const levelVariant: Record<EvaluationResult['level'], 'secondary' | 'info' | 'warning' | 'success'> = {
  beginner: 'secondary',
  intermediate: 'info',
  advanced: 'warning',
  expert: 'success',
};

function actionCopy(nextStep: EvaluationNextStep) {
  switch (nextStep.action) {
    case 'retry':
      return { label: 'Retry', icon: RotateCcw };
    case 'advance':
      return { label: `Go to ${nextStep.toPhase}`, icon: ArrowRight };
    case 'review_theory':
      return { label: 'Review theory', icon: BookOpen };
    case 'practice_similar':
      return { label: 'Practice similar', icon: Code2 };
    case 'interview_ready':
      return { label: 'Start interview practice', icon: Mic };
  }
}

export function EvaluationCard({ result, className, onAction }: EvaluationCardProps) {
  const action = actionCopy(result.feedback.nextStep);
  const ActionIcon = action.icon;

  return (
    <Card className={cn('overflow-hidden rounded-lg', className)}>
      <CardHeader className="border-b border-border bg-muted/35">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="grid h-24 w-24 shrink-0 place-items-center rounded-full border border-border bg-card"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${result.score * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
              aria-label={`Score ${result.score} out of 100`}
            >
              <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-card">
                <span className="text-2xl font-semibold text-foreground">{result.score}</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant={levelVariant[result.level]}>{result.level}</Badge>
                <Badge variant={result.status === 'accepted' ? 'success' : result.status === 'partial' ? 'warning' : 'destructive'}>
                  {result.status}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-snug">{result.feedback.summary}</CardTitle>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => onAction?.(result.feedback.nextStep)}
            className="w-full sm:w-auto"
          >
            <ActionIcon className="h-4 w-4" />
            {action.label}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="grid gap-6 p-5 text-foreground lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Rubric</h4>
          <div className="space-y-3">
            {result.rubric.map((item) => (
              <div key={item.criterion} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground">{item.criterion}</span>
                  <span className="text-muted-foreground">{item.score}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.comment}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <section className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Strengths
            </h4>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground">
              {(result.feedback.strengths.length ? result.feedback.strengths : ['Attempt saved successfully']).map((item) => (
                <li key={item} className="rounded-md border border-border bg-muted/25 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.04em] text-muted-foreground">Improvements</h4>
            <ul className="space-y-2 text-sm leading-relaxed text-foreground">
              {result.feedback.improvements.map((item) => (
                <li key={item} className="rounded-md border border-border bg-card px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

export default EvaluationCard;
