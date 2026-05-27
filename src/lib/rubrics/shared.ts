import type { EvaluationLevel, EvaluationStatus, RubricScore } from '@/src/validators/evaluator.validator';

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function weightedScore(rubric: RubricScore[]) {
  return clampScore(
    rubric.reduce((total, item) => total + item.weight * item.score, 0)
  );
}

export function mapScoreToLevel(score: number): EvaluationLevel {
  if (score >= 90) return 'expert';
  if (score >= 75) return 'advanced';
  if (score >= 50) return 'intermediate';
  return 'beginner';
}

export function statusFromScore(score: number): EvaluationStatus {
  if (score >= 90) return 'accepted';
  if (score >= 50) return 'partial';
  return 'failed';
}

export function ensureActionableImprovement(
  improvements: string[],
  score: number,
  fallback: string
) {
  const clean = improvements.filter(Boolean).slice(0, 3);
  if (score < 100 && clean.length === 0) {
    return [fallback];
  }
  return clean;
}
