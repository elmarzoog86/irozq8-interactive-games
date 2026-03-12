import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Users, ArrowLeft, Keyboard, Timer } from 'lucide-react';
import { TwitchChat } from './TwitchChat';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TypingDerbyProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

interface Player {
  username: string;
  score: number;
  color: string;
}

const ARABIC_WORDS = [
  'سبحان الله', 'الحمد لله', 'الله أكبر', 'رمضان كريم', 
  'السلام عليكم', 'وعليكم السلام', 'مرحبا بكم', 'شكرا جزيلا',
  'ألعاب تفاعلية', 'بث مباشر', 'تحدي الكتابة', 'سرعة البديهة',
  'لعبة ممتعة', 'حياكم الله', 'أهلا وسهلا', 'كيف الحال',
  "عطني واحد شاورما", "أنا الأول", "تحديات", "صعبة جداً",
  "سهلة ولا كأنك تشوف", "كلك حركات"
];

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', 
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

type GamePhase = 'lobby' | 'countdown' | 'playing' | 'winner';

export function TypingDerbyGame({
  messages,
  onLeave,
  channelName,
  isConnected,
  error
}: TypingDerbyProps) {
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [currentWord, setCurrentWord] = useState<string>('');
  const [winner, setWinner] = useState<Player | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [targetScore, setTargetScore] = useState(5);
  const processedMessageIds = useRef<Set<string>>(new Set());

  // Handle messages based on phase
  useEffect(() => {
    if (!messages.length) return;

    const newMessages = messages.filter(m => !processedMessageIds.current.has(m.id));
    if (newMessages.length === 0) return;

    newMessages.forEach(msg => {
      processedMessageIds.current.add(msg.id);
      const text = msg.message.trim();

      if (phase === 'lobby' && text === '!join') {
        if (!players[msg.username]) {
          setPlayers(prev => ({
            ...prev,
            [msg.username]: {
              username: msg.username,
              score: 0,
              color: COLORS[Object.keys(prev).length % COLORS.length]
            }
          }));
        }
      } else if (phase === 'playing' && text === currentWord) {
        // Player got it right
        if (players[msg.username]) {
          setPlayers(prev => {
            const next = { ...prev };
            next[msg.username] = { ...next[msg.username], score: next[msg.username].score + 1 };
            
            // Check win
            if (next[msg.username].score >= targetScore) {
              setWinner(next[msg.username]);
              setPhase('winner');
            } else {
              // Next word
              pickNextWord();
            }
            return next;
          });
        }
      }
    });

  }, [messages, phase, currentWord, players, targetScore]);

  const pickNextWord = () => {
    const randomWord = ARABIC_WORDS[Math.floor(Math.random() * ARABIC_WORDS.length)];
    setCurrentWord(randomWord);
  };

  const startGame = () => {
    if (Object.keys(players).length === 0) return;
    setPhase('countdown');
    setCountdown(3);
    
    let cnt = 3;
    const interval = setInterval(() => {
      cnt--;
      if (cnt > 0) {
        setCountdown(cnt);
      } else {
        clearInterval(interval);
        pickNextWord();
        setPhase('playing');
      }
    }, 1000);
  };

  const resetGame = () => {
    setPlayers({});
    setWinner(null);
    setCurrentWord('');
    setPhase('lobby');
  };

  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <div className="h-screen flex flex-col bg-black text-white font-arabic relative overflow-hidden" dir="rtl">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between border-b border-yellow-500/20 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-2xl transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-6 h-6 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              <Keyboard className="w-8 h-8 text-yellow-500" />
              سباق الكتابة
            </h1>
            <p className="text-zinc-500 font-medium">الأسرع في الكتابة يكسب!</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-3 ${
            isConnected ? 'bg-zinc-900/80 border-yellow-500/30' : 'bg-red-500/10 border-red-500/20'
          }`}>
            <div className="relative flex h-3 w-3">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isConnected ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
            </div>
            <span className={`font-bold ${isConnected ? 'text-zinc-200' : 'text-red-400'}`}>
              {isConnected ? channelName : 'جاري الاتصال...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex p-6 gap-6 min-h-0">
        <div className="w-[350px] flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
            <TwitchChat 
              channelName={channelName}
              messages={messages}
              error={error}
              isConnected={isConnected}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {phase === 'lobby' && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto custom-scrollbar">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900/50 border border-yellow-500/20 rounded-[2rem] p-10 text-center max-w-2xl w-full backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="w-20 h-20 bg-yellow-500/20 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                  <Users className="w-10 h-10 text-yellow-400" />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-4">غرفة الانتظار</h2>
                
                <div className="bg-black/50 border border-yellow-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-yellow-500 font-bold mb-2 flex items-center justify-center gap-2">
                    <Timer className="w-5 h-5" />
                    طريقة اللعب
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    لعبة سرعة تعتمد على من يكتب الكلمة أولاً! ستظهر كلمة على الشاشة، وأسرع شخص يكتبها بشكل صحيح في الدردشة سيتقدم خطوة نحو النهاية. استمر في الكتابة بسرعة لتصل للهدف أولاً.
                  </p>
                  <p className="text-xl text-zinc-300">
                    اكتب <span className="text-yellow-400 font-black animate-pulse bg-yellow-500/10 px-4 py-2 rounded-xl mx-2">!join</span> في الشات للانضمام
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="bg-zinc-800/50 px-6 py-4 rounded-2xl flex items-center gap-3 border border-yellow-500/10">
                    <span className="text-zinc-400">عدد اللاعبين:</span>
                    <span className="text-3xl font-black text-yellow-500">{Object.keys(players).length}</span>
                  </div>
                  <div className="bg-zinc-800/50 px-6 py-4 rounded-2xl flex flex-col items-center gap-2 border border-yellow-500/10">
                    <span className="text-zinc-400 text-sm">النقاط المطلوبة للفوز</span>
                    <input 
                      type="number" 
                      min="1" 
                      value={targetScore}
                      onChange={(e) => setTargetScore(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-black/50 text-yellow-400 text-2xl font-black text-center w-24 rounded-xl border border-yellow-500/20 px-2 py-1 focus:outline-none focus:border-yellow-500/50"
                    />
                  </div>
                </div>

                {Object.keys(players).length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mb-8 max-h-32 overflow-y-auto custom-scrollbar p-2">
                    {Object.values(players).map(p => (
                      <span key={p.username} className="px-3 py-1 bg-white/5 rounded-lg text-sm font-medium border border-white/10" style={{ color: p.color }}>
                        {p.username}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={startGame}
                  disabled={Object.keys(players).length === 0}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black px-12 py-4 rounded-2xl text-2xl font-black transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                >
                  <Play className="w-8 h-8" />
                  ابدأ السباق
                </button>
              </motion.div>
            </div>
          )}

          {phase === 'countdown' && (
            <div className="flex-1 flex items-center justify-center">
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="text-9xl font-black text-yellow-500 drop-shadow-[0_0_50px_rgba(234,179,8,0.5)] bg-black/50 w-64 h-64 rounded-full flex items-center justify-center border-4 border-yellow-500/30"
              >
                {countdown}
              </motion.div>
            </div>
          )}

          {phase === 'playing' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 relative">
              
              <div className="w-full max-w-4xl bg-zinc-900/80 border border-yellow-500/30 rounded-[2rem] p-10 text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
                <p className="text-zinc-400 text-xl mb-4 flex items-center justify-center gap-3">
                  <Keyboard className="w-6 h-6 text-yellow-500" />
                  اكتب هذه الجملة بسرعة!
                </p>
                <div className="text-5xl md:text-6xl lg:text-7xl font-black text-white px-8 py-8 bg-black/50 rounded-2xl border border-yellow-500/10 tracking-wider font-arabic shadow-inner">
                  {currentWord}
                </div>
              </div>

              <div className="w-full max-w-4xl bg-black/50 rounded-3xl border border-yellow-500/10 p-6 flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-bold text-zinc-400 px-2 pb-2 border-b border-yellow-500/20 mb-2 flex items-center gap-2 sticky top-0 bg-black/80 backdrop-blur z-20">
                  <Timer className="w-5 h-5 text-yellow-500" />
                  المتسابقون:
                </h3>
                {sortedPlayers.map((p, index) => {
                  const progressPercentage = (p.score / targetScore) * 100;
                  return (
                    <motion.div 
                      key={p.username} 
                      layout
                      className="flex items-center gap-4 bg-zinc-900 border border-white/5 p-4 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-white/5 w-full transform origin-left transition-transform duration-500" 
                           style={{ transform: `scaleX(${progressPercentage / 100})`, backgroundColor: `${p.color}22` }} />
                      
                      <div className="w-10 text-center font-bold text-zinc-500 z-10">#{index + 1}</div>
                      <div className="font-bold text-xl z-10 w-48 truncate" style={{ color: p.color }}>{p.username}</div>
                      
                      <div className="flex-1 z-10 relative h-6 bg-black/50 rounded-full border border-yellow-500/20 overflow-hidden">
                        <motion.div 
                          className="absolute right-0 top-0 bottom-0 rounded-full"
                          style={{ backgroundColor: p.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        />
                      </div>
                      
                      <div className="w-16 text-center font-black text-2xl z-10 text-white drop-shadow-md">
                        {p.score}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'winner' && winner && (
            <div className="flex-1 flex items-center justify-center p-12">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-zinc-900 border border-yellow-500/30 rounded-[3rem] p-16 text-center max-w-2xl w-full relative overflow-hidden shadow-[0_0_100px_rgba(234,179,8,0.2)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.1),transparent_70%)]" />
                
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-32 -left-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl opacity-50"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-32 -right-32 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl opacity-50"
                />

                <div className="relative z-10">
                  <div className="w-32 h-32 bg-yellow-500/20 rounded-full mx-auto mb-8 flex items-center justify-center border border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.4)] relative">
                    <Trophy className="w-16 h-16 text-yellow-400 relative z-10" />
                    <motion.div 
                      className="absolute inset-0 rounded-full border-2 border-yellow-400"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <h2 className="text-3xl text-zinc-400 mb-4 font-bold">الفائز في السباق</h2>
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg" style={{ color: winner.color }}>
                    {winner.username}
                  </div>
                  <div className="text-2xl text-zinc-300 font-bold bg-black/50 py-3 px-8 rounded-full inline-block border border-yellow-500/20 mb-12">
                    النقاط: {winner.score}
                  </div>

                  <button
                    onClick={resetGame}
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 px-12 py-4 rounded-2xl text-xl font-bold transition-all hover:scale-105 border border-yellow-500/30 shadow-lg block mx-auto"
                  >
                    لعبة جديدة
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
