import { Response } from 'express';
import mongoose from 'mongoose';
import { AIConversation, IAIMessage } from '../models/ai-conversation.model.js';
import { FinancialContextService } from '../services/ai/financial-context.service.js';
import { FinancialInsightsService } from '../services/ai/financial-insights.service.js';
import { PromptBuilderService } from '../services/ai/prompt-builder.service.js';
import { GeminiService } from '../services/ai/gemini.service.js';
import { AIValidator } from '../validators/ai.validator.js';
import { isDatabaseReady } from '../config/database.js';
import { AppError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { Transaction } from '../models/transaction.model.js';
import { Budget } from '../models/budget.model.js';
import { SavingsGoal } from '../models/savings-goal.model.js';
import { Bill } from '../models/bill.model.js';
import {
  AIConversationSummary,
  AIChatResponseData,
  FinancialContextStatusResponse,
} from '../types/index.js';

export class AIController {
  /**
   * POST /api/ai/chat - Process user financial query using Gemini grounded in real data
   */
  public static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI assistant operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const validatedInput = AIValidator.validateChatInput(req.body);
    const { message, conversationId } = validatedInput;

    if (!GeminiService.isConfigured()) {
      throw AppError.serviceUnavailable(
        'Google Gemini is not configured. Please configure GEMINI_API_KEY in your backend .env file to enable live AI assistant interactions.'
      );
    }

    // 1. Retrieve verified user financial context
    const financialContext = await FinancialContextService.buildFinancialContext(userId);

    // 2. Compute deterministic financial insights
    const financialInsights = FinancialInsightsService.generateInsights(financialContext);

    // 3. Retrieve or create conversation record
    let conversation: any = null;
    let existingHistory: any[] = [];

    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: new mongoose.Types.ObjectId(conversationId),
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!conversation) {
        throw AppError.notFound('Conversation not found or access denied');
      }

      existingHistory = conversation.messages.map((m: IAIMessage) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }));
    }

    // 4. Construct prompt with system instructions and guardrails
    const systemInstruction = PromptBuilderService.buildSystemInstruction();
    const contextBlock = PromptBuilderService.formatFinancialContext(
      financialContext,
      financialInsights
    );
    const historyBlock = PromptBuilderService.formatConversationHistory(existingHistory, 6);

    const fullPrompt = `${contextBlock}\n\n${historyBlock ? `${historyBlock}\n\n` : ''}User Financial Question:\n${message}`;

    // 5. Generate content via Gemini
    const geminiResponse = await GeminiService.generateContent({
      prompt: fullPrompt,
      systemInstruction,
    });

    const assistantContent = geminiResponse.text.trim();
    const now = new Date();

    const userMessageDoc: IAIMessage = {
      role: 'user',
      content: message,
      createdAt: now,
    };

    const assistantMessageDoc: IAIMessage = {
      role: 'assistant',
      content: assistantContent,
      createdAt: new Date(),
    };

    if (conversation) {
      conversation.messages.push(userMessageDoc);
      conversation.messages.push(assistantMessageDoc);

      // Keep recent 50 messages
      if (conversation.messages.length > 50) {
        conversation.messages = conversation.messages.slice(-50);
      }

      await conversation.save();
    } else {
      // Create new conversation
      const titleSnippet = message.length > 50 ? `${message.substring(0, 47)}...` : message;
      conversation = await AIConversation.create({
        userId: new mongoose.Types.ObjectId(userId),
        title: titleSnippet,
        messages: [userMessageDoc, assistantMessageDoc],
      });
    }

    const responseData: AIChatResponseData = {
      conversationId: conversation._id.toString(),
      title: conversation.title,
      model: geminiResponse.model,
      message: {
        role: 'assistant',
        content: assistantContent,
        createdAt: assistantMessageDoc.createdAt.toISOString(),
      },
    };

    ApiResponse.success(res, 'AI response generated successfully', responseData);
  }

  /**
   * GET /api/ai/conversations - Retrieve paginated conversation history for authenticated user
   */
  public static async getConversations(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI conversation history requires MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const { page, limit } = AIValidator.validatePagination(req.query);
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [conversations, total] = await Promise.all([
      AIConversation.find({ userId: userObjectId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AIConversation.countDocuments({ userId: userObjectId }),
    ]);

    const conversationSummaries: AIConversationSummary[] = conversations.map((c) => {
      const lastMsg =
        c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      const snippet = lastMsg
        ? lastMsg.content.length > 80
          ? `${lastMsg.content.substring(0, 77)}...`
          : lastMsg.content
        : undefined;

      return {
        id: c._id.toString(),
        title: c.title,
        messageCount: c.messages ? c.messages.length : 0,
        lastMessageSnippet: snippet,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(total / limit);

    ApiResponse.success(res, 'Conversations retrieved successfully', {
      conversations: conversationSummaries,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  }

  /**
   * GET /api/ai/conversations/:id - Retrieve specific conversation with ownership validation
   */
  public static async getConversationById(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI conversation retrieval requires MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const conversationId = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const conversation = await AIConversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    if (!conversation) {
      throw AppError.notFound('Conversation not found or access denied');
    }

    ApiResponse.success(res, 'Conversation retrieved successfully', {
      id: conversation._id.toString(),
      title: conversation.title,
      messages: conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
    });
  }

  /**
   * DELETE /api/ai/conversations/:id - Delete a single conversation
   */
  public static async deleteConversation(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const conversationId = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw AppError.badRequest('Invalid conversation ID format');
    }

    const deleted = await AIConversation.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(conversationId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      throw AppError.notFound('Conversation not found or access denied');
    }

    ApiResponse.success(res, 'Conversation deleted successfully');
  }

  /**
   * DELETE /api/ai/conversations - Clear all AI conversation history for authenticated user
   */
  public static async clearAllConversations(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Live AI operations require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    // STRICT SAFETY: Delete ONLY AI conversations. Never touch financial data!
    await AIConversation.deleteMany({
      userId: new mongoose.Types.ObjectId(userId),
    });

    ApiResponse.success(res, 'All AI conversations cleared successfully');
  }

  /**
   * GET /api/ai/insights - Retrieve calculated financial insights
   */
  public static async getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Financial insights require MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const financialContext = await FinancialContextService.buildFinancialContext(userId);
    const insights = FinancialInsightsService.generateInsights(financialContext);

    ApiResponse.success(res, 'Financial insights computed successfully', insights);
  }

  /**
   * GET /api/ai/context - Retrieve a safe summary of available financial data modules
   */
  public static async getContextStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!isDatabaseReady()) {
      throw AppError.serviceUnavailable(
        'Database service is currently unconfigured. Context status requires MongoDB connection.'
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw AppError.unauthorized('User context is missing');
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [txCount, budgetCount, goalCount, billCount] = await Promise.all([
      Transaction.countDocuments({ userId: userObjectId }),
      Budget.countDocuments({ userId: userObjectId, isActive: true }),
      SavingsGoal.countDocuments({
        userId: userObjectId,
        status: { $in: ['in_progress', 'completed'] },
      }),
      Bill.countDocuments({
        userId: userObjectId,
        status: { $nin: ['cancelled', 'archived'] },
      }),
    ]);

    const statusResponse: FinancialContextStatusResponse = {
      hasTransactions: txCount > 0,
      transactionCount: txCount,
      hasBudgets: budgetCount > 0,
      budgetCount,
      hasSavingsGoals: goalCount > 0,
      savingsGoalCount: goalCount,
      hasBills: billCount > 0,
      billCount,
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
    };

    ApiResponse.success(res, 'Financial context status retrieved successfully', statusResponse);
  }
}
