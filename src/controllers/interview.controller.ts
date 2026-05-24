import { Types } from 'mongoose';
import { connectDB } from '@/src/lib/db';
import { InterviewSession } from '@/src/models';
import {
  startInterviewSchema,
  respondInterviewSchema,
} from '@/src/validators/interview.validator';
import { ValidationError, NotFoundError, ForbiddenError } from '@/src/lib/errors';
import { geminiService } from '@/src/services/gemini.service';
import { childLogger } from '@/src/lib/logger';
import type { InterviewType } from '@/src/lib/constants';

const log = childLogger('interview.controller');

export async function startSession(userId: string, input: unknown) {
  const parsed = startInterviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid start payload', parsed.error.flatten());
  }
  const dto = parsed.data;

  await connectDB();

  const session = await InterviewSession.create({
    userId: new Types.ObjectId(userId),
    type: dto.type as InterviewType,
    topic: dto.topic,
    difficulty: dto.difficulty,
    messages: [
      {
        role: 'system',
        content: `You are an interviewer for ${dto.type}${
          dto.topic ? ' on ' + dto.topic : ''
        }.`,
        timestamp: new Date(),
      },
    ],
    status: 'active',
  });

  log.info({ userId, sessionId: session._id }, 'interview session started');
  return {
    sessionId: session._id?.toString(),
    type: session.type,
    status: session.status,
  };
}

export async function respond(userId: string, input: unknown) {
  const parsed = respondInterviewSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError('Invalid respond payload', parsed.error.flatten());
  }
  const { sessionId, answer } = parsed.data;

  await connectDB();
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new NotFoundError('InterviewSession');
  if (session.userId.toString() !== userId) {
    throw new ForbiddenError('Not your session');
  }
  if (session.status !== 'active') {
    throw new ValidationError('Session is not active');
  }

  session.messages.push({
    role: 'user',
    content: answer,
    timestamp: new Date(),
  });

  // Build prompt with conversation history for stateful AI conversation
  const history = session.messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const prompt = `You are an expert ${session.type} interviewer. Continue this interview conversation. Respond with one focused follow-up question. Keep your response under 80 words.\n\nCONVERSATION:\n${history}\n\nNext question:`;

  const aiText = await geminiService.generateResponse(prompt);

  session.messages.push({
    role: 'assistant',
    content: aiText,
    timestamp: new Date(),
  });
  await session.save();

  return {
    sessionId: session._id?.toString(),
    assistantMessage: session.messages[session.messages.length - 1],
  };
}

export async function endSession(userId: string, sessionId: string) {
  await connectDB();
  const session = await InterviewSession.findById(sessionId);
  if (!session) throw new NotFoundError('InterviewSession');
  if (session.userId.toString() !== userId) {
    throw new ForbiddenError('Not your session');
  }

  session.status = 'completed';
  session.endedAt = new Date();
  await session.save();

  return { ended: true, messageCount: session.messages.length };
}
