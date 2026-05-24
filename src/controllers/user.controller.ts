import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { User, Progress, Attempt } from '@/src/models';
import { NotFoundError, ValidationError } from '@/src/lib/errors';
import { ATTEMPT_STATUSES, LEARNING_PHASES } from '@/src/lib/constants';
import {
  updateProgressSchema,
  type UpdateProgressDto,
} from '@/src/validators/progress.validator';
import { childLogger } from '@/src/lib/logger';

const log = childLogger('user.controller');
const SUCCESS_ATTEMPT_STATUSES = [
  ATTEMPT_STATUSES.ACCEPTED,
  ATTEMPT_STATUSES.COMPLETED,
];
const FAILED_ATTEMPT_STATUSES = [
  ATTEMPT_STATUSES.WRONG_ANSWER,
  ATTEMPT_STATUSES.RUNTIME_ERROR,
  ATTEMPT_STATUSES.COMPILE_ERROR,
  ATTEMPT_STATUSES.FAILED,
];

function serializeRecentAttempt(attempt: Record<string, any>) {
  return {
    id: attempt._id.toString(),
    type: attempt.type,
    status: attempt.status,
    score: attempt.score,
    problemTitle: attempt.problemTitle,
    subjectName: attempt.subjectName,
    unitName: attempt.unitName,
    subtopicName: attempt.subtopicName,
    phase: attempt.phase,
    passedCount: attempt.passedCount,
    totalCount: attempt.totalCount,
    createdAt: attempt.createdAt?.toISOString?.() ?? attempt.createdAt,
  };
}

export async function getProfile(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');
  return user.toJSON();
}

