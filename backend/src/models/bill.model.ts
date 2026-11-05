import mongoose, { Document, Model, Schema } from 'mongoose';
import { BillCategory, BillFrequency, BillStatus } from '../types/index.js';

export interface IBill {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: BillCategory | string;
  provider?: string;
  amountInCents: number;
  currency: string;
  frequency: BillFrequency;
  startDate: Date;
  dueDate: Date;
  nextDueDate?: Date;
  autoRenew: boolean;
  reminderDays: number[];
  status: BillStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBillDocument extends IBill, Document {
  amount: number;
  isOverdue: boolean;
  daysUntilDue: number;
}

export interface IBillModel extends Model<IBillDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
  calculateNextDueDate(currentDueDate: Date, frequency: BillFrequency): Date | null;
  getDaysInMonth(year: number, monthIndex: number): number;
}

export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const centsToAmount = (cents: number): number => {
  return Math.round(cents) / 100;
};

/**
 * Returns the number of days in a given month (0-indexed month: 0=Jan, 1=Feb, etc.)
 */
export const getDaysInMonth = (year: number, monthIndex: number): number => {
  // Day 0 of the next month is the last day of monthIndex
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
};

/**
 * Deterministic schedule calculations for recurring bills.
 * Implements a strict month-end clamping policy preventing JavaScript date overflow.
 * (e.g. Jan 31 + 1 month becomes Feb 28/29, NOT March 3).
 */
export const calculateNextDueDate = (currentDueDate: Date, frequency: BillFrequency): Date | null => {
  if (frequency === 'one_time') {
    return null;
  }

  const d = new Date(currentDueDate);
  const origYear = d.getUTCFullYear();
  const origMonth = d.getUTCMonth();
  const origDay = d.getUTCDate();
  const hours = d.getUTCHours();
  const mins = d.getUTCMinutes();
  const secs = d.getUTCSeconds();
  const ms = d.getUTCMilliseconds();

  if (frequency === 'weekly') {
    const next = new Date(d.getTime());
    next.setUTCDate(next.getUTCDate() + 7);
    return next;
  }

  if (frequency === 'monthly') {
    const targetMonthIndex = (origMonth + 1) % 12;
    const targetYear = origMonth + 1 > 11 ? origYear + 1 : origYear;
    const maxDays = getDaysInMonth(targetYear, targetMonthIndex);
    const targetDay = Math.min(origDay, maxDays);
    return new Date(Date.UTC(targetYear, targetMonthIndex, targetDay, hours, mins, secs, ms));
  }

  if (frequency === 'quarterly') {
    const totalMonths = origMonth + 3;
    const targetMonthIndex = totalMonths % 12;
    const targetYear = origYear + Math.floor(totalMonths / 12);
    const maxDays = getDaysInMonth(targetYear, targetMonthIndex);
    const targetDay = Math.min(origDay, maxDays);
    return new Date(Date.UTC(targetYear, targetMonthIndex, targetDay, hours, mins, secs, ms));
  }

  if (frequency === 'yearly') {
    const targetYear = origYear + 1;
    const maxDays = getDaysInMonth(targetYear, origMonth);
    const targetDay = Math.min(origDay, maxDays);
    return new Date(Date.UTC(targetYear, origMonth, targetDay, hours, mins, secs, ms));
  }

  return null;
};

const billSchema = new Schema<IBillDocument, IBillModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a bill'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true,
      minlength: [1, 'Bill name must have at least 1 character'],
      maxlength: [150, 'Bill name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Bill category is required'],
      trim: true,
      default: 'Other',
    },
    provider: {
      type: String,
      trim: true,
      maxlength: [150, 'Provider name cannot exceed 150 characters'],
      default: '',
    },
    amountInCents: {
      type: Number,
      required: [true, 'Bill amount is required'],
      min: [1, 'Bill amount must be at least 1 cent / 0.01 currency units'],
      validate: {
        validator: (val: number) => Number.isInteger(val),
        message: 'amountInCents must be an integer minor unit',
      },
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD',
      maxlength: 3,
    },
    frequency: {
      type: String,
      enum: {
        values: ['one_time', 'weekly', 'monthly', 'quarterly', 'yearly'],
        message: '{VALUE} is not a valid bill recurrence frequency',
      },
      default: 'monthly',
      index: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    nextDueDate: {
      type: Date,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    reminderDays: {
      type: [Number],
      default: [7, 3, 1],
      validate: {
        validator: (arr: number[]) =>
          Array.isArray(arr) &&
          arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 60),
        message: 'Reminder days must be an array of non-negative integers (0-60)',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused', 'cancelled', 'completed'],
        message: '{VALUE} is not a valid bill status',
      },
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret._id;
        delete ret.__v;
        ret.amount = centsToAmount(Number(ret.amountInCents) || 0);
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters
billSchema.virtual('amount').get(function (this: IBillDocument) {
  return centsToAmount(this.amountInCents);
});

billSchema.virtual('isOverdue').get(function (this: IBillDocument) {
  if (this.status !== 'active') return false;
  const now = new Date();
  const due = new Date(this.dueDate);
  // Due date is overdue if end of due date (23:59:59) is in the past
  return now.getTime() > due.getTime();
});

billSchema.virtual('daysUntilDue').get(function (this: IBillDocument) {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffMs = due.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
});

// Pre-save hook: auto-compute nextDueDate if not explicitly provided or when frequency changes
billSchema.pre('save', function (next) {
  if (this.isModified('dueDate') || this.isModified('frequency') || !this.nextDueDate) {
    if (this.frequency === 'one_time') {
      this.nextDueDate = undefined;
    } else {
      this.nextDueDate = calculateNextDueDate(this.dueDate, this.frequency) ?? undefined;
    }
  }
  next();
});

// Compound Indexes for fast queries, filtering and strict user isolation
billSchema.index({ userId: 1, status: 1 });
billSchema.index({ userId: 1, dueDate: 1 });
billSchema.index({ userId: 1, nextDueDate: 1 });
billSchema.index({ userId: 1, category: 1 });
billSchema.index({ userId: 1, frequency: 1 });

billSchema.statics.amountToCents = amountToCents;
billSchema.statics.centsToAmount = centsToAmount;
billSchema.statics.calculateNextDueDate = calculateNextDueDate;
billSchema.statics.getDaysInMonth = getDaysInMonth;

export const Bill: IBillModel =
  (mongoose.models.Bill as IBillModel) ||
  mongoose.model<IBillDocument, IBillModel>('Bill', billSchema);
