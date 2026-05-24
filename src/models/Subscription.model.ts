import { Schema, model, models, Model, Document, Types } from 'mongoose';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/src/lib/constants';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'failed';
  provider: 'payu' | 'razorpay' | 'stripe' | 'manual';
  providerTransactionId?: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  startedAt?: Date;
  expiresAt?: Date;
  cancelledAt?: Date;
  rawProviderResponse?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'cancelled', 'failed'],
      default: 'pending',
      index: true,
    },
    provider: {
      type: String,
      enum: ['payu', 'razorpay', 'stripe', 'manual'],
      required: true,
    },
    providerTransactionId: { type: String, unique: true, sparse: true },
    providerPaymentId: String,
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    startedAt: Date,
    expiresAt: Date,
    cancelledAt: Date,
    rawProviderResponse: Schema.Types.Mixed,
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, status: 1, expiresAt: -1 });

export const Subscription: Model<ISubscription> =
  (models.Subscription as Model<ISubscription>) ||
  model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
