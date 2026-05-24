import { Schema, model, models, Model, Document, Types } from 'mongoose';
import { INTERVIEW_TYPES, type InterviewType } from '@/src/lib/constants';

export interface InterviewMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IInterviewSession extends Document {
  userId: Types.ObjectId;
  type: InterviewType;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  messages: InterviewMessage[];
  currentQuestionIndex: number;
  score?: number;
  feedback?: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<InterviewMessage>(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: true,
    },
    topic: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    messages: { type: [MessageSchema], default: [] },
    currentQuestionIndex: { type: Number, default: 0 },
    score: { type: Number, min: 0, max: 100 },
    feedback: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
  },
  { timestamps: true }
);

InterviewSessionSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const InterviewSession: Model<IInterviewSession> =
  (models.InterviewSession as Model<IInterviewSession>) ||
  model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

export default InterviewSession;
