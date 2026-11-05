import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  History,
  Shield,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  AIMessageItem,
  AIConversationSummary,
  FinancialInsightsData,
} from '../../types/ai';
import { aiService } from '../../services/ai';
import {
  DEMO_AI_SUGGESTED_QUESTIONS,
  DEMO_AI_PRECOMPUTED_ANSWERS,
  DEMO_FINANCIAL_INSIGHTS,
} from '../../data/mockFinanceData';
import { ChatMessageItem } from '../ai/ChatMessageItem';
import { SuggestedQuestions } from '../ai/SuggestedQuestions';
import { FinancialInsightPills } from '../ai/FinancialInsightPills';
import { ChatHistorySidebar } from '../ai/ChatHistorySidebar';

interface AIAssistantViewProps {
  isGuestDemo?: boolean;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  isGuestDemo = false,
}) => {
  // Chat state
  const [messages, setMessages] = useState<AIMessageItem[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your **ArthaAI Wealth Copilot**, powered by Google Gemini. I continuously evaluate your cash flows, budget burn rates, savings goals velocity, and upcoming recurring bills.\n\nAsk me any question about your finances, or select one of the suggested inquiries below.',
      createdAt: new Date().toISOString(),
      isSimulated: isGuestDemo,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History & Conversations state
  const [conversations, setConversations] = useState<AIConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Financial Insights telemetry state
  const [insights, setInsights] = useState<FinancialInsightsData | null>(
    isGuestDemo ? DEMO_FINANCIAL_INSIGHTS : null
  );
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load live insights & conversations on mount for authenticated users
  useEffect(() => {
    if (isGuestDemo) {
      setInsights(DEMO_FINANCIAL_INSIGHTS);
      return;
    }

    const loadData = async () => {
      setIsLoadingInsights(true);
      setIsLoadingHistory(true);

      try {
        const [insightsData, convData] = await Promise.allSettled([
          aiService.getFinancialInsights(),
          aiService.getConversations(1, 15),
        ]);

        if (insightsData.status === 'fulfilled') {
          setInsights(insightsData.value);
        } else {
          // Fall back gracefully to demo insights if database service unconfigured
          setInsights(DEMO_FINANCIAL_INSIGHTS);
        }

        if (convData.status === 'fulfilled') {
          setConversations(convData.value.conversations);
        }
      } catch {
        setInsights(DEMO_FINANCIAL_INSIGHTS);
      } finally {
        setIsLoadingInsights(false);
        setIsLoadingHistory(false);
      }
    };

    loadData();
  }, [isGuestDemo]);

  // Handle asking question (via form or suggested pills)
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isTyping) return;

    setErrorMessage(null);

    const userMessage: AIMessageItem = {
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      isSimulated: isGuestDemo,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Guest Demo / Simulation Mode
    if (isGuestDemo) {
      setTimeout(() => {
        const matched =
          DEMO_AI_PRECOMPUTED_ANSWERS[trimmed] ||
          `Based on your current financial model, maintaining a **48.9% savings rate** provides optimal financial resilience. Your net surplus of **+$4,619.75** covers your monthly goals of $1,500 with significant discretionary headroom.`;

        const assistantMsg: AIMessageItem = {
          role: 'assistant',
          content: matched,
          createdAt: new Date().toISOString(),
          isSimulated: true,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
      }, 700);
      return;
    }

    // Authenticated Live Mode via Backend & Gemini API
    try {
      const response = await aiService.sendMessage(trimmed, activeConversationId || undefined);

      setActiveConversationId(response.conversationId);

      const assistantMsg: AIMessageItem = {
        role: 'assistant',
        content: response.message.content,
        createdAt: response.message.createdAt,
        isSimulated: response.isSimulated || false,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversations list to update titles/counts
      try {
        const convList = await aiService.getConversations(1, 15);
        setConversations(convList.conversations);
      } catch {
        // Silent error
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      const errMsg = err?.message || 'Failed to generate AI response. Please try again.';

      // Check if it's because Gemini or MongoDB is unconfigured, provide clean fallback info
      if (errMsg.includes('not configured') || errMsg.includes('unconfigured')) {
        setErrorMessage(errMsg);
        const fallbackAnswer =
          DEMO_AI_PRECOMPUTED_ANSWERS[trimmed] ||
          'Live Gemini API is currently in standby mode. Here is pre-calculated analytical guidance based on your portfolio telemetry: Maintaining consistent contributions toward your primary goals will yield compounding benefits over the next 12-month horizon.';

        const fallbackMsg: AIMessageItem = {
          role: 'assistant',
          content: fallbackAnswer,
          createdAt: new Date().toISOString(),
          isSimulated: true,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } else {
        setErrorMessage(errMsg);
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Switch to an existing conversation
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setIsTyping(true);
    setErrorMessage(null);

    try {
      const detail = await aiService.getConversation(id);
      setMessages(detail.messages);
    } catch (err: any) {
      setErrorMessage('Failed to load conversation history.');
    } finally {
      setIsTyping(false);
    }
  };

  // Start new inquiry
  const handleNewChat = () => {
    setActiveConversationId(null);
    setErrorMessage(null);
    setMessages([
      {
        role: 'assistant',
        content:
          'Starting a fresh financial inquiry. How can I assist your wealth strategy today?',
        createdAt: new Date().toISOString(),
        isSimulated: isGuestDemo,
      },
    ]);
  };

  // Delete a single conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await aiService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch (err: any) {
      setErrorMessage('Failed to delete conversation.');
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    if (!window.confirm('Are you sure you want to clear your AI conversation history? Your financial transactions, budgets, and savings goals will not be touched.')) {
      return;
    }

    try {
      await aiService.clearAllConversations();
      setConversations([]);
      handleNewChat();
    } catch (err: any) {
      setErrorMessage('Failed to clear conversation history.');
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-violet">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                ArthaAI Financial Copilot
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {isGuestDemo ? 'Demo AI' : 'Gemini 2.5'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Personalized intelligence grounded in your verified financial ledger
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="px-3 py-1.5 rounded-xl glass-card border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="Toggle conversation history"
          >
            <History className="w-3.5 h-3.5 text-brand-400" />
            <span>History</span>
            {conversations.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                {conversations.length}
              </span>
            )}
          </button>

          <button
            onClick={handleNewChat}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-500/40 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            title="New Chat"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Financial Intelligence Telemetry Banner */}
      <FinancialInsightPills insights={insights} isLoading={isLoadingInsights} />

      {/* 3. Main Chat Container with History Drawer */}
      <div className="flex gap-4 relative">
        <ChatHistorySidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onClearAll={handleClearAllConversations}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isLoading={isLoadingHistory}
        />

        {/* Chat Main View */}
        <div className="flex-1 glass-card rounded-2xl border border-slate-800/80 p-4 md:p-6 flex flex-col justify-between min-h-[560px] max-h-[700px]">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {messages.map((msg, index) => (
              <ChatMessageItem key={msg.id || index} message={msg} />
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 my-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-violet animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="glass-card border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-300 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  <span>Synthesizing portfolio intelligence via Gemini...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-amber-400 hover:text-white font-bold ml-2 text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Suggested Quick Questions (Shown when messages count is low) */}
          {messages.length <= 3 && !isTyping && (
            <div className="mb-4 pt-2 border-t border-slate-800/60">
              <SuggestedQuestions
                questions={DEMO_AI_SUGGESTED_QUESTIONS.slice(0, 4)}
                onSelectQuestion={handleSendMessage}
                disabled={isTyping}
              />
            </div>
          )}

          {/* Chat Input Bar & Guardrail Notice */}
          <div className="pt-2 border-t border-slate-800/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  maxLength={2000}
                  placeholder="Ask ArthaAI about savings, runway, budgets, or bills..."
                  disabled={isTyping}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all shadow-inner disabled:opacity-50"
                />
                {inputText.length > 100 && (
                  <span className="absolute right-3 top-3.5 text-[10px] text-slate-500">
                    {inputText.length}/2000
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-glow-violet transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Send inquiry"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Read-Only Safety & Privacy Notice */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 px-1">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>Read-only assistant. Cannot execute bank transfers or alter accounts.</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-500" />
                <span>Press Enter to send</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
