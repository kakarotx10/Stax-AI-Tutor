import { FilterQuery, Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { ATTEMPT_STATUSES } from '@/src/lib/constants';
import { Attempt, User, type IAttempt } from '@/src/models';
import { ValidationError } from '@/src/lib/errors';
import {
  createAttemptSchema,
  listAttemptsQuerySchema,
  type CreateAttemptDto,
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

export async function createAttempt(userId: string, input: unknown) {
  const parsed = createAttemptSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid attempt input', parsed.error.flatten());
  }

  const dto: CreateAttemptDto = parsed.data;
  await connectDB();

  const userObjId = parseUserObjectId(userId);
  const now = new Date();
  const attempt = await Attempt.create({
    ...dto,
    userId: userObjId,
    completedAt: dto.completedAt ?? now,
  });

  const userUpdate: Record<string, unknown> = {
    $set: {
      lastActiveAt: now,
      'stats.lastActiveAt': now,
    },
  };

  const inc: Record<string, number> = {};
  if (SUCCESS_STATUSES.has(dto.status)) {
    inc['stats.totalSolved'] = 1;
  }
  if (dto.score > 0) {
    inc['stats.xp'] = Math.round(dto.score);
  }
  if (Object.keys(inc).length > 0) {
    userUpdate.$inc = inc;
  }

  await User.findByIdAndUpdate(userObjId, userUpdate);

  log.info(
    { userId, attemptId: attempt._id, type: dto.type, status: dto.status },
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
