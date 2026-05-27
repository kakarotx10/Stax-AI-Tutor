import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { ATTEMPT_TYPES, type AttemptType } from '@/src/lib/constants';
import { ValidationError } from '@/src/lib/errors';
import { Attempt, Progress } from '@/src/models';
import {
  evaluatorService,
  EVALUATOR_VERSION,
  type EvaluationContext,
} from '@/src/services/evaluator.service';
import {
  EvaluationRequestSchema,
  type DegradedEvaluationResult,
  type EvaluationRequest,
  type EvaluationResult,
} from '@/src/validators/evaluator.validator';
import {
  createAttemptSchema,
  type CreateAttemptDto,
} from '@/src/validators/attempt.validator';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('evaluator.controller');

export type EvaluatedAttemptPayload = {
  attempt: Record<string, unknown>;
  evaluation: EvaluationResult | DegradedEvaluationResult;
};

type NormalizedAttempt = {
  canonical?: EvaluationRequest;
  legacyMcqItems?: NonNullable<CreateAttemptDto['mcqResults']>;
  manualEvaluation?: EvaluationResult;
  attempt: Record<string, unknown>;
  subjectId?: string;
  unitId?: string;
  subtopicId?: string;
};

function normalizeDifficulty(value?: string): 'easy' | 'medium' | 'hard' {
  const normalized = value?.toLowerCase();
  if (normalized === 'advanced' || normalized === 'hard') return 'hard';
  if (normalized === 'medium') return 'medium';
  return 'easy';
}

function normalizeLanguage(value?: string): 'python' | 'javascript' | 'java' | 'cpp' {
  const normalized = value?.toLowerCase();
  if (normalized === 'javascript' || normalized === 'js') return 'javascript';
  if (normalized === 'java') return 'java';
  if (normalized === 'cpp' || normalized === 'c++') return 'cpp';
  return 'python';
}

function baseAttemptFromCanonical(request: EvaluationRequest) {
  switch (request.type) {
    case 'mcq':
      return {
        type: ATTEMPT_TYPES.MCQ,
        subjectId: request.subjectId,
        unitId: request.unitId,
        subtopicId: request.subtopicId,
        phase: 'mcq',
        problemId: request.questionId,
        problemTitle: `MCQ ${request.questionId}`,
        totalCount: 1,
      };
    case 'coding':
      return {
        type: ATTEMPT_TYPES.CODING,
        subjectId: request.subjectId,
        unitId: request.unitId,
        subtopicId: request.subtopicId,
        phase: request.difficulty === 'easy' ? 'basic' : request.difficulty,
        difficulty: request.difficulty,
        problemId: request.problemId,
        problemTitle: request.problemId,
        language: request.language,
        code: request.code,
        passedCount: request.testResults.filter((result) => result.passed).length,
        totalCount: request.testResults.length,
        testResults: request.testResults,
      };
    case 'sql':
      return {
        type: ATTEMPT_TYPES.SQL,
        phase: 'assignment',
        problemId: request.problemId,
        problemTitle: request.problemId,
        language: 'sql',
        code: request.query,
        passedCount: 0,
        totalCount: 1,
        sqlResult: {
          rows: request.actualRows,
          rowCount: request.actualRows.length,
        },
      };
    case 'written':
      return {
        type: ATTEMPT_TYPES.WRITTEN,
        subjectId: request.context.subjectId,
        phase: request.context.phase,
        difficulty: request.context.difficulty,
        problemTitle: request.prompt.slice(0, 120) || 'Written answer',
        prompt: request.prompt,
        totalCount: 1,
        metadata: {
          answerLength: request.answer.length,
          referenceProvided: Boolean(request.referenceAnswer),
          rubricHints: request.rubricHints,
        },
      };
  }
}

function canonicalFromLegacy(dto: CreateAttemptDto): EvaluationRequest | null {
  if ((dto.type === ATTEMPT_TYPES.CODING || dto.type === ATTEMPT_TYPES.ASSIGNMENT) && dto.testResults?.length && dto.code) {
    return {
      type: 'coding',
      subjectId: dto.subjectId ?? 'unknown-subject',
      unitId: dto.unitId ?? 'unknown-unit',
      subtopicId: dto.subtopicId ?? 'unknown-subtopic',
      problemId: dto.problemId ?? dto.problemTitle,
      language: normalizeLanguage(dto.language),
      code: dto.code,
      testResults: dto.testResults.map((result) => ({
        passed: result.passed,
        input: result.input ?? '',
        expected: result.expected ?? '',
        actual: result.actual ?? result.errorMessage ?? '',
        runtimeMs: result.runtimeMs,
        status: result.status,
        errorMessage: result.errorMessage,
      })),
      difficulty: normalizeDifficulty(dto.difficulty ?? dto.phase),
    };
  }

  const metadata = dto.metadata as Record<string, unknown> | undefined;
  if (dto.type === ATTEMPT_TYPES.SQL && Array.isArray(metadata?.expectedRows) && dto.sqlResult?.rows && dto.code) {
    return {
      type: 'sql',
      problemId: dto.problemId ?? dto.problemTitle,
      query: dto.code,
      expectedRows: metadata.expectedRows as Array<Record<string, unknown>>,
      actualRows: dto.sqlResult.rows as Array<Record<string, unknown>>,
      orderSensitive: Boolean(metadata.orderSensitive),
    };
  }

  return null;
}

