import { Schema, model, models, Model, Document, Types } from 'mongoose';
import {
  ATTEMPT_STATUSES,
  ATTEMPT_TYPES,
  type AttemptStatus,
  type AttemptType,
} from '@/src/lib/constants';

export interface AttemptTestResult {
  passed: boolean;
  input?: string;
  expected?: string;
  actual?: string;
  status?: string;
  errorMessage?: string;
  runtimeMs?: number;
}

export interface AttemptMcqResult {
  question: string;
  options?: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface AttemptSqlResult {
  rows?: unknown[];
  rowCount?: number;
  errorMessage?: string;
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  type: AttemptType;
  subjectId?: string;
  subjectName?: string;
  unitId?: string;
  unitName?: string;
  subtopicId?: string;
  subtopicName?: string;
  phase?: string;
  difficulty?: string;
  problemId?: string;
  problemTitle: string;
  prompt?: string;
  language?: string;
  code?: string;
  status: AttemptStatus;
  score: number;
  passedCount?: number;
  totalCount?: number;
  testResults?: AttemptTestResult[];
  mcqResults?: AttemptMcqResult[];
  sqlResult?: AttemptSqlResult;
  metadata?: Record<string, unknown>;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<AttemptTestResult>(
  {
    passed: { type: Boolean, required: true },
    input: String,
    expected: String,
    actual: String,
    status: String,
    errorMessage: String,
    runtimeMs: Number,
  },
  { _id: false }
);

const McqResultSchema = new Schema<AttemptMcqResult>(
  {
    question: { type: String, required: true },
    options: [String],
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: { type: Boolean, required: true },
    explanation: String,
  },
  { _id: false }
);

const SqlResultSchema = new Schema<AttemptSqlResult>(
  {
    rows: { type: [Schema.Types.Mixed], default: undefined },
    rowCount: Number,
    errorMessage: String,
  },
  { _id: false }
);

const AttemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: Object.values(ATTEMPT_TYPES),
      required: true,
      index: true,
    },
    subjectId: { type: String, index: true },
    subjectName: String,
    unitId: String,
    unitName: String,
    subtopicId: String,
    subtopicName: String,
    phase: String,
    difficulty: String,
    problemId: String,
    problemTitle: { type: String, required: true, trim: true },
    prompt: String,
    language: String,
    code: String,
    status: {
      type: String,
      enum: Object.values(ATTEMPT_STATUSES),
      required: true,
      index: true,
    },
    score: { type: Number, required: true, min: 0, max: 100, default: 0 },
    passedCount: { type: Number, min: 0 },
    totalCount: { type: Number, min: 0 },
    testResults: { type: [TestResultSchema], default: undefined },
    mcqResults: { type: [McqResultSchema], default: undefined },
    sqlResult: { type: SqlResultSchema, default: undefined },
    metadata: { type: Schema.Types.Mixed, default: undefined },
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

AttemptSchema.index({ userId: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, type: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, status: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, subjectId: 1, unitId: 1 });

export const Attempt: Model<IAttempt> =
  (models.Attempt as Model<IAttempt>) || model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;
