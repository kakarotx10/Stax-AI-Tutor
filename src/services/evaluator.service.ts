import type { IAttempt, IProgress } from '@/src/models';
import { geminiService } from '@/src/services/gemini.service';
import {
  EvaluationRequestSchema,
  WrittenGradeSchema,
  type EvaluationNextStep,
  type EvaluationRequest,
  type EvaluationResult,
  type RubricScore,
  type WrittenGrade,
} from '@/src/validators/evaluator.validator';
import { evaluateCodingRubric } from '@/src/lib/rubrics/coding.rubric';
import {
  evaluateMcqBatchRubric,
  evaluateMcqRubric,
  type McqBatchItem,
} from '@/src/lib/rubrics/mcq.rubric';
import { evaluateSqlRubric } from '@/src/lib/rubrics/sql.rubric';
import { evaluateWrittenRubric } from '@/src/lib/rubrics/written.rubric';
import {
  ensureActionableImprovement,
  mapScoreToLevel,
  statusFromScore,
} from '@/src/lib/rubrics/shared';

export const EVALUATOR_VERSION = '1.0.0';

type RubricOutcome = {
  score: number;
  status: EvaluationResult['status'];
  rubric: RubricScore[];
  strengths: string[];
  improvements: string[];
  summary: string;
  deterministic: boolean;
  degraded?: boolean;
};

export type EvaluationContext = {
  userId?: string;
  role?: string;
  priorProgress?: Pick<IProgress, 'phasesCompleted'> | null;
  lastAttempts?: Array<Pick<IAttempt, 'score' | 'subtopicId' | 'subjectId'>>;
  similarProblemIds?: string[];
};

const FALLBACK_WRITTEN_IMPROVEMENT =
  'Answer me missing keyword add karo, phir 2-3 line ka structured example likho.';

const SIMILAR_PROBLEM_IDS: Record<string, string[]> = {
  easy: ['basic-find-maximum', 'basic-count-elements', 'basic-fizzbuzz'],
  medium: ['medium-two-sum', 'medium-reverse-array', 'medium-valid-parentheses'],
  hard: ['hard-maximum-subarray', 'hard-find-duplicate'],
};

function buildWrittenPrompt(request: Extract<EvaluationRequest, { type: 'written' }>) {
  return `You are a strict, fair interviewer grading a candidate's answer for a service-based-company technical interview (TCS/Infy/Wipro level).

QUESTION: ${request.prompt}
REFERENCE ANSWER (if any): ${request.referenceAnswer ?? ''}
CANDIDATE'S ANSWER: ${request.answer}
DIFFICULTY: ${request.context.difficulty}

Grade strictly. Score each criterion 0–100. Do not be lenient. An average answer is 50–65, not 80.

Return ONLY valid JSON matching this exact schema:
{
  "accuracy": <int 0-100>,
  "completeness": <int 0-100>,
  "clarity": <int 0-100>,
  "structure": <int 0-100>,
  "examples": <int 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "summaryHinglish": "<one or two sentences in Hinglish>"
}`;
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found');
    return JSON.parse(match[0]);
  }
}

function gradeByKeywordFallback(request: Extract<EvaluationRequest, { type: 'written' }>): WrittenGrade {
  const answerTokens = new Set(
    request.answer
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2)
  );
  const referenceSource = `${request.referenceAnswer ?? ''} ${(request.rubricHints ?? []).join(' ')}`.trim();
  const referenceTokens = referenceSource
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);
  const overlap = referenceTokens.length > 0
    ? referenceTokens.filter((token) => answerTokens.has(token)).length / referenceTokens.length
    : Math.min(1, request.answer.trim().split(/\s+/).length / 80);
  const base = Math.round(Math.max(15, Math.min(75, overlap * 100)));

  return {
    accuracy: base,
    completeness: Math.max(10, base - 5),
    clarity: request.answer.length > 60 ? Math.min(80, base + 8) : Math.max(20, base - 10),
    structure: /\n|\.|:/.test(request.answer) ? Math.min(80, base + 5) : Math.max(20, base - 15),
    examples: /example|for example|jaise|e\.g\.|maan lo/i.test(request.answer) ? Math.min(80, base + 10) : Math.max(10, base - 20),
    strengths: base >= 50 ? ['Core terms answer me present hain'] : [],
    improvements: [FALLBACK_WRITTEN_IMPROVEMENT],
    summaryHinglish:
      'Answer auto-fallback se grade hua. Core idea partially match ho raha hai, but clearer structure aur example chahiye.',
  };
}

