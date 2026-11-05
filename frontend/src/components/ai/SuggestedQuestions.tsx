import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelectQuestion,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Suggested Inquiries Grounded in Your Portfolio:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            onClick={() => onSelectQuestion(q)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left shadow-sm flex items-center gap-1.5 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400/60 group-hover:bg-brand-400 transition" />
            <span>{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