function isFrontendManualCompletion(dto: CreateAttemptDto) {
  const metadata = dto.metadata as Record<string, unknown> | undefined;
  return (
    dto.type === ATTEMPT_TYPES.ASSIGNMENT &&
    metadata?.category === 'frontend' &&
    dto.status === 'completed' &&
    dto.score === 100 &&
    typeof dto.code === 'string' &&
    dto.code.trim().length > 0 &&
    !dto.testResults?.length
  );
}

function frontendManualCompletionEvaluation(): EvaluationResult {
  return {
    score: 100,
    level: 'expert',
    status: 'completed',
    rubric: [
      {
        criterion: 'Frontend editor submission',
        weight: 1,
        score: 100,
        comment: 'Frontend editor assignments are completed on submit because no automated DOM judge is configured.',
      },
    ],
    feedback: {
      summary: 'Frontend assignment submit ho gaya. Automated HTML/CSS validation is exercise ke liye configured nahi hai.',
      strengths: ['Code submitted from the frontend editor'],
      improvements: [],
      nextStep: { action: 'advance', toPhase: 'interview' },
    },
    meta: {
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: EVALUATOR_VERSION,
      deterministic: true,
      latencyMs: 0,
    },
  };
}

function normalizeEvaluationInput(input: unknown): NormalizedAttempt {
  const canonical = EvaluationRequestSchema.safeParse(input);
  if (canonical.success) {
    const attempt = baseAttemptFromCanonical(canonical.data);
    return {
      canonical: canonical.data,
      attempt,
      subjectId: 'subjectId' in canonical.data ? canonical.data.subjectId : canonical.data.type === 'written' ? canonical.data.context.subjectId : undefined,
      unitId: 'unitId' in canonical.data ? canonical.data.unitId : undefined,
      subtopicId: 'subtopicId' in canonical.data ? canonical.data.subtopicId : undefined,
    };
  }

  const legacy = createAttemptSchema.safeParse(input);
  if (!legacy.success) {
    throw new ValidationError('Invalid evaluation input', {
      evaluation: canonical.error.flatten(),
      attempt: legacy.error.flatten(),
    });
  }

  const dto = legacy.data;
  const canonicalFromAttempt = canonicalFromLegacy(dto);
  return {
    canonical: canonicalFromAttempt ?? undefined,
    legacyMcqItems: dto.type === ATTEMPT_TYPES.MCQ ? dto.mcqResults : undefined,
    manualEvaluation: isFrontendManualCompletion(dto)
      ? frontendManualCompletionEvaluation()
      : undefined,
    attempt: {
      ...dto,
      type: dto.type as AttemptType,
      score: undefined,
      status: undefined,
    },
    subjectId: dto.subjectId,
    unitId: dto.unitId,
    subtopicId: dto.subtopicId,
  };
}

async function buildEvaluationContext(
  userObjId: Types.ObjectId,
  normalized: NormalizedAttempt
): Promise<EvaluationContext> {
  const progressFilter = normalized.subjectId && normalized.unitId && normalized.subtopicId
    ? {
        userId: userObjId,
        subjectId: normalized.subjectId,
        unitId: normalized.unitId,
        subtopicId: normalized.subtopicId,
      }
    : null;

  const [priorProgress, lastAttempts] = await Promise.all([
    progressFilter
      ? Progress.findOne(progressFilter).select('phasesCompleted').lean()
      : Promise.resolve(null),
    Attempt.find({
      userId: userObjId,
      ...(normalized.subjectId ? { subjectId: normalized.subjectId } : {}),
      ...(normalized.subtopicId ? { subtopicId: normalized.subtopicId } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('score subjectId subtopicId')
      .lean(),
  ]);

  return {
    priorProgress: priorProgress as EvaluationContext['priorProgress'],
    lastAttempts: lastAttempts as EvaluationContext['lastAttempts'],
  };
}

function degradedEvaluation(reason: string): DegradedEvaluationResult {
  return {
    score: null,
    level: 'beginner',
    status: 'failed',
    rubric: [],
    feedback: {
      summary: 'Evaluation me internal issue aaya. Attempt save ho gaya, thoda baad retry karo.',
      strengths: [],
      improvements: ['Same answer ko thoda baad retry karo; agar issue repeat ho, prompt/test result check karo.'],
      nextStep: { action: 'retry', reason },
    },
    meta: {
      evaluatedAt: new Date().toISOString(),
      evaluatorVersion: EVALUATOR_VERSION,
      deterministic: true,
      latencyMs: 0,
      degraded: true,
    },
  };
}

export async function evaluateAttemptForUser(
  userId: string,
  input: unknown
): Promise<EvaluatedAttemptPayload> {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ValidationError('Invalid authenticated user id');
  }

  await connectDB();
  const userObjId = new Types.ObjectId(userId);
  const normalized = normalizeEvaluationInput(input);
  const context = await buildEvaluationContext(userObjId, normalized);

  try {
    const evaluation = normalized.canonical
      ? await evaluatorService.evaluate(normalized.canonical, context)
      : normalized.manualEvaluation
      ? normalized.manualEvaluation
      : normalized.legacyMcqItems
      ? evaluatorService.evaluateMcqBatch(
          {
            subjectId: normalized.subjectId ?? 'unknown-subject',
            unitId: normalized.unitId ?? 'unknown-unit',
            subtopicId: normalized.subtopicId ?? 'unknown-subtopic',
          },
          normalized.legacyMcqItems,
          context
        )
      : degradedEvaluation('Unsupported attempt type for evaluator.');

    return {
      attempt: normalized.attempt,
      evaluation,
    };
  } catch (err) {
    log.error({ err, userId }, 'evaluation failed; saving degraded attempt');
    return {
      attempt: normalized.attempt,
      evaluation: degradedEvaluation('Evaluator service failed.'),
    };
  }
}
