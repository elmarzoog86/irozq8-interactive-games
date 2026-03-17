import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Users, ArrowLeft, Keyboard, Timer, Skull, Target, Crosshair } from 'lucide-react';
import { TwitchChat } from './TwitchChat';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TypingRoyaleProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

interface Player {
  username: string;
  color: string;
  isAlive: boolean;
  currentRoundTimes: number[]; // Array of times taken for the current 3 mini-rounds
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', 
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

const WORDS = [
  'التفاحة الحمراء', 'سبحان الله وبحمده', 'ألعاب تفاعلية ممتعة',
  'سرعة البديهة والتركيز', 'التحدي الأكبر', 'البقاء للأقوى',
  'بث مباشر تفاعلي', 'جمهور رائع جدا', 'كتابة سريعة كالبرق',
  'رمضان كريم علينا', 'السيارة الرياضية', 'الماء سر الحياة',
  'لا أستطيع التوقف', 'تحدي الأبطال', 'كل عام وأنتم بخير',
  'المحارب الأخير', 'عالم الإنترنت', 'وقت المغامرة يابطل',
  'لا تستسلم أبدا', 'ركز جيدا يا صديقي', 'النصر حليفنا اليوم',
  'هل أنت الأسرع؟', 'أثبت مهارتك الآن', 'لوحة المفاتيح',
  'اكتب بسرعة وتألق', 'طريق المجد طويل', 'القوة في التركيز',
  'من جد وجد ومن زرع حصد', 'الوقت من ذهب', 'العقل السليم في الجسم السليم',
  'سماء صافية ونجوم لامعة', 'الهدوء قبل العاصفة', 'الكتابة فن ومهارة',
  'قهوة الصباح اللذيذة', 'مرحباً بالجميع هنا', 'الوصول للقمة يحتاج صبر',
  'شاركنا متعة اللعب', 'الأصابع تطير على الحروف', 'لا تتأخر عن الموعد',
  'سرعة البرق الخاطف', 'الذكاء الاصطناعي مذهل', 'قلب شجاع لا يخاف',
  'أنا مستعد للتحدي دائما', 'تفكير سريع ورد فعل ممتاز', 'تجاوز حدودك الآن',
  'لا تدع الوقت يسرقك', 'الفوز لنا لا محالة', 'استعد للانطلاق فورا',
  'سر النجاح هو الاستمرار', 'كن سريعا وكن ذكيا', 'البطولة بين يديك',
  'دائما في المركز الأول', 'الكتابة دون النظر للشاشة', 'تطوير دائم ومستمر'
];

type GamePhase = 'lobby' | 'countdown' | 'typing' | 'timeout_trigger' | 'mini_results' | 'elimination_calculation' | 'elimination_reveal' | 'winner';

export function TypingRoyaleGame({
  messages,
  onLeave,
  channelName,
  isConnected,
  error
}: TypingRoyaleProps) {
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  
  const [majorRound, setMajorRound] = useState(1);
  const [miniRound, setMiniRound] = useState(1);
  
  const [currentWord, setCurrentWord] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const wordStartTimeRef = useRef(0);
  const playersRef = useRef(players);

  // Keep a ref synced for timeouts
  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  // Handle messages early
  useEffect(() => {
    if (!messages.length) return;

    const newMessages = messages.filter(m => !processedMessageIds.current.has(m.id));
    if (newMessages.length === 0) return;

    newMessages.forEach(msg => {
      processedMessageIds.current.add(msg.id);
      const text = msg.message.trim();

      if (phase === 'lobby' && text === '!join') {
        setPlayers(prev => {
          if (!prev[msg.username]) {
            return {
              ...prev,
              [msg.username]: {
                username: msg.username,
                color: COLORS[Object.keys(prev).length % COLORS.length],
                isAlive: true,
                currentRoundTimes: []
              }
            };
          }
          return prev;
        });
      } else if (phase === 'typing') {
        const p = playersRef.current[msg.username];
        // If exact match AND player is alive AND hasn't finished this mini-round
        if (text === currentWord && p && p.isAlive && p.currentRoundTimes.length === (miniRound - 1)) {
          const timeTaken = (Date.now() - wordStartTimeRef.current) / 1000;
          setPlayers(prev => ({
            ...prev,
            [msg.username]: {
              ...p,
              currentRoundTimes: [...p.currentRoundTimes, timeTaken]
            }
          }));
        }
      }
    });
  }, [messages, phase, currentWord, miniRound]);

  // Phase Controller State Machine
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'countdown') {
      let cnt = 3;
      setCountdown(3);
      const intv = setInterval(() => {
        cnt--;
        if (cnt > 0) setCountdown(cnt);
        else {
          clearInterval(intv);
          // Pick a random word safely
          let nextWord = "";
          while(true) {
            nextWord = WORDS[Math.floor(Math.random() * WORDS.length)];
            if (nextWord !== currentWord) break;
          }
          setCurrentWord(nextWord);
          wordStartTimeRef.current = Date.now();
          setPhase('typing');
        }
      }, 1000);
      return () => clearInterval(intv);
    }

