import mongoose, { Document, Model, Schema } from 'mongoose';

export type ContributionType = 'deposit' | 'withdrawal';

export interface IGoalContribution {
  userId: mongoose.Types.ObjectId;
  goalId: mongoose.Types.ObjectId;
  amountInCents: number;
  type: ContributionType;
  contributionDate: Date;
  notes?: string;
  transactionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoalContributionDocument extends IGoalContribution, Document {
  amount: number;
}

export interface IGoalContributionModel extends Model<IGoalContributionDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
}

export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const centsToAmount = (cents: number): number => {
  return Math.round(cents) / 100;
};

const goalContributionSchema = new Schema<IGoalContributionDocument, IGoalContributionModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a goal contribution'],
      index: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: [true, 'Goal ID is required for a contribution'],
      index: true,
    },
    amountInCents: {
      type: Number,
      required: [true, 'Contribution amount in cents is required'],
      validate: {
        validator: (v: number) => Number.isInteger(v) && v > 0,
        message: 'Contribution amount must be a positive integer greater than zero',
      },
    },
    type: {
      type: String,
      enum: {
        values: ['deposit', 'withdrawal'],
        message: '{VALUE} is not a valid contribution type',
      },
      default: 'deposit',
    },
    contributionDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
      required: false,
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

goalContributionSchema.virtual('amount').get(function (this: IGoalContributionDocument) {
  return centsToAmount(this.amountInCents);
});

// Indexes for fast history queries
goalContributionSchema.index({ goalId: 1, contributionDate: -1 });
goalContributionSchema.index({ userId: 1, contributionDate: -1 });
goalContributionSchema.index({ userId: 1, goalId: 1 });

goalContributionSchema.statics.amountToCents = amountToCents;
goalContributionSchema.statics.centsToAmount = centsToAmount;

export const GoalContribution: IGoalContributionModel =
  (mongoose.models.GoalContribution as IGoalContributionModel) ||
  mongoose.model<IGoalContributionDocument, IGoalContributionModel>('GoalContribution', goalContributionSchema);
