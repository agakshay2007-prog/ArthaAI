import mongoose, { Document, Model, Schema } from 'mongoose';
import { BillPaymentStatus } from '../types/index.js';

export interface IBillPayment {
  userId: mongoose.Types.ObjectId;
  billId: mongoose.Types.ObjectId;
  amountInCents: number;
  paymentDate: Date;
  status: BillPaymentStatus;
  paymentMethod: string;
  transactionId?: mongoose.Types.ObjectId;
  referenceNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBillPaymentDocument extends IBillPayment, Document {
  amount: number;
}

export interface IBillPaymentModel extends Model<IBillPaymentDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
}

export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const centsToAmount = (cents: number): number => {
  return Math.round(cents) / 100;
};

const billPaymentSchema = new Schema<IBillPaymentDocument, IBillPaymentModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a bill payment'],
      index: true,
    },
    billId: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      required: [true, 'Bill ID is required for a bill payment'],
      index: true,
    },
    amountInCents: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be at least 1 cent / 0.01 currency units'],
      validate: {
        validator: (val: number) => Number.isInteger(val),
        message: 'amountInCents must be an integer minor unit',
      },
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      required: [true, 'Payment date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['paid', 'failed', 'pending'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'paid',
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
      default: 'bank_transfer',
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      index: true,
      sparse: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      maxlength: [100, 'Reference number cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
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
billPaymentSchema.virtual('amount').get(function (this: IBillPaymentDocument) {
  return centsToAmount(this.amountInCents);
});

// Compound Indexes for fast retrieval and user audit trail
billPaymentSchema.index({ billId: 1, paymentDate: -1 });
billPaymentSchema.index({ userId: 1, paymentDate: -1 });
billPaymentSchema.index({ billId: 1, status: 1 });

billPaymentSchema.statics.amountToCents = amountToCents;
billPaymentSchema.statics.centsToAmount = centsToAmount;

export const BillPayment: IBillPaymentModel =
  (mongoose.models.BillPayment as IBillPaymentModel) ||
  mongoose.model<IBillPaymentDocument, IBillPaymentModel>('BillPayment', billPaymentSchema);
