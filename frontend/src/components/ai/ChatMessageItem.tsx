import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { AIMessageItem } from '../../types/ai';

interface ChatMessageItemProps {
  message: AIMessageItem;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formatTimestamp = (isoDate?: string) => {
    if (!isoDate) return 'Just now';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return 'Just now';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  // Render basic markdown like bold, headers, and bullet lists cleanly
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Heading level 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-white text-xs mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading level 2
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-bold text-white text-sm mt-3 mb-1.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-slate-300">
            <span className="text-brand-400 font-bold shrink-0">•</span>
            <span>{parseInlineFormatting(itemText)}</span>
          </div>
        );
      }
      // Numbered list items
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1 text-slate-300">
              <span className="text-brand-400 font-semibold shrink-0 text-[11px]">{match[1]}.</span>
              <span>{parseInlineFormatting(match[2])}</span>
            </div>
          );
        }
      }
      // Empty line / paragraph break
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard line
      return (
        <p key={idx} className="my-1 leading-relaxed">
          {parseInlineFormatting(line)}
        </p>
      );
    });
  };

  // Helper for inline **bold** and `code`
  const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-brand-300 text-[11px] font-mono">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex items-start gap-3 my-3 group ${
        isUser ? 'flex-row-reverse justify-start' : 'justify-start'
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white border border-indigo-400/30'
            : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white border border-brand-400/30 shadow-glow-violet'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble Content */}
      <div className={`max-w-[85%] md:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-medium text-slate-400">
            {isUser ? 'You' : 'ArthaAI Copilot'}
          </span>
          <span className="text-[10px] text-slate-500">
            {formatTimestamp(message.createdAt)}
          </span>
          {message.isSimulated && (
            <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Demo Simulation
            </span>
          )}
        </div>

        <div
          className={`p-4 rounded-2xl text-xs relative ${
            isUser
              ? 'bg-gradient-to-br from-brand-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-brand-900/20'
              : 'glass-card border border-slate-800 text-slate-200 rounded-tl-none shadow-md backdrop-blur-md'
          }`}
        >
          <div className="space-y-1">{renderFormattedContent(message.content)}</div>

          {!isUser && (
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-700/50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              title="Copy response"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
