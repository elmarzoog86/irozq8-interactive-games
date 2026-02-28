import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Users, Info } from 'lucide-react';

import { ChatMessage } from '../types';

interface ChatSidebarProps {
  messages: any[];
  instructions: string[];
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ messages, instructions }) => {
  return (
    <div className="w-80 bg-black/60 backdrop-blur-xl border-l border-brand-gold/20 flex flex-col h-full font-arabic" dir="rtl">
      <div className="p-4 border-b border-brand-gold/10 flex items-center gap-2 bg-brand-gold/5">
        <MessageSquare className="w-5 h-5 text-brand-gold" />
        <h3 className="font-black text-lg text-white">الدردشة</h3>
      </div>

      <div className="p-4 bg-brand-gold/5 border-b border-brand-gold/10">
        <div className="flex items-center gap-2 mb-2 text-brand-gold/60">
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">طريقة الانضمام:</span>
        </div>
        <ul className="space-y-1">
          {instructions.map((inst, i) => (
            <li key={i} className="text-[11px] text-brand-gold/40 font-medium leading-relaxed">
              • {inst}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.slice(-20).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 p-3 rounded-2xl border border-white/5 hover:border-brand-gold/20 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-xs text-brand-gold">
                  {msg.username || msg.user}
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-snug">{msg.message || msg.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
