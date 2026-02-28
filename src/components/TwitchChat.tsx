import React, { useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TwitchChatProps {
  channelName: string;
  messages: ChatMessage[];
  isConnected: boolean;
  error: string | null;
}

export const TwitchChat: React.FC<TwitchChatProps> = ({ channelName, messages, isConnected, error }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-xl font-arabic" dir="rtl">
      <div className="flex items-center justify-between px-6 py-4 bg-brand-gold/5 border-b border-brand-gold/10">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
          <h3 className="font-black text-white tracking-tight">دردشة البث</h3>
        </div>
        <span className="text-[10px] text-brand-gold/50 font-black uppercase tracking-widest" dir="ltr">#{channelName}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold">
            {error}
          </div>
        )}

        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-brand-gold/20 gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-brand-gold/10 animate-spin" />
            <span className="text-xs font-bold uppercase tracking-widest">
              {isConnected ? 'بانتظار الرسائل' : 'جاري الاتصال'}
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className="group text-base animate-in fade-in slide-in-from-bottom-2 bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-brand-gold/20 transition-all flex items-start gap-3 w-full">
            <div className="font-black text-brand-gold whitespace-nowrap pt-0.5 flex-shrink-0" dir="ltr">{msg.username}:</div>
            <div className="text-white font-medium leading-relaxed break-words break-all min-w-0 flex-1">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
