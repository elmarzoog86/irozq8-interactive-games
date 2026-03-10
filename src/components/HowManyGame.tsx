import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, Trophy, Timer, Swords, MessageSquare, Share2, Copy, CheckCircle2, XCircle, ArrowRight, Info, MessageSquareOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { TwitchChat } from './TwitchChat';

interface Player {
  id: string;
  name: string;
  isEliminated: boolean;
  isWebJoined: boolean;
  socketId: string | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'matchmaking' | 'category_selection' | 'gambling' | 'naming' | 'review' | 'result' | 'game_over';
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

const CATEGORY_POOL = [
  'فواكه', 'دول', 'ماركات سيارات', 'لاعبين كرة قدم', 'أفلام ديزني', 
  'عواصم', 'حيوانات', 'خضروات', 'ألوان', 'رياضات', 
  'تطبيقات', 'أجهزة إلكترونية', 'مهن', 'أدوات مطبخ', 'ماركات ملابس'
];

const SOUNDS = {
  tick: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  fail: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  match: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
};

export const HowManyGame: React.FC<{ onLeave: () => void; channelName: string; messages: any[] }> = ({ onLeave, channelName, messages }) => {
  const [showChat, setShowChat] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId] = useState(() => uuidv4().slice(0, 6));
  const [state, setState] = useState<GameState | null>(null);
  const [copied, setCopied] = useState(false);
  const [bidInput, setBidInput] = useState(0);
  const [streamerAnswer, setStreamerAnswer] = useState('');

  const processedMessages = useRef<Set<string>>(new Set());

  const playerLink = `${window.location.origin}/howmany/${roomId}`;

