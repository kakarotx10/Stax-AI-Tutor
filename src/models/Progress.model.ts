import { Schema, model, models, Model, Document, Types } from 'mongoose';
import { LEARNING_PHASES, type LearningPhase } from '@/src/lib/constants';

export interface IProgress extends Document {
  userId: Types.ObjectId;
  subjectId: string;
  unitId: string;
  subtopicId: string;
  phasesCompleted: LearningPhase[];
  mcqScore?: number;
  codingScore?: number;
  attempts: number;
  lastAttemptAt: Date;
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subjectId: { type: String, required: true },
    unitId: { type: String, required: true },
    subtopicId: { type: String, required: true },
    phasesCompleted: {
      type: [String],
      enum: Object.values(LEARNING_PHASES),
      default: [],
    },
    mcqScore: { type: Number, min: 0, max: 100 },
    codingScore: { type: Number, min: 0, max: 100 },
    attempts: { type: Number, default: 0, min: 0 },
    lastAttemptAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    completedAt: Date,
  },
  { timestamps: true }
);

ProgressSchema.index(
  { userId: 1, subjectId: 1, unitId: 1, subtopicId: 1 },
  { unique: true }
);
ProgressSchema.index({ userId: 1, subjectId: 1 });
ProgressSchema.index({ userId: 1, completed: 1 });

export const Progress: Model<IProgress> =
  (models.Progress as Model<IProgress>) ||
  model<IProgress>('Progress', ProgressSchema);

export default Progress;
