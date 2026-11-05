import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  DEMO_AI_SUGGESTED_QUESTIONS,
  DEMO_AI_PRECOMPUTED_ANSWERS,
} from '../../data/mockFinanceData';
import { AIChatMessage } from '../../types/finance';

export const AIAssistantCard: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      content:
        'Hello Alex! I am your ArthaAI Financial Copilot. I analyze your cash flows, savings trajectory, and upcoming recurring bills. How can I assist your wealth strategy today?',
      timestamp: 'Just now',
      isDemoResponse: true,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleAsk = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: AIChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      content: questionText,
      timestamp: 'Just now',
      isDemoResponse: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    // Realistic typing response simulation for demo
    setTimeout(() => {
      const matchedAnswer =
        DEMO_AI_PRECOMPUTED_ANSWERS[questionText] ||
        `Based on your current financial model, allocating capital toward liquid savings while maintaining your debt-to-income ratio below 15% keeps you in the top 10% of portfolio health. Consider maintaining your $1,500 monthly goal contributions.`;

      const aiMsg: AIChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        content: matchedAnswer,
        timestamp: 'Just now',
        isDemoResponse: true,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'm-1',
        sender: 'assistant',
        content:
          'Hello Alex! I am your ArthaAI Financial Copilot. I analyze your cash flows, savings trajectory, and upcoming recurring bills. How can I assist your wealth strategy today?',
        timestamp: 'Just now',
        isDemoResponse: true,
      },
    ]);
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-brand-600/15 via-indigo-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-violet">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">ArthaAI Financial Copilot</h3>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Demo AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Contextual personal finance guidance</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition cursor-pointer"
            title="Reset Conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-400 mb-2">Suggested Inquiries:</div>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_AI_SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={isTyping}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/10 transition cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3 max-h-60 overflow-y-auto mb-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-brand-600/20 border border-brand-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-brand-400" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none shadow'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-indigo-300" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-1">
              <Bot className="w-3.5 h-3.5 text-brand-400 animate-spin" />
              <span>Analyzing financial model...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuestion);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask ArthaAI about savings, cash flow, or budgets..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isTyping}
            className="p-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-glow-violet transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Frontend demo assistant with precomputed financial intelligence models</span>
        </div>
      </div>
    </div>
  );
};

