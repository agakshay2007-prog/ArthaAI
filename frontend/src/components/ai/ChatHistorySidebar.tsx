import React from 'react';
import { Plus, MessageSquare, Trash2, X, Clock } from 'lucide-react';
import { AIConversationSummary } from '../../types/ai';

interface ChatHistorySidebarProps {
  conversations: AIConversationSummary[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onClearAll: () => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAll,
  isOpen,
  onClose,
  isLoading = false,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 md:w-64 glass-card border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Header & New Chat */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              <span>Inquiry History</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-violet transition-all cursor-pointer mb-4"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Financial Inquiry</span>
          </button>

          {/* Conversations List */}
          <div className="space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-900/60 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-slate-600 opacity-60" />
                <p>No previous inquiries</p>
                <p className="text-[10px] text-slate-600 mt-1">Start by asking a question</p>
              </div>
            ) : (
              conversations.map((c) => {
                const isActive = activeConversationId === c.id;
                return (
                  <div
                    key={c.id}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-brand-500/15 border-brand-500/40 text-white font-medium'
                        : 'border-transparent hover:bg-slate-900/70 text-slate-300 hover:text-white'
                    }`}
                    onClick={() => {
                      onSelectConversation(c.id);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate pr-6">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="truncate text-xs">{c.title}</div>
                        {c.lastMessageSnippet && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {c.lastMessageSnippet}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(c.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer: Clear All Chats */}
        {conversations.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80">
            <button
              onClick={onClearAll}
              className="w-full py-1.5 px-3 rounded-lg text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Chat History</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
