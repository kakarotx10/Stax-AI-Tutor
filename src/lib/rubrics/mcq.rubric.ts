import type { RubricScore } from '@/src/validators/evaluator.validator';
import { clampScore, weightedScore } from './shared';

const DEFAULT_EXPECTED_MS = 30_000;

export type McqRubricInput = {
  selectedOptionId: string;
  correctOptionId: string;
  timeTakenMs: number;
  expectedMs?: number;
};

export type McqBatchItem = {
  selectedAnswer?: number;
  correctAnswer?: number;
};

function speedScore(timeTakenMs: number, expectedMs = DEFAULT_EXPECTED_MS) {
  if (timeTakenMs <= expectedMs) return 100;
  if (timeTakenMs >= expectedMs * 3) return 0;
  return clampScore(((expectedMs * 3 - timeTakenMs) / (expectedMs * 2)) * 100);
}

export function evaluateMcqRubric(input: McqRubricInput) {
  const isCorrect = input.selectedOptionId === input.correctOptionId;
  const correctness = isCorrect ? 100 : 0;
  const speed = speedScore(input.timeTakenMs, input.expectedMs);
  const rubric: RubricScore[] = [
    {
      criterion: 'Correctness',
      weight: 0.8,
      score: correctness,
      comment: isCorrect ? 'Selected option correct hai.' : 'Selected option correct answer se match nahi karta.',
    },
    {
      criterion: 'Speed',
      weight: 0.2,
      score: speed,
      comment: speed === 100 ? 'Expected time ke andar answer diya.' : 'Answer expected time se slow tha.',
    },
  ];
  const score = weightedScore(rubric);

  return {
    score,
    status: isCorrect ? 'accepted' as const : 'failed' as const,
    rubric,
    strengths: isCorrect ? ['Concept pick sahi tha'] : [],
    improvements: isCorrect ? [] : ['Correct option ke logic ko theory note se compare karo, phir same question retry karo.'],
    summary: isCorrect
      ? 'Sahi answer hai. Pace bhi track ho gaya, next phase ke liye ready ho.'
      : 'Answer galat hai, concept abhi clear nahi hua. Pehle theory ka core point revise karo.',
  };
}

export function evaluateMcqBatchRubric(items: McqBatchItem[]) {
  const total = items.length;
  const correct = items.filter(
    (item) => item.selectedAnswer !== undefined && item.selectedAnswer === item.correctAnswer
  ).length;
  const correctness = total > 0 ? clampScore((correct / total) * 100) : 0;
  const rubric: RubricScore[] = [
    {
      criterion: 'Correctness',
      weight: 0.8,
      score: correctness,
      comment: `${correct}/${total} MCQs correct hain.`,
    },
    {
      criterion: 'Speed',
      weight: 0.2,
      score: correctness,
      comment: 'Legacy MCQ attempt me timing available nahi tha.',
    },
  ];
  const score = weightedScore(rubric);

  return {
    score,
    status: score >= 70 ? 'accepted' as const : 'failed' as const,
    rubric,
    strengths: correct > 0 ? ['Kuch concepts correctly identify kiye'] : [],
    improvements:
      score < 100
        ? ['Wrong MCQs ke explanations dobara padho aur key definition ko one-line note me likho.']
        : [],
    summary:
      score >= 70
        ? 'MCQ gate clear hai. Ab next practice phase pe ja sakte ho.'
        : 'MCQ accuracy low hai. Theory revise karke retry karna better rahega.',
  };
}
