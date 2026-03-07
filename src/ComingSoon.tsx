import React from 'react';
import { motion } from 'motion/react';
import { Timer, Twitter, Twitch, Heart } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-white p-4 font-arabic relative overflow-hidden" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-gold/5 via-black to-black opacity-50" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <div className="w-32 h-32 bg-brand-gold/10 rounded-3xl flex items-center justify-center border border-brand-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <img src="/roz.png" alt="Logo" className="w-24 h-24 object-contain" />
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-black text-brand-gold tracking-tighter"
        >
          قريباً
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          نعمل حالياً على تطوير تجربة ألعاب تفاعلية جديدة ومثيرة.
          <br />
          تابعنا لتعرف موعد الإطلاق!
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6 mt-12"
        >
          <a 
            href="https://www.twitch.tv/irozq8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#9146FF] hover:bg-[#9146FF]/80 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(145,70,255,0.3)] hover:scale-105"
          >
            <Twitch className="w-6 h-6" />
            تابعنا على تويتش
          </a>
          <a 
            href="https://twitter.com/irozq8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(29,161,242,0.3)] hover:scale-105"
          >
            <Twitter className="w-6 h-6" />
            تابعنا على تويتر
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-zinc-600 text-sm font-mono">
        © 2024 iRozQ8 Games. All rights reserved.
      </div>
    </div>
  );
}