async function evaluateWritten(request: Extract<EvaluationRequest, { type: 'written' }>): Promise<RubricOutcome> {
  const prompt = buildWrittenPrompt(request);
  let degraded = false;
  let grade: WrittenGrade | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await geminiService.generateResponse(
        attempt === 0
          ? prompt
          : `${prompt}\n\nPrevious response was invalid. Return JSON only, no markdown.`
      );
      const parsed = WrittenGradeSchema.safeParse(parseJsonObject(response));
      if (parsed.success) {
        grade = parsed.data;
        break;
      }
    } catch {
      // Retry once, then fall back below.
    }
  }

  if (!grade) {
    degraded = true;
    grade = gradeByKeywordFallback(request);
  }

  const outcome = evaluateWrittenRubric(grade);
  return {
    ...outcome,
    deterministic: false,
    degraded,
  };
}

function requestPhase(request: EvaluationRequest) {
  if (request.type === 'written') return request.context.phase;
  if (request.type === 'mcq') return 'mcq';
  if (request.type === 'coding' || request.type === 'sql') return 'coding';
  return 'coding';
}

function requestSubject(request: EvaluationRequest) {
  if (request.type === 'written') return request.context.subjectId;
  if (request.type === 'sql') return 'sql';
  return request.subjectId;
}

function requestSubtopic(request: EvaluationRequest) {
  if (request.type === 'written') return undefined;
  if (request.type === 'sql') return undefined;
  return request.subtopicId;
}

function nextPhaseFor(phase: string) {
  const order = ['theory', 'mcq', 'basic', 'medium', 'hard', 'assignment', 'interview'];
  const index = order.indexOf(phase);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : 'assignment';
}

function hasPriorPhasesCompleted(phase: string, progress?: Pick<IProgress, 'phasesCompleted'> | null) {
  const order = ['theory', 'mcq', 'basic', 'medium', 'hard', 'assignment', 'interview'];
  const index = order.indexOf(phase);
  if (index <= 0) return true;
  const completed = new Set<string>(progress?.phasesCompleted ?? []);
  return order.slice(0, index).every((item) => completed.has(item));
}

function similarProblemsFor(request: EvaluationRequest, context?: EvaluationContext) {
  if (context?.similarProblemIds?.length) return context.similarProblemIds.slice(0, 3);
  if (request.type !== 'coding') return [];
  const pool = SIMILAR_PROBLEM_IDS[request.difficulty] ?? [];
  return pool.filter((problemId) => problemId !== request.problemId).slice(0, 3);
}

function lastThreeHighAttempts(score: number, request: EvaluationRequest, context?: EvaluationContext) {
  const subtopicId = requestSubtopic(request);
  const subjectId = requestSubject(request);
  const historical = (context?.lastAttempts ?? [])
    .filter((attempt) => {
      if (subtopicId && attempt.subtopicId !== subtopicId) return false;
      if (subjectId && attempt.subjectId !== subjectId) return false;
      return typeof attempt.score === 'number';
    })
    .map((attempt) => attempt.score as number);
  const latestThree = [score, ...historical].slice(0, 3);
  return latestThree.length >= 3 && latestThree.every((item) => item >= 90);
}

