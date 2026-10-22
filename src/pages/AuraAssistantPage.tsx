import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { queryAuraAssistant } from '../lib/gemini';
import { Bot, Send, Sparkles, User, HelpCircle, ArrowRight } from 'lucide-react';

interface AuraAssistantPageProps {
  onNavigate: (page: PageId) => void;
}

interface ChatMessage {
  id: string;
  sender: 'aura' | 'user';
  text: string;
  source?: 'gemini' | 'campus_faq_kb';
  timestamp: string;
}

export const AuraAssistantPage: React.FC<AuraAssistantPageProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'aura',
      text: 'Hello! I am AURA, the GNIOT Campus Recovery Assistant. How can I help you report an item, track a lost belonging, or navigate the verification process today?',
      source: 'campus_faq_kb',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    'How do I claim a found phone or calculator?',
    'Where is the Main Gate 1 Security Desk located?',
    'What happens after I file a lost item report?',
    'Can I save drafts when disconnected from Wi-Fi?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        text: m.text,
      }));

      const res = await queryAuraAssistant(text, history);

      const auraMsg: ChatMessage = {
        id: `aura-${Date.now()}`,
        sender: 'aura',
        text: res.reply,
        source: res.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, auraMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `aura-${Date.now()}`,
          sender: 'aura',
          text: 'I encountered an error retrieving that answer. Please consult the Campus Help Desks section or visit Main Gate 1 Security.',
          source: 'campus_faq_kb',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#D9A441] mb-1">
          <Bot className="w-3.5 h-3.5" />
          <span>CAMPUS GUIDANCE &amp; RECOVERY ASSISTANT</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-[#E8EDF2]">
          AURA AI Assistant
        </h1>
        <p className="text-xs text-[#BFC8D2] mt-0.5">
          Ask questions about GNIOT lost &amp; found regulations, claim verification, desk hours, or visual matching.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2 text-xs">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-lg border border-[#E8EDF2]/10 bg-[#30152F]/40 hover:bg-[#30152F] text-[#E8EDF2] hover:border-[#D9A441]/40 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Area Container */}
      <div className="rounded-2xl glass-card border border-[#E8EDF2]/15 bg-[#1D1020]/90 shadow-2xl flex flex-col h-[520px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {messages.map((m) => {
            const isAura = m.sender === 'aura';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isAura ? 'justify-start' : 'justify-end'}`}
              >
                {isAura && (
                  <div className="w-7 h-7 rounded-lg bg-[#30152F] border border-[#D9A441]/40 flex items-center justify-center text-[#D9A441] shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-lg rounded-xl p-3.5 space-y-1.5 leading-relaxed ${
                    isAura
                      ? 'bg-[#30152F]/60 text-[#E8EDF2] border border-[#E8EDF2]/10'
                      : 'bg-[#D9A441] text-[#1D1020] font-medium shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{m.timestamp}</span>
                    {isAura && (
                      <span className="font-mono">
                        {m.source === 'gemini' ? 'Grounded AI' : 'GNIOT Campus KB'}
                      </span>
                    )}
                  </div>
                </div>

                {!isAura && (
                  <div className="w-7 h-7 rounded-lg bg-[#30152F] border border-[#E8EDF2]/20 flex items-center justify-center text-[#E8EDF2] shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-[#BFC8D2] pl-1">
              <div className="w-6 h-6 rounded-lg bg-[#30152F] flex items-center justify-center text-[#D9A441]">
                <Sparkles className="w-3 h-3 animate-spin" />
              </div>
              <span>AURA is consulting campus repository...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#E8EDF2]/10 bg-[#130b15]/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about recovery procedures, location hours, or claim questions..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-[#1D1020] px-4 py-2.5 rounded-xl border border-[#E8EDF2]/15 text-xs text-[#E8EDF2] placeholder-[#BFC8D2]/50 focus:border-[#D9A441] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#D9A441] text-[#1D1020] hover:bg-[#F3C35C] disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
