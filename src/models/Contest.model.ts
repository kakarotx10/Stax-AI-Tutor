import { Schema, model, models, Model, Document, Types } from 'mongoose';

export interface ContestParticipant {
  userId: Types.ObjectId;
  score: number;
  rank?: number;
  joinedAt: Date;
  submissions: number;
}

export interface IContest extends Document {
  title: string;
  description: string;
  domain: string;
  problemIds: string[];
  startAt: Date;
  endAt: Date;
  participants: ContestParticipant[];
  maxParticipants?: number;
  prizePool?: number;
  status: 'upcoming' | 'live' | 'ended';
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<ContestParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    rank: Number,
    joinedAt: { type: Date, default: Date.now },
    submissions: { type: Number, default: 0 },
  },
  { _id: false }
);

const ContestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    problemIds: { type: [String], default: [] },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true, index: true },
    participants: { type: [ParticipantSchema], default: [] },
    maxParticipants: Number,
    prizePool: Number,
    status: {
      type: String,
      enum: ['upcoming', 'live', 'ended'],
      default: 'upcoming',
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ContestSchema.index({ status: 1, startAt: 1 });

export const Contest: Model<IContest> =
  (models.Contest as Model<IContest>) ||
  model<IContest>('Contest', ContestSchema);

export default Contest;