  const playSound = (type: keyof typeof SOUNDS) => {
    const audio = new Audio(SOUNDS[type]);
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (state?.status === 'matchmaking') playSound('match');
    if (state?.status === 'result') {
      playSound(state.currentCount >= state.targetCount ? 'success' : 'fail');
    }
  }, [state?.status]);

  useEffect(() => {
    if (state?.status === 'naming' && state.timer <= 5 && state.timer > 0) {
      playSound('tick');
    }
  }, [state?.timer]);

  useEffect(() => {
    if (!socket) return;

    messages.forEach(msg => {
      if (msg.text && !processedMessages.current.has(msg.id)) {
        processedMessages.current.add(msg.id);
        // We removed !join from here based on the requirement
      }
    });
  }, [messages, socket, roomId]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('host_howmany_lobby', { roomId });

    newSocket.on('howmany_state', (newState: GameState) => {
      setState(newState);
    });

    newSocket.on('howmany_timer', (timer: number) => {
      setState(prev => prev ? { ...prev, timer } : null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (state?.bid !== undefined) {
      setBidInput(state.bid + 1);
    }
  }, [state?.bid]);

  const copyLink = () => {
    navigator.clipboard.writeText(playerLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => {
    socket?.emit('start_howmany', roomId);
  };

  const generateCategories = () => {
    const shuffled = [...CATEGORY_POOL].sort(() => 0.5 - Math.random());
    socket?.emit('select_categories', { roomId, categories: shuffled.slice(0, 3) });
  };

  const chooseCategory = (category: string) => {
    socket?.emit('choose_category', { roomId, category });
  };

  const placeBid = () => {
    if (bidInput > (state?.bid || 0)) {
      socket?.emit('place_bid', { roomId, amount: bidInput });
    }
  };

  const callLiar = () => {
    socket?.emit('call_liar_howmany', roomId);
  };

  const forceEndRound = () => {
    socket?.emit('force_end_round_howmany', roomId);
  };

  const nextRound = () => {
    socket?.emit('next_round_howmany', roomId);
  };

  const decideOutcome = (passed: boolean) => {
    socket?.emit('howmany_decision', { roomId, passed });
  };

  const submitStreamerAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (streamerAnswer.trim() && roomId) {
      socket?.emit('submit_answer', { roomId, answer: streamerAnswer.trim() });
      setStreamerAnswer('');
    }
  };

  if (!state) return <div className="flex items-center justify-center h-full text-white">جاري الاتصال...</div>;

  return (
    <div className="flex h-full w-full gap-6 p-6 min-h-0 font-arabic text-white" dir="rtl">
      {/* Main Game Area */}
      <div className="flex-1 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col relative">
        <button onClick={() => setShowChat(!showChat)} className="absolute top-6 left-6 text-brand-gold/70 hover:text-brand-gold flex items-center gap-2 transition-colors z-[90] bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 shadow-xl">
            {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
          </button>

        <div className="flex-1 relative p-8 flex flex-col overflow-y-auto">
          {/* Header */}
        <div className="flex justify-between items-start mb-8 shrink-0">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-brand-gold uppercase">كم تقدر تسمي؟</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
              <Users className="w-3 h-3" /> {state.players.length} لاعبين متصلين
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-w-md">
              {state.players.map(p => (
                <span key={p.id} className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-zinc-400">
                  {p.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <button 
                onClick={onLeave}
                className="bg-black/70 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> خروج
              </button>
              <div className="bg-black/70 border border-brand-gold/20 p-2 rounded-xl flex items-center gap-3">
                <code className="text-brand-gold font-bold px-2">{window.location.origin}/howmany/{roomId}</code>
                <button 
                  onClick={copyLink}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-brand-gold" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Join Instructions Banner */}
        {state.status === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 shrink-0 bg-brand-gold/10 border border-brand-gold/30 p-4 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-brand-gold p-2 rounded-xl">
                <Users className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-black text-lg">انضم الآن للعب!</h3>
                <p className="text-brand-gold/60 text-sm">استخدم الرابط أعلاه للانضمام للمنافسة</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <AnimatePresence mode="wait">
          {state.status === 'waiting' && (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="bg-brand-gold/5 border border-brand-gold/20 p-12 rounded-[40px] shadow-2xl">
                <Users className="w-20 h-20 text-brand-gold mx-auto mb-6" />
                <h2 className="text-5xl font-black mb-4 italic">ردهة الانتظار</h2>
                <p className="text-zinc-400 text-xl max-w-md mx-auto">
                  انسخ الرابط في الأعلى وشاركه مع اللاعبين للانضمام للعبة
                </p>
                
                <div className="mt-12 grid grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {state.players.map(p => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/70 border border-brand-gold/10 p-4 rounded-2xl flex flex-col items-center gap-2"
                    >
                      <div className="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center text-xl">
                        👤
                      </div>
                      <span className="text-xs font-bold truncate w-full text-center">{p.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                {!state.players.find(p => p.id === socket?.id) && (
                  <button 
                    onClick={() => socket?.emit('join_howmany_lobby', { roomId, name: 'الستريمر' })}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-black px-8 py-5 rounded-2xl text-2xl transition-all uppercase italic"
                  >
                    انضم كلاعب
                  </button>
                )}
                <button 
                  onClick={startGame}
                  disabled={state.players.length < 2}
                  className="bg-brand-gold hover:bg-brand-gold-light disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black px-16 py-5 rounded-2xl text-2xl transition-all uppercase italic tracking-tighter shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                >
                  ابدأ اللعبة
                </button>
              </div>
            </motion.div>
          )}

          {state.status === 'matchmaking' && (
            <motion.div 
              key="matchmaking"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center space-y-12"
            >
              <h2 className="text-6xl font-black italic text-brand-gold">من سيواجه من؟</h2>
              <div className="flex items-center gap-12">
                <div className="bg-black/70 border-2 border-brand-gold/50 p-12 rounded-[40px] w-80 shadow-2xl">
                  <div className="text-8xl mb-6">👤</div>
                  <h3 className="text-3xl font-black">{state.players.find(p => p.id === state.currentMatch?.[0])?.name}</h3>
                </div>
                <Swords className="w-24 h-24 text-brand-gold animate-pulse" />
                <div className="bg-black/70 border-2 border-brand-gold/50 p-12 rounded-[40px] w-80 shadow-2xl">
                  <div className="text-8xl mb-6">👤</div>
                  <h3 className="text-3xl font-black">{state.players.find(p => p.id === state.currentMatch?.[1])?.name}</h3>
                </div>
              </div>
              <button 
                onClick={generateCategories}
                className="bg-brand-gold text-black font-black px-12 py-4 rounded-2xl text-xl hover:bg-brand-gold-light transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                اختر الفئات
              </button>
            </motion.div>
          )}

          {state.status === 'category_selection' && (
            <motion.div 
              key="category_selection"
              className="text-center space-y-12"
            >
              <h2 className="text-5xl font-black italic">اختر الفئة لهذه الجولة</h2>
              <div className="grid grid-cols-3 gap-8">
                {state.categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => chooseCategory(cat)}
                    className="bg-black/70 border-2 border-brand-gold/10 hover:border-brand-gold p-12 rounded-[40px] transition-all group"
                  >
                    <span className="text-3xl font-black group-hover:text-brand-gold">{cat}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {state.status === 'gambling' && (
            <motion.div 
              key="gambling"
              className="text-center space-y-8 w-full max-w-4xl"
            >
              <div className="bg-brand-gold/10 border border-brand-gold/20 p-8 rounded-3xl inline-block mb-8">
                <span className="text-2xl font-bold text-brand-gold">الفئة: {state.selectedCategory}</span>
              </div>

               <div className="bg-black/70 border border-brand-gold/20 p-8 rounded-3xl min-w-[300px]">
                  <h3 className="text-lg text-zinc-400 mb-2 font-bold">المزايدة الحالية</h3>
                  {state.bid > 0 ? (
                    <div>
                      <div className="text-6xl font-black text-white glow-gold-text mb-2">{state.bid}</div>
                      <div className="text-brand-gold text-lg">
                        من قبل {state.players.find(p => p.id !== state.turn)?.name}
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl text-zinc-500 font-bold">لا توجد مزايدة بعد</div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-brand-gold/10">
                    <p className="text-sm text-zinc-400 mb-2">الدور الحالي</p>
                    <div className="text-2xl font-black text-brand-gold animate-pulse">
                         {state.players.find(p => p.id === state.turn)?.name} يفكر...
                    </div>
                  </div>
              </div>

               {/* Streamer Controls for Gambling Phase */}
               {socket && state.turn === socket.id && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-black/80  p-6 rounded-[30px] border border-brand-gold/30 shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
                >
                  <h3 className="text-2xl font-black text-brand-gold mb-6 italic">دورك للتحدي!</h3>
                  
                  <div className="flex flex-wrap gap-8 justify-center items-end">
                    <div className="flex flex-col gap-3">
                       <label className="text-zinc-400 text-sm font-bold">ارفع العدد إلى</label>
                       <div className="flex gap-3">
                          <input 
                            type="number"
                            min={state.bid + 1}
                            value={bidInput}
                            onChange={(e) => setBidInput(parseInt(e.target.value) || 0)}
                            className="w-32 bg-zinc-900 border-2 border-brand-gold/20 p-4 rounded-xl text-center text-2xl font-black text-white focus:border-brand-gold outline-none transition-all"
                          />
                          <button 
                            onClick={placeBid}
                            disabled={bidInput <= state.bid}
                            className="bg-brand-gold disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded-xl text-xl hover:bg-brand-gold-light transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                          >
                             تأكيد
                          </button>
                       </div>
                    </div>

                    {state.bid > 0 && (
                      <div className="flex flex-col gap-3 border-r-2 border-zinc-800 pr-8">
                        <label className="text-zinc-400 text-sm font-bold">أو</label>
                        <button 
                          onClick={callLiar}
                          className="bg-red-600 text-white font-black px-10 py-4 rounded-xl text-xl hover:bg-red-500 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] hover:scale-105"
                        >
                          تحداه! (Liar)
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="text-sm text-zinc-500 mt-4 max-w-md mx-auto">
                يقوم اللاعبون بالمزايدة على عدد الإجابات التي يمكنهم ذكرها في الفئة المختارة.
              </div>
            </motion.div>
          )}

          {state.status === 'naming' && (
            <motion.div 
              key="naming"
              className="text-center space-y-8 w-full max-w-4xl"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="bg-black/70 p-8 rounded-3xl border border-brand-gold/20 w-64">
                  <Timer className="w-12 h-12 text-brand-gold mx-auto mb-2" />
                  <span className="text-6xl font-black font-mono">{state.timer}</span>
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-black mb-2">{state.selectedCategory}</h2>
                  <p className="text-zinc-500 uppercase tracking-widest">الهدف: {state.targetCount}</p>
                </div>
                <div className="bg-black/70 p-8 rounded-3xl border border-brand-gold/20 w-64">
                  <CheckCircle2 className="w-12 h-12 text-brand-gold mx-auto mb-2" />
                  <span className="text-6xl font-black font-mono">{state.currentCount}</span>
                </div>
              </div>

              <div className="bg-black/70 border border-brand-gold/10 p-12 rounded-[40px] min-h-[300px] flex flex-wrap gap-4 justify-center content-start relative">
                <AnimatePresence>
                  {state.answers.map((ans, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-brand-gold text-black font-black px-6 py-3 rounded-2xl text-xl italic"
                    >
                      {ans}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Streamer Input Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
                  <form onSubmit={submitStreamerAnswer} className="relative">
                    <input 
                      type="text"
                      value={streamerAnswer}
                      onChange={(e) => setStreamerAnswer(e.target.value)}
                      placeholder="اكتب إجابة لمساعدة اللاعب..."
                      className="w-full bg-black border border-brand-gold/30 p-4 rounded-2xl text-center text-lg font-bold focus:border-brand-gold outline-none transition-all"
                    />
                  </form>
                </div>
              </div>
              
              <div className="text-3xl font-black text-brand-gold animate-pulse">
                {state.players.find(p => p.id === state.gamblerId)?.name} يكتب الآن...
              </div>
            </motion.div>
          )}

          {state.status === 'review' && (
            <motion.div
              key="review"
              className="text-center space-y-10"
            >
              <h2 className="text-5xl font-black italic">قرار النتيجة</h2>

              <div className="bg-black/70 border border-brand-gold/10 p-8 rounded-[30px] max-w-4xl mx-auto">
                <h3 className="text-zinc-400 mb-4 font-bold">الإجابات المقدمة ({state.currentCount} / {state.targetCount})</h3>
                <div className="flex flex-wrap gap-3 justify-center">
                  {state.answers.map((ans, i) => (
                    <span key={i} className="bg-brand-gold/20 border border-brand-gold/30 text-brand-gold px-4 py-2 rounded-xl text-lg font-bold">
                      {ans}
                    </span>
                  ))}
                  {state.answers.length === 0 && <span className="text-zinc-500 italic">لا توجد إجابات</span>}
                </div>
              </div>

              <p className="text-zinc-400 text-xl">اختر نجاح أو فشل التحدي قبل عرض النتيجة.</p>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => decideOutcome(true)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-12 py-5 rounded-2xl text-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  نجاح ✅
                </button>
                <button
                  onClick={() => decideOutcome(false)}
                  className="bg-red-500 hover:bg-red-400 text-black font-black px-12 py-5 rounded-2xl text-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  فشل ❌
                </button>
              </div>
            </motion.div>
          )}

          {state.status === 'result' && (
            <motion.div 
              key="result"
              className="text-center space-y-12"
            >
              <Trophy className="w-32 h-32 text-brand-gold mx-auto glow-gold" />
              <h2 className="text-7xl font-black italic">
                {state.currentCount >= state.targetCount ? 'نجح التحدي!' : 'فشل التحدي!'}
              </h2>
              <div className="text-3xl text-zinc-400">
                {state.currentCount} من أصل {state.targetCount} في {state.selectedCategory}
              </div>
              <button 
                onClick={nextRound}
                className="bg-brand-gold hover:bg-brand-gold-light text-black font-black px-16 py-5 rounded-2xl text-2xl shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                الجولة التالية
              </button>
            </motion.div>
          )}

          {state.status === 'game_over' && (
            <motion.div 
              key="game_over"
              className="text-center space-y-8"
            >
              <Trophy className="w-48 h-48 text-brand-gold mx-auto animate-bounce glow-gold" />
              <h2 className="text-8xl font-black italic text-white tracking-tighter">البطل هو</h2>
              <h3 className="text-9xl font-black text-brand-gold drop-shadow-[0_0_50px_rgba(212,175,55,0.5)]">{state.winner}</h3>
              <button 
                onClick={() => window.location.reload()}
                className="bg-brand-gold hover:bg-brand-gold-light text-black font-black px-12 py-4 rounded-2xl text-xl mt-12 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
              >
                العودة للرئيسية
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Persistent Matchup Info and Controls */}
        {state.currentMatch && state.status !== 'waiting' && state.status !== 'game_over' && (
          <div className="absolute top-24 left-8 z-50 flex flex-col items-start gap-4 pointer-events-auto">
            {/* Matchup Card */}
            <div className="bg-black/90  border border-brand-gold/20 p-4 rounded-2xl flex items-center gap-6 shadow-2xl skew-x-[-10deg] hover:skew-x-0 transition-transform duration-300 group">
                <div className="flex flex-col items-center skew-x-[10deg] group-hover:skew-x-0 transition-transform">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">المنافس 1</span>
                  <div className={`text-xl font-black ${state.currentMatch[0] === state.turn ? 'text-brand-gold animate-pulse' : 'text-white'}`}>
                      {state.players.find(p => p.id === state.currentMatch?.[0])?.name}
                  </div>
                </div>
                
                <div className="h-8 w-[1px] bg-zinc-700 skew-x-[10deg] group-hover:skew-x-0" />

                <div className="flex flex-col items-center skew-x-[10deg] group-hover:skew-x-0 transition-transform">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">المنافس 2</span>
                  <div className={`text-xl font-black ${state.currentMatch[1] === state.turn ? 'text-brand-gold animate-pulse' : 'text-white'}`}>
                      {state.players.find(p => p.id === state.currentMatch?.[1])?.name}
                  </div>
                </div>
            </div>

            {/* Streamer Force End Round Button */}
            {state.status === 'naming' && (
              <button 
                onClick={forceEndRound}
                className="bg-red-900/80 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all border border-red-500/30 flex items-center gap-2 shadow-lg "
              >
                <Timer className="w-5 h-5" /> إنهاء الجولة فوراً
              </button>
            )}
          </div>
        )}
      </div></div>
      </div>

      {/* Sidebar (Players + Chat) */}
      <div className="w-[400px] flex flex-col gap-6 shrink-0">
        {/* Active Players Sidebar */}
        <div className="bg-black/80 rounded-[30px] border border-brand-gold/20 flex flex-col shrink-0 overflow-hidden max-h-[35%] shadow-2xl">
          <div className="p-4 border-b border-brand-gold/10 bg-brand-gold/5 flex items-center justify-between">
            <h3 className="text-brand-gold font-bold flex items-center gap-2">
              <Users className="w-5 h-5" />
              المتسابقين ({state.players.length})
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {state.players.map(p => (
              <div 
                key={p.id} 
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  !p.isEliminated 
                    ? 'bg-black/70 border-brand-gold/20 shadow-sm' 
                    : 'bg-red-900/10 border-red-900/30 opacity-60'
                }`}
              >
                <span className={`font-bold text-sm truncate ${!p.isEliminated ? 'text-zinc-200' : 'text-red-400 line-through'}`}>
                  {p.name}
                </span>
                {p.isEliminated && <XCircle className="w-4 h-4 text-red-500/50" />}
                {!p.isEliminated && state.status === 'matchmaking' && state.currentMatch?.includes(p.id) && (
                  <Swords className="w-4 h-4 text-brand-gold animate-pulse" />
                )}
              </div>
            ))}
            {state.players.length === 0 && (
              <div className="text-zinc-500 text-center text-sm py-4">انتظار لاعبين...</div>
            )}
          </div>
        </div>
        
        {/* Twitch Chat */}
        {showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            <TwitchChat
            channelName={channelName}
            messages={messages}
            isConnected={true}
            error={null}
          />
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

