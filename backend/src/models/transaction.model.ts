import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'upi'
  | 'other';

export type TransactionStatus = 'completed' | 'pending';

export const STANDARD_CATEGORIES = [
  'Salary & Earnings',
  'Investments & Dividends',
  'Housing & Rent',
  'Food & Dining',
  'Technology & SaaS',
  'Transportation',
  'Utilities & Bills',
  'Entertainment & Leisure',
  'Healthcare & Wellness',
  'Shopping & Retail',
  'Other',
] as const;

export type StandardCategory = (typeof STANDARD_CATEGORIES)[number];

export interface ITransaction {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  amountInCents: number; // Integer minor units (e.g. 1050 = $10.50 or ₹10.50)
  type: TransactionType;
  category: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  transactionDate: Date;
  notes?: string;
  account: string;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionDocument extends ITransaction, Document {}

export interface ITransactionModel extends Model<ITransactionDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
}

/**
 * Precision-safe helper: Converts decimal currency units to integer minor units (cents/paise)
 * Prevents IEEE-754 floating-point inaccuracies
 */
export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Precision-safe helper: Converts integer minor units to decimal currency units
 */
export const centsToAmount = (cents: number): number => {
  return Math.round(cents) / 100;
};

const transactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Transaction must be associated with an authenticated user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: undefined,
    },
    amountInCents: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [1, 'Transaction amount must be greater than zero'],
      validate: {
        validator: Number.isInteger,
        message: 'Transaction amount must be an integer minor unit (cents/paise)',
      },
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: "Transaction type must be either 'income' or 'expense'",
      },
      required: [true, 'Transaction type is required'],
    },
    category: {
      type: String,
      required: [true, 'Transaction category is required'],
      trim: true,
      maxlength: [100, 'Category cannot exceed 100 characters'],
    },
    merchant: {
      type: String,
      trim: true,
      maxlength: [100, 'Merchant name cannot exceed 100 characters'],
      default: undefined,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'upi', 'other'],
        message: 'Invalid payment method',
      },
      default: 'bank_transfer',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: undefined,
    },
    account: {
      type: String,
      trim: true,
      maxlength: [100, 'Account name cannot exceed 100 characters'],
      default: 'Primary Checking',
    },
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id ? String(ret._id) : undefined;
        // Decimal representation computed from integer minor units
        if (typeof ret.amountInCents === 'number') {
          ret.amount = centsToAmount(ret.amountInCents);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user-isolated queries and performance
transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, title: 'text', merchant: 'text' });

transactionSchema.statics.amountToCents = amountToCents;
transactionSchema.statics.centsToAmount = centsToAmount;

export const Transaction: ITransactionModel =
  (mongoose.models.Transaction as ITransactionModel) ||
  mongoose.model<ITransactionDocument, ITransactionModel>('Transaction', transactionSchema);
