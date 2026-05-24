import { Schema, model, models, Model, Document } from 'mongoose';
import { hashPassword, comparePassword } from '@/src/lib/bcrypt';
import {
  USER_ROLES,
  SUBSCRIPTION_PLANS,
  type UserRole,
  type SubscriptionPlan,
} from '@/src/lib/constants';

export interface UserStats {
  xp: number;
  streak: number;
  rank: number;
  totalSolved: number;
  lastActiveAt?: Date;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  expiresAt?: Date;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  avatar?: string;
  role: UserRole;
  stats: UserStats;
  subscription: UserSubscription;
  loginCount: number;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const StatsSchema = new Schema<UserStats>(
  {
    xp: { type: Number, default: 0, min: 0 },
    streak: { type: Number, default: 0, min: 0 },
    rank: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0, min: 0 },
    lastActiveAt: Date,
  },
  { _id: false }
);

const SubscriptionSchema = new Schema<UserSubscription>(
  {
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
    },
    expiresAt: Date,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    avatar: String,
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
    },
    stats: { type: StatsSchema, default: () => ({}) },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    loginCount: { type: Number, default: 0, min: 0 },
    lastLoginAt: Date,
    lastActiveAt: Date,
    emailVerified: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { passwordHash, __v, ...safe } = ret as Record<string, unknown>;
        void passwordHash;
        void __v;
        return safe;
      },
    },
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  // Re-hash only when caller assigned plain password to passwordHash
  if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await hashPassword(this.passwordHash);
  }
  next();
});

UserSchema.methods.comparePassword = function (plain: string) {
  return comparePassword(plain, this.passwordHash);
};

UserSchema.index({ 'stats.xp': -1 });

export const User: Model<IUser> =
  (models.User as Model<IUser>) || model<IUser>('User', UserSchema);

export default User;
