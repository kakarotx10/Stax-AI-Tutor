import { FilterQuery, Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { ATTEMPT_STATUSES, ATTEMPT_TYPES, LEARNING_PHASES } from '@/src/lib/constants';
import { Attempt, Progress, User, type IAttempt } from '@/src/models';
import { ValidationError } from '@/src/lib/errors';
import { evaluateAttemptForUser } from '@/src/controllers/evaluator.controller';
import type {
  DegradedEvaluationResult,
  EvaluationResult,
} from '@/src/validators/evaluator.validator';
import {
  listAttemptsQuerySchema,
  type ListAttemptsQueryDto,
} from '@/src/validators/attempt.validator';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('attempt.controller');

const SUCCESS_STATUSES = new Set<string>([
  ATTEMPT_STATUSES.ACCEPTED,
  ATTEMPT_STATUSES.COMPLETED,
]);

type AttemptPlain = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  [key: string]: unknown;
};

function serializeAttempt(attempt: AttemptPlain | IAttempt) {
  const source = typeof (attempt as IAttempt).toObject === 'function'
    ? ((attempt as IAttempt).toObject() as AttemptPlain)
    : (attempt as AttemptPlain);
  const { _id, __v, ...safe } = source as AttemptPlain & { __v?: number };
  void __v;

  return {
    ...safe,
    id: _id.toString(),
    userId: source.userId.toString(),
    createdAt: source.createdAt?.toISOString?.() ?? source.createdAt,
    updatedAt: source.updatedAt?.toISOString?.() ?? source.updatedAt,
    startedAt: source.startedAt?.toISOString?.() ?? source.startedAt,
    completedAt: source.completedAt?.toISOString?.() ?? source.completedAt,
  };
}

function parseUserObjectId(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ValidationError('Invalid authenticated user id');
  }
  return new Types.ObjectId(userId);
}

export async function applyEvaluationBookkeeping(
  userObjId: Types.ObjectId,
  attemptInput: Record<string, unknown>,
  evaluation: EvaluationResult | DegradedEvaluationResult
) {
  const now = new Date();
  const userUpdate: Record<string, unknown> = {
    $set: {
      lastActiveAt: now,
      'stats.lastActiveAt': now,
    },
  };

  const inc: Record<string, number> = {};
  if (SUCCESS_STATUSES.has(evaluation.status)) {
    inc['stats.totalSolved'] = 1;
  }
  if (typeof evaluation.score === 'number' && evaluation.score > 0) {
    inc['stats.xp'] = Math.round(evaluation.score);
  }
  if (Object.keys(inc).length > 0) {
    userUpdate.$inc = inc;
  }

  await User.findByIdAndUpdate(userObjId, userUpdate);

  const subjectId = typeof attemptInput.subjectId === 'string' ? attemptInput.subjectId : undefined;
  const unitId = typeof attemptInput.unitId === 'string' ? attemptInput.unitId : undefined;
  const subtopicId = typeof attemptInput.subtopicId === 'string' ? attemptInput.subtopicId : undefined;
  if (!subjectId || !unitId || !subtopicId) return;

  const phase = typeof attemptInput.phase === 'string' ? attemptInput.phase : undefined;
  const validPhase = phase && Object.values(LEARNING_PHASES).includes(phase as never);
  const nextStepAction = evaluation.feedback.nextStep.action;
  const shouldCompletePhase = validPhase && (
    evaluation.status === ATTEMPT_STATUSES.ACCEPTED ||
    evaluation.status === ATTEMPT_STATUSES.COMPLETED ||
    nextStepAction === 'advance' ||
    nextStepAction === 'interview_ready'
  );

  const update: Record<string, unknown> = {
    $inc: { attempts: 1 },
    $set: { lastAttemptAt: now },
    $setOnInsert: {
      userId: userObjId,
      subjectId,
      unitId,
      subtopicId,
      completed: false,
    },
  };

  if (typeof evaluation.score === 'number') {
    if (attemptInput.type === ATTEMPT_TYPES.MCQ) {
      update.$max = { mcqScore: evaluation.score };
    }
    if (
      attemptInput.type === ATTEMPT_TYPES.CODING ||
      attemptInput.type === ATTEMPT_TYPES.SQL ||
      attemptInput.type === ATTEMPT_TYPES.ASSIGNMENT
    ) {
      update.$max = { codingScore: evaluation.score };
    }
  }

  if (shouldCompletePhase) {
    update.$addToSet = { phasesCompleted: phase };
    if (phase === LEARNING_PHASES.ASSIGNMENT || nextStepAction === 'interview_ready') {
      update.$set = {
        ...(update.$set as Record<string, unknown>),
        completed: true,
        completedAt: now,
      };
    }
  }

  await Progress.findOneAndUpdate(
    { userId: userObjId, subjectId, unitId, subtopicId },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function createAttempt(userId: string, input: unknown) {
  const userObjId = parseUserObjectId(userId);
  const { attempt: attemptInput, evaluation } = await evaluateAttemptForUser(userId, input);
  await connectDB();

  const now = new Date();
  const attempt = await Attempt.create({
    ...attemptInput,
    userId: userObjId,
    status: evaluation.status,
    score: evaluation.score,
    level: evaluation.level,
    rubric: evaluation.rubric,
    feedback: evaluation.feedback,
    evaluatorVersion: evaluation.meta.evaluatorVersion,
    meta: evaluation.meta,
    completedAt: (attemptInput.completedAt as Date | undefined) ?? now,
  });

  await applyEvaluationBookkeeping(userObjId, attemptInput, evaluation);

  log.info(
    { userId, attemptId: attempt._id, type: attemptInput.type, status: evaluation.status },
    'attempt created'
  );

  return serializeAttempt(attempt);
}

export async function listAttempts(userId: string, input: unknown) {
  const parsed = listAttemptsQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid attempts query', parsed.error.flatten());
  }

  const query: ListAttemptsQueryDto = parsed.data;
  await connectDB();

  const filter: FilterQuery<IAttempt> = {
    userId: parseUserObjectId(userId),
  };

  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.subjectId) filter.subjectId = query.subjectId;
  if (query.cursor) {
    filter.createdAt = { $lt: new Date(query.cursor) };
  }

  const docs = await Attempt.find(filter)
    .sort({ createdAt: -1 })
    .limit(query.limit + 1)
    .lean<AttemptPlain[]>();

  const page = docs.slice(0, query.limit);
  const next = docs.length > query.limit ? page[page.length - 1] : null;

  return {
    items: page.map(serializeAttempt),
    nextCursor: next?.createdAt?.toISOString() ?? null,
  };
}
