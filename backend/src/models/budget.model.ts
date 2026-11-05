import mongoose, { Schema, Document, Model } from 'mongoose';
import { centsToAmount, amountToCents } from './transaction.model.js';

export type BudgetPeriod = 'monthly' | 'yearly';

export interface IBudget {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  period: BudgetPeriod;
  category: string;
  limitInCents: number; // Integer minor units (e.g. 80000 = $800.00 / ₹800.00)
  currency: string;
  startDate: Date;
  endDate: Date;
  alertThresholds: number[]; // e.g. [50, 75, 90, 100]
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBudgetDocument extends IBudget, Document {}

export interface IBudgetModel extends Model<IBudgetDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
}

const budgetSchema = new Schema<IBudgetDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Budget must be associated with an authenticated user'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      minlength: [1, 'Budget name cannot be empty'],
      maxlength: [100, 'Budget name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: undefined,
    },
    period: {
      type: String,
      enum: {
        values: ['monthly', 'yearly'],
        message: "Budget period must be either 'monthly' or 'yearly'",
      },
      default: 'monthly',
      required: [true, 'Budget period is required'],
    },
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    limitInCents: {
      type: Number,
      required: [true, 'Budget spending limit is required'],
      min: [1, 'Budget limit must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Budget limit must be an integer minor unit (cents/paise)',
      },
    },
    currency: {
      type: String,
      trim: true,
      default: 'USD',
      maxlength: [10, 'Currency code cannot exceed 10 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: IBudgetDocument, val: Date) {
          return !this.startDate || val > this.startDate;
        },
        message: 'End date must be strictly after start date',
      },
    },
    alertThresholds: {
      type: [Number],
      default: [50, 75, 90, 100],
      validate: {
        validator: function (thresholds: number[]) {
          return (
            Array.isArray(thresholds) &&
            thresholds.every((t) => typeof t === 'number' && t > 0 && t <= 200)
          );
        },
        message: 'Alert thresholds must be positive percentages between 1 and 200',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id ? String(ret._id) : undefined;
        if (typeof ret.limitInCents === 'number') {
          ret.limit = centsToAmount(ret.limitInCents);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user-isolated queries and fast lookups
budgetSchema.index({ userId: 1, period: 1, category: 1, startDate: 1, endDate: 1 });
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, category: 1 });
budgetSchema.index({ userId: 1, endDate: 1 });

budgetSchema.statics.amountToCents = amountToCents;
budgetSchema.statics.centsToAmount = centsToAmount;

export const Budget: IBudgetModel =
  (mongoose.models.Budget as IBudgetModel) ||
  mongoose.model<IBudgetDocument, IBudgetModel>('Budget', budgetSchema);
