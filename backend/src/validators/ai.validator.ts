import mongoose from 'mongoose';
import { AppError } from '../utils/apiError.js';

export interface ValidatedChatInput {
  message: string;
  conversationId?: string;
}

export class AIValidator {
  /**
   * Validate incoming chat message payload
   */
  public static validateChatInput(body: any): ValidatedChatInput {
    if (!body || typeof body !== 'object') {
      throw AppError.badRequest('Request body must be a JSON object');
    }

    const { message, conversationId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw AppError.badRequest('Message is required and cannot be empty');
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length > 2000) {
      throw AppError.badRequest('Message cannot exceed 2000 characters');
    }

    let sanitizedConversationId: string | undefined = undefined;
    if (conversationId) {
      if (typeof conversationId !== 'string' || !mongoose.Types.ObjectId.isValid(conversationId)) {
        throw AppError.badRequest('Invalid conversationId format');
      }
      sanitizedConversationId = conversationId;
    }

    return {
      message: trimmedMessage,
      conversationId: sanitizedConversationId,
    };
  }

  /**
   * Validate pagination query parameters
   */
  public static validatePagination(query: any): { page: number; limit: number } {
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit as string, 10) || 10));
    return { page, limit };
  }
}
