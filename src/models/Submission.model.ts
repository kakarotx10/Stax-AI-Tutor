import { Schema, model, models, Model, Document, Types } from 'mongoose';
import { SUBMISSION_STATUS, type SubmissionStatus } from '@/src/lib/constants';

export interface TestResult {
  passed: boolean;
  runtimeMs?: number;
  memoryKb?: number;
  expected?: string;
  actual?: string;
  errorMessage?: string;
}

export interface ISubmission extends Document {
  userId: Types.ObjectId;
  problemId: string;
  contestId?: Types.ObjectId;
  language: string;
  code: string;
  status: SubmissionStatus;
  score: number;
  testResults: TestResult[];
  totalRuntimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestResultSchema = new Schema<TestResult>(
  {
    passed: { type: Boolean, required: true },
    runtimeMs: Number,
    memoryKb: Number,
    expected: String,
    actual: String,
    errorMessage: String,
  },
  { _id: false }
);

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problemId: { type: String, required: true, index: true },
    contestId: { type: Schema.Types.ObjectId, ref: 'Contest', index: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SUBMISSION_STATUS),
      default: SUBMISSION_STATUS.PENDING,
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    testResults: { type: [TestResultSchema], default: [] },
    totalRuntimeMs: Number,
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });
SubmissionSchema.index({ contestId: 1, score: -1 });

export const Submission: Model<ISubmission> =
  (models.Submission as Model<ISubmission>) ||
  model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