export async function getDashboardStats(userId: string) {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);
  const since = new Date();
  since.setDate(since.getDate() - 13);

  const [
    user,
    progressAgg,
    attemptTotalsAgg,
    attemptsByType,
    attemptsByStatus,
    recentAttempts,
    activityTimeline,
    weakTopics,
  ] = await Promise.all([
    User.findById(userObjId).lean(),
    Progress.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: '$subjectId',
          totalSubtopics: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } },
          avgMcqScore: { $avg: '$mcqScore' },
          avgCodingScore: { $avg: '$codingScore' },
          attempts: { $sum: '$attempts' },
          lastAttemptAt: { $max: '$lastAttemptAt' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Attempt.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $in: ['$status', SUCCESS_ATTEMPT_STATUSES] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $in: ['$status', FAILED_ATTEMPT_STATUSES] }, 1, 0] },
          },
          partial: {
            $sum: { $cond: [{ $eq: ['$status', ATTEMPT_STATUSES.PARTIAL] }, 1, 0] },
          },
          averageScore: { $avg: '$score' },
          bestScore: { $max: '$score' },
          lastAttemptAt: { $max: '$createdAt' },
        },
      },
    ]),
    Attempt.aggregate([
      { $match: { userId: userObjId } },
      { $group: { _id: '$type', count: { $sum: 1 }, averageScore: { $avg: '$score' } } },
      { $sort: { count: -1 } },
    ]),
    Attempt.aggregate([
      { $match: { userId: userObjId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Attempt.find({ userId: userObjId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean<Record<string, any>[]>(),
    Attempt.aggregate([
      { $match: { userId: userObjId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Attempt.aggregate([
      {
        $match: {
          userId: userObjId,
          status: { $in: FAILED_ATTEMPT_STATUSES },
          subtopicId: { $exists: true, $ne: '' },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            subjectId: '$subjectId',
            unitId: '$unitId',
            subtopicId: '$subtopicId',
          },
          subjectName: { $first: '$subjectName' },
          unitName: { $first: '$unitName' },
          subtopicName: { $first: '$subtopicName' },
          failedCount: { $sum: 1 },
          averageScore: { $avg: '$score' },
          latestAttemptAt: { $first: '$createdAt' },
        },
      },
      { $sort: { failedCount: -1, latestAttemptAt: -1 } },
      { $limit: 5 },
    ]),
  ]);

  if (!user) throw new NotFoundError('User');

  const totals = progressAgg.reduce(
    (acc, s) => {
      acc.totalSubtopics += s.totalSubtopics;
      acc.completed += s.completed;
      return acc;
    },
    { totalSubtopics: 0, completed: 0 }
  );
  const attemptTotals = attemptTotalsAgg[0] ?? {
    totalAttempts: 0,
    successful: 0,
    failed: 0,
    partial: 0,
    averageScore: 0,
    bestScore: 0,
    lastAttemptAt: null,
  };

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      stats: user.stats,
      loginCount: user.loginCount ?? 0,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt ?? user.stats?.lastActiveAt,
      subscription: user.subscription,
    },
    perSubject: progressAgg,
    totals: {
      ...totals,
      totalAttempts: attemptTotals.totalAttempts,
      successfulAttempts: attemptTotals.successful,
      failedAttempts: attemptTotals.failed,
      partialAttempts: attemptTotals.partial,
    },
    attempts: {
      summary: {
        total: attemptTotals.totalAttempts,
        successful: attemptTotals.successful,
        failed: attemptTotals.failed,
        partial: attemptTotals.partial,
        averageScore: Math.round(attemptTotals.averageScore ?? 0),
        bestScore: Math.round(attemptTotals.bestScore ?? 0),
        lastAttemptAt: attemptTotals.lastAttemptAt,
      },
      byType: attemptsByType.map((item) => ({
        type: item._id,
        count: item.count,
        averageScore: Math.round(item.averageScore ?? 0),
      })),
      byStatus: attemptsByStatus.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      recent: recentAttempts.map(serializeRecentAttempt),
      timeline: activityTimeline.map((item) => ({
        date: item._id,
        attempts: item.attempts,
        averageScore: Math.round(item.averageScore ?? 0),
      })),
      weakTopics: weakTopics.map((item) => ({
        subjectId: item._id.subjectId,
        unitId: item._id.unitId,
        subtopicId: item._id.subtopicId,
        subjectName: item.subjectName,
        unitName: item.unitName,
        subtopicName: item.subtopicName,
        failedCount: item.failedCount,
        averageScore: Math.round(item.averageScore ?? 0),
        latestAttemptAt: item.latestAttemptAt,
      })),
    },
  };
}

export async function upsertProgress(userId: string, input: unknown) {
  const parsed = updateProgressSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid progress input', parsed.error.flatten());
  }
  const dto: UpdateProgressDto = parsed.data;

  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const filter = {
    userId: userObjId,
    subjectId: dto.subjectId,
    unitId: dto.unitId,
    subtopicId: dto.subtopicId,
  };

  const update: Record<string, unknown> = {
    $addToSet: { phasesCompleted: dto.phase },
    $inc: { attempts: 1 },
    $set: { lastAttemptAt: new Date() },
  };

  const setFields: Record<string, unknown> = {};
  if (dto.mcqScore !== undefined) setFields.mcqScore = dto.mcqScore;
  if (dto.codingScore !== undefined) setFields.codingScore = dto.codingScore;
  if (Object.keys(setFields).length) {
    Object.assign(update.$set as object, setFields);
  }

  const doc = await Progress.findOneAndUpdate(filter, update, {
    upsert: true,
    new: true,
  });
  if (!doc) throw new NotFoundError('Progress');

  const requiredPhases = Object.values(LEARNING_PHASES);
  const completedPhases = new Set(doc.phasesCompleted);
  const isCompleted = requiredPhases.every((phase) => completedPhases.has(phase));
  const now = new Date();

  if (isCompleted && !doc.completed) {
    doc.completed = true;
    doc.completedAt = now;
    await doc.save();
  }

  await User.findByIdAndUpdate(userObjId, {
    $set: {
      lastActiveAt: now,
      'stats.lastActiveAt': now,
    },
  });

  log.info({ userId, subtopic: dto.subtopicId, phase: dto.phase }, 'progress upsert');
  return doc;
}