export function chooseNextStep(
  request: EvaluationRequest,
  score: number,
  context?: EvaluationContext
): EvaluationNextStep {
  const phase = requestPhase(request);
  const subtopicId = requestSubtopic(request) ?? 'current-subtopic';

  if (score < 50 && phase === 'mcq') {
    return { action: 'retry', reason: 'Concept clear nahi hai, theory dobara dekho.' };
  }
  if (score < 50 && phase === 'coding') {
    return { action: 'review_theory', subtopicId };
  }
  if (score >= 50 && score <= 74) {
    return { action: 'practice_similar', problemIds: similarProblemsFor(request, context) };
  }
  if (score >= 75 && score <= 89 && hasPriorPhasesCompleted(phase, context?.priorProgress)) {
    return { action: 'advance', toPhase: nextPhaseFor(phase) };
  }
  if (score >= 90 && lastThreeHighAttempts(score, request, context)) {
    return { action: 'interview_ready', topic: requestSubject(request) };
  }
  return { action: 'retry', reason: 'Ek aur attempt do; target score 90+ rakho.' };
}

async function evaluateRubric(request: EvaluationRequest): Promise<RubricOutcome> {
  switch (request.type) {
    case 'mcq':
      return {
        ...evaluateMcqRubric(request),
        deterministic: true,
      };
    case 'coding':
      return {
        ...evaluateCodingRubric(request),
        deterministic: true,
      };
    case 'sql':
      return {
        ...evaluateSqlRubric(request),
        deterministic: true,
      };
    case 'written':
      return evaluateWritten(request);
  }
}

export async function evaluate(
  input: EvaluationRequest,
  context?: EvaluationContext
): Promise<EvaluationResult> {
  const parsed = EvaluationRequestSchema.safeParse(input);
  if (!parsed.success) {
    throw parsed.error;
  }

  const startedAt = Date.now();
  const request = parsed.data;
  const outcome = await evaluateRubric(request);
  return finalizeEvaluationResult(request, outcome, context, startedAt);
}

function finalizeEvaluationResult(
  request: EvaluationRequest,
  outcome: RubricOutcome,
  context?: EvaluationContext,
  startedAt = Date.now()
): EvaluationResult {
  const improvements = ensureActionableImprovement(
    outcome.improvements,
    outcome.score,
    'Next attempt me failing point ko one-line fix ke saath update karo.'
  );

  return {
    score: outcome.score,
    level: mapScoreToLevel(outcome.score),
    status: outcome.status ?? statusFromScore(outcome.score),
    rubric: outcome.rubric,
    feedback: {
      summary: outcome.summary,
      strengths: outcome.strengths.filter(Boolean).slice(0, 3),
      improvements,
      nextStep: chooseNextStep(request, outcome.score, context),
    },
    meta: {
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: EVALUATOR_VERSION,
      deterministic: outcome.deterministic,
      latencyMs: Date.now() - startedAt,
      ...(outcome.degraded ? { degraded: true } : {}),
    },
  };
}

export function evaluateMcqBatch(
  request: Pick<Extract<EvaluationRequest, { type: 'mcq' }>, 'subjectId' | 'unitId' | 'subtopicId'>,
  items: McqBatchItem[],
  context?: EvaluationContext
): EvaluationResult {
  const startedAt = Date.now();
  const syntheticRequest: EvaluationRequest = {
    type: 'mcq',
    subjectId: request.subjectId,
    unitId: request.unitId,
    subtopicId: request.subtopicId,
    questionId: 'legacy-mcq-batch',
    selectedOptionId: 'batch',
    correctOptionId: 'batch',
    timeTakenMs: 0,
  };
  return finalizeEvaluationResult(
    syntheticRequest,
    {
      ...evaluateMcqBatchRubric(items),
      deterministic: true,
    },
    context,
    startedAt
  );
}

export const evaluatorService = {
  evaluate,
  evaluateMcqBatch,
  chooseNextStep,
  version: EVALUATOR_VERSION,
};

export type EvaluatorService = typeof evaluatorService;
