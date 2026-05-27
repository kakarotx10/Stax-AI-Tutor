import type { RubricScore, WrittenGrade } from '@/src/validators/evaluator.validator';
import { weightedScore } from './shared';

export function evaluateWrittenRubric(grade: WrittenGrade) {
  const rubric: RubricScore[] = [
    {
      criterion: 'Accuracy',
      weight: 0.4,
      score: grade.accuracy,
      comment: 'Answer ke facts aur technical correctness grade hue.',
    },
    {
      criterion: 'Completeness',
      weight: 0.25,
      score: grade.completeness,
      comment: 'Important points cover hue ya missing hain, ye check hua.',
    },
    {
      criterion: 'Clarity',
      weight: 0.15,
      score: grade.clarity,
      comment: 'Explanation kitni easy to follow hai, ye score hai.',
    },
    {
      criterion: 'Structure',
      weight: 0.1,
      score: grade.structure,
      comment: 'Answer ka flow and ordering evaluate hua.',
    },
    {
      criterion: 'Use of examples',
      weight: 0.1,
      score: grade.examples,
      comment: 'Relevant examples use hue ya nahi, ye score hai.',
    },
  ];
  const score = weightedScore(rubric);

  return {
    score,
    status: score >= 90 ? 'accepted' as const : score >= 50 ? 'partial' as const : 'failed' as const,
    rubric,
    strengths: grade.strengths.slice(0, 3),
    improvements: grade.improvements.slice(0, 3),
    summary: grade.summaryHinglish,
  };
}