    if (phase === 'typing') {
      setTimeLeft(30);
      const intv = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPhase('timeout_trigger');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intv);
    }

    if (phase === 'timeout_trigger') {
      // Apply 30s penalty to alive players who didn't finish
      setPlayers(prev => {
        const next = { ...prev };
        Object.values(next).forEach(p => {
          if (p.isAlive && p.currentRoundTimes.length < miniRound) {
            next[p.username] = { ...p, currentRoundTimes: [...p.currentRoundTimes, 30] }; // Penalty
          }
        });
        return next;
      });
      setPhase('mini_results');
      return;
    }

    if (phase === 'mini_results') {
      timer = setTimeout(() => {
        if (miniRound < 3) {
          setMiniRound(m => m + 1);
          setPhase('countdown');
        } else {
          setPhase('elimination_calculation');
        }
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (phase === 'elimination_calculation') {
      const aliveProps = Object.values(playersRef.current).filter(p => p.isAlive);
      if (aliveProps.length === 0) {
        setPhase('winner');
        return;
      }

      let maxTime = -1;
      let worstUsernames: string[] = [];

      aliveProps.forEach(p => {
        const total = p.currentRoundTimes.reduce((acc, val) => acc + val, 0);
        // Add a slight tolerance handling if identical max times exist
        if (total > maxTime) {
          maxTime = total;
          worstUsernames = [p.username];
        } else if (total === maxTime) {
          worstUsernames.push(p.username);
        }
      });

      // Tie breaker: random
      const loserUsername = worstUsernames[Math.floor(Math.random() * worstUsernames.length)];
      setEliminatedPlayer(playersRef.current[loserUsername]);

      setPlayers(prev => ({
        ...prev,
        [loserUsername]: { ...prev[loserUsername], isAlive: false }
      }));

      setPhase('elimination_reveal');
      return;
    }

    if (phase === 'elimination_reveal') {
      timer = setTimeout(() => {
        const stillAlive = Object.values(playersRef.current).filter(p => p.isAlive);
        if (stillAlive.length <= 1) {
          setPhase('winner');
        } else {
          // Reset currentRoundTimes for survivors to start the new Major Round
          setPlayers(prev => {
            const reset = { ...prev };
            Object.values(reset).forEach(p => { 
                reset[p.username] = { ...p, currentRoundTimes: [] }; 
            });
            return reset;
          });
          setMajorRound(r => r + 1);
          setMiniRound(1);
          setPhase('countdown');
        }
      }, 6000);
      return () => clearTimeout(timer);
    }

  }, [phase, miniRound, currentWord]);

  // Check if ALL alive players finished typing during typing phase
  useEffect(() => {
    if (phase === 'typing') {
      const alive = Object.values(players).filter(p => p.isAlive);
      if (alive.length > 0) {
        const allFinished = alive.every(p => p.currentRoundTimes.length === miniRound);
        if (allFinished) {
          setPhase('mini_results');
        }
      }
    }
  }, [players, phase, miniRound]);

  const startGame = () => {
    if (Object.keys(players).length < 2) return;
    setMajorRound(1);
    setMiniRound(1);
    setPhase('countdown');
  };

  const getWinner = () => {
      const aliveInfo = Object.values(players).find(p => p.isAlive);
      if (aliveInfo) return aliveInfo;
      // fallback in case of draw
      return eliminatedPlayer;
  };

  const calculateTotalTime = (times: number[]) => times.reduce((a, b) => a + b, 0).toFixed(2);

  const alivePlayers = Object.values(players).filter(p => p.isAlive);
  const deadPlayers = Object.values(players).filter(p => !p.isAlive);

  // Sorting for scoreboard (mini results): Alive sorted by total lowest time first
  const sortedScoreboard = [...alivePlayers].sort((a, b) => {
      const tA = a.currentRoundTimes.reduce((acc, v) => acc + v, 0);
      const tB = b.currentRoundTimes.reduce((acc, v) => acc + v, 0);
      return tA - tB; // Lower score is better
  });


  return (
    <div className="h-screen flex flex-col bg-brand-black text-white font-arabic relative overflow-hidden" dir="rtl">
      {/* Dynamic Backgrounds based on phase */}
      <div className="absolute inset-0 z-0">
        {phase === 'elimination_reveal' && (
          <div className="absolute inset-0 bg-red-900/40" />
        )}
        {phase === 'typing' && (
          <div className="absolute inset-0 bg-blue-900/10" />
        )}
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between border-b border-cyan-500/20 bg-brand-black/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Crosshair className="w-8 h-8 text-cyan-500" />
              باتل رويال الكلمات
            </h1>
            <p className="text-zinc-500 font-medium">البقاء للأسرع، الأبطأ يُقصى!</p>
          </div>
        </div>

        {phase !== 'lobby' && phase !== 'winner' && (
          <div className="flex items-center gap-6">
            <div className="bg-zinc-900 px-6 py-2 rounded-xl flex items-center gap-3 border border-cyan-500/20">
              <Users className="w-5 h-5 text-cyan-500" />
              <span className="text-xl font-black text-white">{alivePlayers.length} ناجين</span>
            </div>
            <div className="bg-zinc-900 px-6 py-2 rounded-xl border border-cyan-500/20">
              <span className="text-zinc-400 font-bold ml-2">بطولة</span>
              <span className="text-2xl font-black text-cyan-500">{majorRound}</span>
            </div>
            <div className="bg-zinc-900 px-6 py-2 rounded-xl border border-cyan-500/20">
              <span className="text-zinc-400 font-bold ml-2">جولة مصغرة</span>
              <span className="text-2xl font-black text-cyan-500">{miniRound}/3</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout */}
      <main className="relative z-10 flex-1 flex p-6 gap-6 min-h-0">
        {/* Chat Sidebar */}
        <div className="w-[350px] flex-shrink-0 z-20">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
            <TwitchChat 
              channelName={channelName}
              messages={messages}
              error={error}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col relative z-10 items-center justify-center">
          
          {phase === 'lobby' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900/80 border border-cyan-500/20 rounded-[2rem] p-10 text-center max-w-2xl w-full backdrop-blur-md overflow-y-auto custom-scrollbar"
            >
              <Target className="w-20 h-20 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white mb-6">ساحة المعركة</h2>
              
              <div className="bg-brand-black/50 border border-cyan-500/20 rounded-2xl p-6 mb-6">
                 <h3 className="text-cyan-500 font-bold mb-2 flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5" />
                    طريقة اللعب
                 </h3>
                 <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    ستظهر لك كلمة ويجب أن تكتبها بأسرع وقت خلال 30 ثانية. بعد 3 جولات، سيتم جمع أوقات كل جولة للاعبين، واللاعب صاحب أطول وقت (الأبطأ) سيتم إقصاؤه نهائياً! البقاء للأسرع دائماً.
                 </p>
                 <p className="text-xl text-zinc-300">
                    اكتب <span className="text-cyan-400 font-black animate-pulse bg-cyan-500/10 px-4 py-2 rounded-xl mx-2">!join</span> لتنضم
                 </p>
              </div>

              <div className="bg-brand-black/40 p-4 rounded-2xl mb-6 flex justify-center flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar border border-cyan-500/10">
                {Object.keys(players).length === 0 ? (
                  <span className="text-zinc-500 self-center">في انتظار المتسابقين...</span>
                ) : (
                  Object.values(players).map(p => (
                    <span key={p.username} className="px-3 py-1 bg-brand-black/60 rounded-lg text-sm font-bold border border-white/10" style={{ color: p.color }}>
                      {p.username}
                    </span>
                  ))
                )}
              </div>

              <div className="text-lg text-zinc-400 mb-6">اللاعبين: {Object.keys(players).length} (الحد الأدنى: 2)</div>

              <button
                onClick={startGame}
                disabled={Object.keys(players).length < 2}
                className="bg-cyan-500 hover:bg-cyan-400 text-brand-black px-12 py-4 rounded-2xl text-2xl font-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 w-full shadow-[0_0_30px_rgba(0, 229, 255,0.3)]"
              >
                <Play className="w-8 h-8" />
                ابدأ التحدي
              </button>
            </motion.div>
          )}

          {phase === 'countdown' && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-9xl font-black text-cyan-500 drop-shadow-[0_0_50px_rgba(0, 229, 255,0.5)] bg-brand-black/50 w-64 h-64 rounded-full flex items-center justify-center border-4 border-cyan-500/50"
            >
              {countdown}
            </motion.div>
          )}

          {phase === 'typing' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              
              {/* Timer Bar */}
              <div className="w-full max-w-4xl h-4 bg-zinc-800 rounded-full mb-12 overflow-hidden border border-cyan-500/20 relative">
                <motion.div 
                  className={`h-full ${timeLeft <= 5 ? 'bg-red-500 shadow-[0_0_20px_rgba(220,38,38,1)]' : 'bg-cyan-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 30) * 100}%` }}
                  transition={{ ease: "linear", duration: 1 }}
                />
              </div>

              {/* Word Display */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-zinc-900 border border-cyan-500/30 p-12 rounded-[3rem] shadow-[0_0_40px_rgba(0, 229, 255,0.1)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent skew-x-12 translate-x-full animate-[shimmer_2s_infinite]" />
                <h3 className="text-zinc-400 text-xl mb-6 flex items-center justify-center gap-3">
                  <Keyboard className="w-6 h-6 text-cyan-500" /> اكتب هذه الجملة الآن:
                </h3>
                <div className="text-5xl md:text-7xl font-black text-white mx-auto tracking-wide text-center">
                  {currentWord}
                </div>
              </motion.div>

              {/* Status of players typing */}
              <div className="w-full max-w-4xl mt-16 flex flex-wrap gap-4 justify-center">
                 {alivePlayers.map(p => {
                    const hasFinished = p.currentRoundTimes.length === miniRound;
                    return (
                        <div key={p.username} 
                            className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-colors ${
                                hasFinished 
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                                  : 'bg-zinc-800/80 border-transparent text-zinc-500'
                            }`}
                        >
                            {hasFinished ? '✓' : '🕒'}
                            <span style={{ color: hasFinished ? p.color : ''}} className={hasFinished ? 'font-black' : ''}>{p.username}</span>
                        </div>
                    )
                 })}
              </div>
            </div>
          )}

          {phase === 'mini_results' && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/90 border border-cyan-500/30 rounded-[2rem] p-10 text-center w-full max-w-3xl backdrop-blur-md"
            >
                <h2 className="text-4xl font-black text-white mb-4">
                    نتائج الجولة ({miniRound}/3)
                </h2>
                <p className="text-zinc-400 mb-6">يتم جمع الأوقات.. الأبطأ سيخرج قريباً!</p>
                
                <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {sortedScoreboard.map((p, idx) => (
                        <div key={p.username} className="bg-brand-black/60 border border-cyan-500/10 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-2xl font-black text-zinc-500">#{idx + 1}</span>
                                <span className="text-xl font-bold" style={{ color: p.color }}>{p.username}</span>
                            </div>
                            <div className="text-right">
                                {p.currentRoundTimes.map((t, i) => (
                                    <span key={i} className={`inline-block ml-2 px-2 py-1 rounded bg-white/5 text-sm ${t === 30 ? 'text-red-500 line-through decoration-red-500/50' : 'text-yellow-100'}`}>
                                        {t === 30 ? 'وقت ضائع' : `${t.toFixed(1)} ثانية`}
                                    </span>
                                ))}
                            </div>
                            <div className="text-2xl font-black text-cyan-500 w-24 border-l border-cyan-500/20 pl-4">
                                {calculateTotalTime(p.currentRoundTimes)}s
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
          )}

          {phase === 'elimination_reveal' && eliminatedPlayer && (
             <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full">
                <motion.div 
                    initial={{ scale: 5, opacity: 0, rotate: 45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center z-0"
                >
                    <Skull className="w-[800px] h-[800px] text-red-600/20" />
                </motion.div>
                
                <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="bg-red-900/80 border border-red-500 p-16 rounded-[4rem] text-center z-10 shadow-[0_0_100px_rgba(220,38,38,0.5)] backdrop-blur-sm"
                >
                    <h2 className="text-4xl text-red-200 mb-6 font-bold">تم الإقصاء لكونه الأبطأ!</h2>
                    <div className="text-8xl font-black mb-8" style={{ color: eliminatedPlayer.color }}>
                         {eliminatedPlayer.username}
                    </div>
                    <div className="text-3xl text-red-100/50 bg-brand-black/30 w-fit mx-auto px-8 py-4 rounded-xl border border-red-500/30">
                        مجموع الثواني: {calculateTotalTime(eliminatedPlayer.currentRoundTimes)}s
                    </div>
                </motion.div>
             </div>
          )}

          {phase === 'winner' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-yellow-900/40 to-zinc-900 border border-cyan-500/50 rounded-[3rem] p-16 text-center max-w-2xl w-full relative overflow-hidden shadow-[0_0_100px_rgba(0, 229, 255,0.4)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0, 229, 255,0.2),transparent_70%)]" />
              
              <div className="relative z-10">
                <Trophy className="w-32 h-32 text-cyan-400 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(0, 229, 255,0.6)]" />
                
                <h2 className="text-4xl text-zinc-300 mb-6 font-bold">الناجي الأخير وبطل الكلمات!</h2>
                
                {getWinner() && (
                  <div className="text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-cyan-500 to-cyan-600 mb-12 drop-shadow-md">
                    {getWinner()?.username}
                  </div>
                )}

                <button
                  onClick={() => setPhase('lobby')}
                  className="bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 border border-white/10 shadow-lg block mx-auto w-full max-w-sm"
                >
                  العودة للوبي
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  );
}
