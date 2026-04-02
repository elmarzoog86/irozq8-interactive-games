import React, { useEffect, useState } from 'react';
import { Music, Clock, CheckCircle, RefreshCw, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface MusicRequest {
  name: string;
  time: string;
  added: boolean;
}

export default function MusicRequests() {
  const [requests, setRequests] = useState<MusicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/music/requests');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Auto refresh every 10 seconds
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-brand-black text-white p-8 font-arabic" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center glow-cyan">
              <Music className="w-8 h-8 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">طلبات الأغاني</h1>
              <p className="text-zinc-400">الأغاني التي طلبها المتابعين وتم محاولة إضافتها</p>
            </div>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-6 py-3 bg-brand-black/50 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
          {requests.length === 0 ? (
            <div className="p-16 text-center text-zinc-500">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-xl">لا توجد طلبات أغاني حالياً</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {requests.map((req, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    {req.added ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-dashed" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-brand-cyan transition-colors">
                        {req.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Clock className="w-4 h-4" />
                        {new Date(req.time).toLocaleTimeString('ar-SA')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(req.name, i)}
                    className="p-3 bg-brand-black/50 hover:bg-brand-cyan/20 border border-white/5 hover:border-brand-cyan/40 hover:text-brand-cyan rounded-xl transition-all flex items-center gap-2 group/btn"
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="w-5 h-5 text-green-400 group-hover/btn:text-green-400" />
                        <span className="text-green-400 font-bold group-hover/btn:text-green-400">تم النسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>نسخ الاسم</span>
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}