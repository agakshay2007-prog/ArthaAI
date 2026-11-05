import mongoose, { Document, Model, Schema } from 'mongoose';

export type GoalCategory =
  | 'Emergency Fund'
  | 'Real Estate & Housing'
  | 'Vehicle & Auto'
  | 'Travel & Adventure'
  | 'Retirement & Wealth'
  | 'Education'
  | 'Investments'
  | 'Tech & Gadgets'
  | 'Family & Life'
  | 'Other';

export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IGoalMilestone {
  percentage: number;
  achievedAt: Date;
}

export interface ISavingsGoal {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: GoalCategory | string;
  targetAmountInCents: number;
  currentAmountInCents: number;
  currency: string;
  startDate: Date;
  deadline: Date;
  status: GoalStatus;
  priority: GoalPriority;
  color: string;
  iconName: string;
  completedAt?: Date;
  milestones: IGoalMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISavingsGoalDocument extends ISavingsGoal, Document {
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
}

export interface ISavingsGoalModel extends Model<ISavingsGoalDocument> {
  amountToCents(amount: number): number;
  centsToAmount(cents: number): number;
}

export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};

export const centsToAmount = (cents: number): number => {
  return Math.round(cents) / 100;
};

const milestoneSchema = new Schema<IGoalMilestone>(
  {
    percentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    achievedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const savingsGoalSchema = new Schema<ISavingsGoalDocument, ISavingsGoalModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for a savings goal'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      minlength: [1, 'Goal name must be at least 1 character'],
      maxlength: [150, 'Goal name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Emergency Fund',
    },
    targetAmountInCents: {
      type: Number,
      required: [true, 'Target amount in cents is required'],
      validate: {
        validator: (v: number) => Number.isInteger(v) && v > 0,
        message: 'Target amount in cents must be a positive integer greater than zero',
      },
    },
    currentAmountInCents: {
      type: Number,
      default: 0,
      validate: {
        validator: (v: number) => Number.isInteger(v) && v >= 0,
        message: 'Current amount in cents must be a non-negative integer',
      },
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD',
      maxlength: 3,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Target deadline date is required'],
      validate: {
        validator: function (this: ISavingsGoalDocument, value: Date) {
          if (!this.startDate || !value) return true;
          return value.getTime() >= new Date(this.startDate).getTime();
        },
        message: 'Deadline cannot be before start date',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['in_progress', 'completed', 'paused', 'cancelled'],
        message: '{VALUE} is not a supported goal status',
      },
      default: 'in_progress',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    color: {
      type: String,
      default: '#8b5cf6',
      trim: true,
    },
    iconName: {
      type: String,
      default: 'Target',
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
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
        ret.targetAmount = centsToAmount(Number(ret.targetAmountInCents) || 0);
        ret.currentAmount = centsToAmount(Number(ret.currentAmountInCents) || 0);
        ret.remainingAmount = Math.max(
          0,
          centsToAmount((Number(ret.targetAmountInCents) || 0) - (Number(ret.currentAmountInCents) || 0))
        );
        const targetCents = Number(ret.targetAmountInCents) || 0;
        const currentCents = Number(ret.currentAmountInCents) || 0;
        ret.progressPercentage =
          targetCents > 0
            ? Math.min(100, Math.round((currentCents / targetCents) * 1000) / 10)
            : 0;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual getters
savingsGoalSchema.virtual('targetAmount').get(function (this: ISavingsGoalDocument) {
  return centsToAmount(this.targetAmountInCents);
});

savingsGoalSchema.virtual('currentAmount').get(function (this: ISavingsGoalDocument) {
  return centsToAmount(this.currentAmountInCents);
});

savingsGoalSchema.virtual('remainingAmount').get(function (this: ISavingsGoalDocument) {
  return Math.max(0, centsToAmount(this.targetAmountInCents - this.currentAmountInCents));
});

savingsGoalSchema.virtual('progressPercentage').get(function (this: ISavingsGoalDocument) {
  if (!this.targetAmountInCents || this.targetAmountInCents <= 0) return 0;
  return Math.min(100, Math.round((this.currentAmountInCents / this.targetAmountInCents) * 1000) / 10);
});

// Compound Indexes for fast queries and isolation
savingsGoalSchema.index({ userId: 1, status: 1 });
savingsGoalSchema.index({ userId: 1, deadline: 1 });
savingsGoalSchema.index({ userId: 1, category: 1 });
savingsGoalSchema.index({ userId: 1, priority: 1 });

savingsGoalSchema.statics.amountToCents = amountToCents;
savingsGoalSchema.statics.centsToAmount = centsToAmount;

export const SavingsGoal: ISavingsGoalModel =
  (mongoose.models.SavingsGoal as ISavingsGoalModel) ||
  mongoose.model<ISavingsGoalDocument, ISavingsGoalModel>('SavingsGoal', savingsGoalSchema);
