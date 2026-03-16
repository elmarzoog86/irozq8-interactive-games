import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AddMusic() {
  const [songName, setSongName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songName.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/music/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: songName })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إضافة الأغنية');
      }

      setStatus('success');
      setMessage(`تم إضافة "${typeof data.song?.name === 'string' ? data.song.name : songName}" للعبة بنجاح!`);
      setSongName('');
      
      // Auto reset success state after a few seconds
      setTimeout(() => setStatus('idle'), 5000);
      
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white flex items-center justify-center p-6 font-arabic" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-zinc-900 border border-brand-cyan/20 p-8 rounded-[32px] shadow-[0_0_50px_rgba(0, 229, 255,0.1)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl -mx-32 -my-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-brand-cyan/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,255,0.3)] border border-brand-cyan">
            <Music className="w-10 h-10 text-brand-cyan" />
          </div>

          <h1 className="text-3xl font-black mb-2 text-brand-cyan glow-cyan-text">أضف أغنية للعبة!</h1>
          <p className="text-zinc-400 mb-8 font-bold">ابحث عن أي أغنية لإضافتها لقائمة لعبة "خمن الأغنية"</p>

          <form onSubmit={handleSubmit} className="w-full relative">
            <div className="relative mb-6">
              <input
                type="text"
                disabled={status === 'loading'}
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="اكتب اسم الأغنية (مثال: شيرين صبري قليل)..."
                className="w-full bg-black/50 border-2 border-brand-cyan/30 py-4 px-6 rounded-2xl outline-none focus:border-brand-cyan transition-all text-white placeholder:text-zinc-600 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || !songName.trim()}
              className="w-full bg-brand-cyan hover:bg-brand-cyan/80 disabled:opacity-50 disabled:hover:bg-brand-cyan text-brand-black font-black py-4 rounded-2xl text-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0, 229, 255,0.3)]"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  جاري البحث والإضافة...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  إضافة للعبة
                </>
              )}
            </button>
          </form>

          {/* Status Messages */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: status === 'idle' ? 0 : 1, 
              height: status === 'idle' ? 0 : 'auto',
              marginTop: status === 'idle' ? 0 : 24
            }}
            className="w-full"
          >
            {status === 'success' && (
              <div className="bg-green-500/20 border-2 border-green-500/50 text-green-400 p-4 rounded-xl flex items-center gap-3 font-bold">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <p>{message}</p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="bg-red-500/20 border-2 border-red-500/50 text-red-400 p-4 rounded-xl flex items-center gap-3 font-bold">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p>{message}</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
