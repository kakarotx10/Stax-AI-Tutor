import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { Contest } from '@/src/models';
import { submit as submitCode } from '@/src/controllers/code.controller';
import { NotFoundError, ConflictError, ValidationError } from '@/src/lib/errors';
import {
  joinContestSchema,
  contestSubmitSchema,
} from '@/src/validators/contest.validator';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('contest.controller');

export async function listContests(filter?: 'upcoming' | 'live' | 'ended') {
  await connectDB();
  const query = filter ? { status: filter } : {};
  return Contest.find(query).sort({ startAt: -1 }).limit(50).lean();
}

export async function getContest(id: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) throw new ValidationError('Invalid contest id');
  const c = await Contest.findById(id).lean();
  if (!c) throw new NotFoundError('Contest');
  return c;
}

export async function joinContest(userId: string, input: unknown) {
  const parsed = joinContestSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid join payload', parsed.error.flatten());
  }
  const { contestId } = parsed.data;

  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const contest = await Contest.findById(contestId);
  if (!contest) throw new NotFoundError('Contest');

  const already = contest.participants.some(
    (p) => p.userId.toString() === userId
  );
  if (already) throw new ConflictError('Already joined');

  contest.participants.push({
    userId: userObjId,
    score: 0,
    joinedAt: new Date(),
    submissions: 0,
  });
  await contest.save();

  log.info({ userId, contestId }, 'user joined contest');
  return { joined: true };
}

export async function submitContestProblem(userId: string, input: unknown) {
  const parsed = contestSubmitSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid submission', parsed.error.flatten());
  }
  const dto = parsed.data;

  // Server-grade the code (no client-trusted score)
  const grading = await submitCode(userId, {
    problemId: dto.problemId,
    code: dto.code,
    language: dto.language,
    contestId: dto.contestId,
  });

  await connectDB();

  // Atomic update: keep max score across resubmissions, increment submissions
  await Contest.updateOne(
    {
      _id: new Types.ObjectId(dto.contestId),
      'participants.userId': new Types.ObjectId(userId),
    },
    {
      $max: { 'participants.$.score': grading.score },
      $inc: { 'participants.$.submissions': 1 },
    }
  );

  log.info(
    { userId, contestId: dto.contestId, score: grading.score },
    'contest submission scored server-side'
  );
  return grading;
}

export async function getLeaderboard(contestId: string, limit = 50) {
  await connectDB();
  if (!Types.ObjectId.isValid(contestId)) {
    throw new ValidationError('Invalid contest id');
  }

  const rows = await Contest.aggregate([
    { $match: { _id: new Types.ObjectId(contestId) } },
    { $unwind: '$participants' },
    { $sort: { 'participants.score': -1, 'participants.joinedAt': 1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: 'participants.userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$participants.userId',
        score: '$participants.score',
        submissions: '$participants.submissions',
        userName: '$user.name',
        userAvatar: '$user.avatar',
      },
    },
  ]);

  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
