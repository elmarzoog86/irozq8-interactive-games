import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Timer, Trophy, Users, Skull, CheckCircle2, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  isEliminated: boolean;
  isWebJoined: boolean;
  socketId: string | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'matchmaking' | 'category_selection' | 'gambling' | 'naming' | 'result' | 'game_over';
  currentMatch: [string, string] | null;
  categories: string[];
  selectedCategory: string | null;
  gamblerId: string | null;
  targetCount: number;
  currentCount: number;
  timer: number;
  answers: string[];
  winner: string | null;
  turn: string | null;
  bid: number;
}

export const HowManyPlayer: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);
  const [state, setState] = useState<GameState | null>(null);
  const [answer, setAnswer] = useState('');
  const [bidInput, setBidInput] = useState(0);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('howmany_state', (newState: GameState) => {
      setState(newState);
    });

    newSocket.on('howmany_timer', (timer: number) => {
      setState(prev => prev ? { ...prev, timer } : null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId) {
      socket?.emit('join_howmany_lobby', { roomId, name });
      setJoined(true);
    }
  };

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && roomId) {
      socket?.emit('submit_answer', { roomId, answer: answer.trim() });
      setAnswer('');
    }
  };

  const placeBid = () => {
    if (roomId) {
      socket?.emit('place_bid', { roomId, amount: bidInput });
      setBidInput(0);
    }
  };

  const callLiar = () => {
    if (roomId) {
      socket?.emit('call_liar_howmany', roomId);
    }
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-arabic" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8 text-center"
        >
          <div className="bg-black/40 p-8 rounded-[40px] border border-brand-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)] backdrop-blur-xl">
            <h1 className="text-4xl font-black italic mb-2 text-brand-gold glow-gold-text">كم تقدر تسمي؟</h1>
            <p className="text-brand-gold/60 uppercase tracking-widest text-sm mb-8">انضم للعبة الآن</p>
            
            <form onSubmit={joinRoom} className="space-y-4">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full bg-black/40 border border-brand-gold/20 p-4 rounded-2xl text-center text-xl font-bold focus:ring-2 focus:ring-brand-gold outline-none transition-all text-white"
                required
              />
              <button 
                type="submit"
                className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_10px_20px_rgba(212,175,55,0.2)]"
              >
                انضمام للردهة
              </button>
            </form>
          </div>
          <p className="text-brand-gold/40 text-xs">رقم الغرفة: {roomId}</p>
        </motion.div>
      </div>
    );
  }

  if (!state) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;

  const me = state.players.find(p => p.id === socket?.id);
  const isMyTurn = state.turn === socket?.id;
  const isGambling = state.status === 'gambling';
  const isNaming = state.status === 'naming' && state.gamblerId === socket?.id;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-arabic" dir="rtl">
      {/* Header */}
      <div className="p-6 border-b border-brand-gold/10 flex justify-between items-center bg-brand-gold/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-gold/10 rounded-full flex items-center justify-center border border-brand-gold/20">
            👤
          </div>
          <div>
            <p className="text-xs text-brand-gold/50 uppercase font-bold">اللاعب</p>
            <p className="font-black text-brand-gold">{name}</p>
          </div>
        </div>
        {me?.isEliminated && (
          <div className="bg-red-500/20 text-red-500 px-4 py-1 rounded-full text-xs font-black flex items-center gap-2 border border-red-500/30">
            <Skull className="w-3 h-3" /> تم إقصاؤك
          </div>
        )}
      </div>

      {/* Game Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {state.status === 'waiting' && (
            <motion.div key="waiting" className="text-center space-y-4">
              <Users className="w-16 h-16 text-brand-gold/30 mx-auto animate-pulse" />
              <h2 className="text-2xl font-black text-brand-gold">بانتظار الستريمر لبدء اللعبة...</h2>
              <p className="text-brand-gold/50">أنت الآن في الردهة</p>
            </motion.div>
          )}

          {state.status === 'matchmaking' && (
            <motion.div key="matchmaking" className="text-center space-y-6">
              <h2 className="text-3xl font-black italic text-brand-gold glow-gold-text">تجهيز الجولة</h2>
              <div className="bg-black/40 p-8 rounded-[40px] border border-brand-gold/20 space-y-4 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                <p className="text-brand-gold/60">المواجهة القادمة:</p>
                <div className="text-xl font-black text-white">
                  {state.players.find(p => p.id === state.currentMatch?.[0])?.name}
                  <span className="mx-4 text-brand-gold">VS</span>
                  {state.players.find(p => p.id === state.currentMatch?.[1])?.name}
                </div>
              </div>
            </motion.div>
          )}

          {isGambling && (
            <motion.div key="gambling" className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-block bg-brand-gold/10 px-4 py-1 rounded-full text-brand-gold text-xs font-bold uppercase tracking-widest border border-brand-gold/20">
                  مرحلة المزايدة
                </div>
                <h2 className="text-4xl font-black italic text-white">{state.selectedCategory}</h2>
                {state.bid > 0 && (
                  <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-brand-gold/30">
                    <p className="text-xs text-brand-gold/50 uppercase">المزايدة الحالية</p>
                    <p className="text-3xl font-black text-brand-gold glow-gold-text">{state.bid}</p>
                  </div>
                )}
              </div>

              {isMyTurn ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input 
                      type="number" 
                      value={bidInput}
                      onChange={(e) => setBidInput(parseInt(e.target.value) || 0)}
                      placeholder="كم تقدر تسمي؟"
                      className="w-full bg-black/40 border-2 border-brand-gold/50 p-6 rounded-3xl text-3xl font-black text-center focus:ring-4 focus:ring-brand-gold/20 outline-none transition-all text-white"
                      min={state.bid + 1}
                    />
                  </div>
                  <button 
                    onClick={placeBid}
                    disabled={bidInput <= state.bid}
                    className="w-full bg-brand-gold hover:bg-brand-gold-light disabled:bg-brand-gold/10 disabled:text-brand-gold/30 text-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  >
                    أقدر أسمي {bidInput}
                  </button>
                  {state.bid > 0 && (
                    <button 
                      onClick={callLiar}
                      className="w-full bg-black/40 hover:bg-brand-gold/10 text-brand-gold font-black py-4 rounded-2xl text-xl transition-all border border-brand-gold/30 shadow-lg"
                    >
                      كاذب!
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 bg-black/40 rounded-[40px] border border-brand-gold/10">
                  <Users className="w-12 h-12 text-brand-gold/30 mx-auto mb-4 animate-pulse" />
                  <p className="text-xl font-bold text-brand-gold/50">بانتظار دور الخصم...</p>
                </div>
              )}
            </motion.div>
          )}

          {isNaming && (
            <motion.div key="naming" className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <div className="inline-block bg-brand-gold/10 px-4 py-1 rounded-full text-brand-gold text-xs font-bold uppercase tracking-widest border border-brand-gold/20">
                  دورك الآن!
                </div>
                <h2 className="text-4xl font-black italic text-white">{state.selectedCategory}</h2>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="text-center">
                    <p className="text-[10px] text-brand-gold/50 uppercase">الوقت</p>
                    <p className="text-3xl font-black font-mono text-brand-gold glow-gold-text">{state.timer}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-brand-gold/50 uppercase">التقدم</p>
                    <p className="text-3xl font-black font-mono text-white">{state.currentCount} / {state.targetCount}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={submitAnswer} className="relative">
                <input 
                  type="text" 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="اكتب إجابتك هنا..."
                  className="w-full bg-black/40 border-2 border-brand-gold/50 p-6 rounded-3xl text-xl font-bold focus:ring-4 focus:ring-brand-gold/20 outline-none transition-all pr-16 text-white"
                  autoFocus
                />
                <button 
                  type="submit"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-gold text-black p-3 rounded-2xl hover:bg-brand-gold-light transition-all shadow-lg"
                >
                  <Send className="w-6 h-6" />
                </button>
              </form>

              <div className="flex flex-wrap gap-2 justify-center">
                {state.answers.map((ans, i) => (
                  <div key={i} className="bg-black/40 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold">
                    {ans}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!isNaming && state.status === 'naming' && (
            <motion.div key="naming-wait" className="text-center space-y-4">
              <Timer className="w-16 h-16 text-brand-gold/50 mx-auto animate-spin-slow" />
              <h2 className="text-2xl font-black italic text-white">
                <span className="text-brand-gold">{state.players.find(p => p.id === state.gamblerId)?.name}</span> يحاول التسمية...
              </h2>
              <div className="text-4xl font-black font-mono text-brand-gold glow-gold-text">{state.timer}</div>
            </motion.div>
          )}

          {state.status === 'result' && (
            <motion.div key="result" className="text-center space-y-6">
              <Trophy className="w-20 h-20 text-brand-gold mx-auto drop-shadow-[0_0_20px_rgba(212,175,55,0.5)]" />
              <h2 className="text-4xl font-black italic text-white">
                {state.currentCount >= state.targetCount ? 'نجح التحدي!' : 'فشل التحدي!'}
              </h2>
              <p className="text-brand-gold/50">بانتظار الجولة التالية</p>
            </motion.div>
          )}

          {state.status === 'game_over' && (
            <motion.div key="game_over" className="text-center space-y-6">
              <Trophy className="w-24 h-24 text-brand-gold mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" />
              <h2 className="text-5xl font-black italic text-white">انتهت اللعبة!</h2>
              <p className="text-2xl font-bold text-brand-gold glow-gold-text">الفائز: {state.winner}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Status */}
      <div className="p-6 bg-brand-gold/5 border-t border-brand-gold/10 text-center backdrop-blur-md">
        <div className="flex items-center justify-center gap-2 text-xs text-brand-gold/50">
          <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${socket?.connected ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
          {socket?.connected ? 'متصل بالخادم' : 'جاري الاتصال...'}
        </div>
      </div>
    </div>
  );
};
