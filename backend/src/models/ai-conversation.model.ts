import mongoose, { Schema, Document, Model } from 'mongoose';

export type AIMessageRole = 'user' | 'assistant';

export interface IAIMessage {
  role: AIMessageRole;
  content: string;
  createdAt: Date;
}

export interface IAIConversation {
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IAIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAIConversationDocument extends IAIConversation, Document {}

export interface IAIConversationModel extends Model<IAIConversationDocument> {}

const messageSchema = new Schema<IAIMessage>(
  {
    role: {
      type: String,
      enum: {
        values: ['user', 'assistant'],
        message: "Message role must be either 'user' or 'assistant'",
      },
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      minlength: [1, 'Message content cannot be empty'],
      maxlength: [4000, 'Message content cannot exceed 4000 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Conversation must be associated with an authenticated user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Conversation title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      default: 'New Financial Inquiry',
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: [
        (val: IAIMessage[]) => val.length <= 50,
        'Conversation cannot exceed 50 messages. Please start a new conversation.',
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for querying user's conversations sorted by latest activity
aiConversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversation: IAIConversationModel =
  (mongoose.models.AIConversation as IAIConversationModel) ||
  mongoose.model<IAIConversationDocument, IAIConversationModel>('AIConversation', aiConversationSchema);
