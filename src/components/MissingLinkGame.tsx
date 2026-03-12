import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Users, ArrowLeft, ArrowRight, BrainCircuit, Timer, CheckCircle2, Crown, MessageSquare, MessageSquareOff, Tag, Lightbulb } from 'lucide-react';

interface Player {
  username: string;
  score: number;
  avatar: string;
}

interface Item {
  text: string;
  image: string;
}

interface Round {
  answer: string[];
  items: Item[];
}

const ROUNDS: Round[] = [
  {
    answer: ['فواكه', 'فاكهة', 'فواكة'],
    items: [
      { text: 'تفاح', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cb6c?auto=format&fit=crop&q=80&w=400' },
      { text: 'برتقال', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=400' },
      { text: 'موز', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=400' },
      { text: 'فراولة', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    answer: ['تواصل اجتماعي', 'سوشيال ميديا', 'برامج', 'تطبيقات'],
    items: [
      { text: 'تويتر', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg' },
      { text: 'فيسبوك', image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg' },
      { text: 'انستغرام', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg' }
    ]
  },
  {
    answer: ['عملات', 'عملة', 'فلوس', 'اموال', 'مال'],
    items: [
      { text: 'دولار', image: 'https://images.unsplash.com/photo-1554522800-4b2a3d077c5e?auto=format&fit=crop&q=80&w=400' },
      { text: 'يورو', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Euro_symbol.svg' },
      { text: 'دينار', image: 'https://images.unsplash.com/photo-1577705445203-3d02636a0fb4?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    answer: ['عواصم', 'عاصمة', 'مدن', 'مدينة'],
    items: [
      { text: 'لندن', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400' },
      { text: 'باريس', image: 'https://images.unsplash.com/photo-1502602898657-3e9076006e00?auto=format&fit=crop&q=80&w=400' },
      { text: 'طوكيو', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    answer: ['مطاعم', 'وجبات سريعة', 'فاست فود'],
    items: [
      { text: 'ماكدونالدز', image: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg' },
      { text: 'برجر كينج', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Burger_King_2020.svg' },
      { text: 'كنتاكي', image: 'https://upload.wikimedia.org/wikipedia/en/b/bf/KFC_logo.svg' }
    ]
  },
  {
    answer: ['كواكب', 'كوكب', 'فضاء'],
    items: [
      { text: 'المريخ', image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=400' },
      { text: 'زحل', image: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=400' }, // Reusing generic space as placeholders
      { text: 'المشتري', image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=400' }
    ]
  },
  {
    answer: ['مركبات', 'سيارات', 'مواصلات', 'وسائل نقل'],
    items: [
      { text: 'سيارة', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400' },
      { text: 'دراجة', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400' },
      { text: 'قطار', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=400' },
      { text: 'طائرة', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=400' }
    ]
  }
];

// Shuffle rounds helper
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

interface Props {
  messages: any[];
  onLeave: () => void;
  channelName: string;
}

type Phase = 'lobby' | 'countdown' | 'playing' | 'round_winner' | 'game_over';

export function MissingLinkGame({ messages, onLeave, channelName }: Props) {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameRounds, setGameRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const processedMessageIds = useRef<Set<string>>(new Set());

  // Handle Lobby Joins
  useEffect(() => {
    if (phase === 'lobby') {
      messages.forEach(async msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          
          if (text === '!join' || text === 'join') {
            setPlayers(prev => {
              if (prev.find(p => p.username === msg.username)) return prev;
              const newPlayer = {
                username: msg.username,
                score: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`
              };
              
              // Async fetch actual avatar
              fetch(`https://decapi.me/twitch/avatar/${msg.username}`)
                .then(res => res.text())
                .then(avatar => {
                  if (avatar && avatar.startsWith('http')) {
                    setPlayers(currentPlayers => 
                      currentPlayers.map(p => p.username === msg.username ? { ...p, avatar } : p)
                    );
                  }
                }).catch(() => {});

              return [...prev, newPlayer];
            });
          }
        }
      });
    }
  }, [messages, phase]);

  // Handle Gameplay chat
  useEffect(() => {
    if (phase === 'playing' && gameRounds.length > 0) {
      const currentRound = gameRounds[currentRoundIndex];
      
      messages.forEach(msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          
          // Check if user is in players list
          const playerIndex = players.findIndex(p => p.username === msg.username);
          if (playerIndex === -1) return;

          // Check answer
          const isCorrect = currentRound.answer.some(ans => text === ans || text.includes(ans));
          
          if (isCorrect) {
            const winnerArr = [...players];
            winnerArr[playerIndex].score += 1;
            setPlayers(winnerArr);
            setRoundWinner(winnerArr[playerIndex]);
            setPhase('round_winner');
            setShowHint(false);
            
            setTimeout(() => {
              if (currentRoundIndex + 1 >= gameRounds.length) {
                setPhase('game_over');
              } else {
                setCurrentRoundIndex(prev => prev + 1);
                setPhase('countdown');
              }
            }, 4000);
          }
        }
      });
    }
  }, [messages, phase, gameRounds, currentRoundIndex, players]);

  // Countdown logic
  useEffect(() => {
    if (phase === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('playing');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const startGame = () => {
    if (players.length === 0) return;
    setGameRounds(shuffleArray(ROUNDS).slice(0, 5)); // Play 5 rounds
    setPhase('countdown');
  };

  const getWinner = () => {
    if (players.length === 0) return null;
    return [...players].sort((a, b) => b.score - a.score)[0];
  };

  return (
    <div className="flex h-full w-full max-w-[1600px] mx-auto gap-6 p-6 font-arabic" dir="rtl">
      {/* Main Game Area */}
      <div className="flex-1 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="h-20 border-b border-brand-gold/10 flex items-center justify-between px-8 bg-black/20">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">
              الرابط <span className="text-brand-gold">العجيب</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 font-bold ${
                showChat 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {showChat ? (
                <><MessageSquareOff className="w-5 h-5" /> إخفاء الشات</>
              ) : (
                <><MessageSquare className="w-5 h-5" /> إظهار الشات</>
              )}
            </button>
            <button onClick={onLeave} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-white/50 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {phase === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center max-w-2xl"
              >
                <div className="w-32 h-32 bg-brand-gold/10 rounded-3xl flex items-center justify-center border-2 border-brand-gold mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                  <BrainCircuit className="w-16 h-16 text-brand-gold" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">ابحث عن الرابط المشترك!</h1>
                
                <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 text-right mb-8 w-full">
                    <h3 className="text-brand-gold font-bold mb-2 flex items-center gap-2">
                        <Tag className="w-5 h-5" /> طريقة اللعب:
                    </h3>
                    <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>1. اكتب <span className="text-brand-gold font-bold">!join</span> لدخول الردهة الآن.</li>
                        <li>2. ستظهر مجموعة من الكلمات والصور على الشاشة تبدو مختلفة.</li>
                        <li>3. فكر بسرعة! ما هو <span className="text-brand-gold font-bold">الرابط العجيب التصنيفي أو المشترك</span> بينهم؟</li>
                        <li>4. أول شخص يكتب الإجابة المطلوبة الصحيحة في الشات سيفوز بنقطة الجولة!</li>
                    </ul>
                </div>
                
                <div className="flex items-center gap-6 mb-12">
                  <div className="bg-black/50 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">
                    <span className="text-3xl font-black text-brand-gold mb-1">{players.length}</span>
                    <span className="text-sm font-bold text-zinc-500">عدد اللاعبين</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    disabled={players.length === 0}
                    className="bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-12 py-5 rounded-2xl text-xl transition-all shadow-lg flex items-center gap-3"
                  >
                    <Play className="w-6 h-6" /> ابدأ اللعبة
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl font-bold text-zinc-400 mb-8">الجولة {currentRoundIndex + 1}</h2>
                <div className="text-9xl font-black text-brand-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                  {countdown}
                </div>
              </motion.div>
            )}

            {phase === 'playing' && gameRounds[currentRoundIndex] && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full"
              >
                <div className="bg-brand-gold/10 px-6 py-2 rounded-xl border border-brand-gold/30 text-brand-gold font-black mb-12 animate-pulse flex items-center gap-2">
                  <Timer className="w-5 h-5" /> أسرع واكتب في الشات!
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
                  {gameRounds[currentRoundIndex].items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-zinc-900 border-2 border-white/10 rounded-3xl overflow-hidden flex flex-col w-64 shadow-2xl"
                    >
                      <div className="h-48 w-full relative bg-black/50 flex items-center justify-center overflow-hidden">
                        <img 
                            src={item.image} 
                            alt={item.text} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl">❓</span>';
                            }}
                        />
                      </div>
                      <div className="p-4 bg-zinc-900 text-center border-t border-white/10">
                        <span className="text-2xl font-black text-white">{item.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Hint System */}
                <div className="mt-12 flex flex-col items-center">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      <Lightbulb className="w-5 h-5" /> إظهار تلميح
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 border border-white/20 px-8 py-4 rounded-2xl text-center"
                    >
                      <p className="text-zinc-400 text-sm mb-2">عدد الأحرف المكونة للكلمة:</p>
                      <div className="flex gap-2 justify-center" dir="ltr">
                        {gameRounds[currentRoundIndex].answer[0].split('').map((char, i) => (
                          <div key={i} className="w-8 h-10 border-b-2 border-brand-gold flex items-center justify-center text-xl font-bold bg-black/50 rounded-t-sm">
                            {char === ' ' ? ' ' : ''}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}

            {phase === 'round_winner' && roundWinner && currentRoundIndex < gameRounds.length && (
              <motion.div
                key="round_winner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center text-center bg-black/80 p-12 rounded-[40px] border-2 border-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              >
                <h2 className="text-3xl font-bold text-white mb-6">الرابط هو: <span className="text-brand-gold font-black">{gameRounds[currentRoundIndex].answer[0]}</span></h2>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-brand-gold overflow-hidden mb-6 mx-auto shadow-2xl relative z-10">
                    <img src={roundWinner.avatar} alt={roundWinner.username} className="w-full h-full object-cover" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -bottom-4 -right-4 bg-brand-gold text-black p-3 rounded-full border-4 border-black z-20"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{roundWinner.username}</h3>
                <p className="text-brand-gold font-bold text-xl">أول من أجاب بشكل صحيح! +1 نقطة</p>
              </motion.div>
            )}

            {phase === 'game_over' && (
              <motion.div
                key="game_over"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center max-w-2xl bg-black/80 p-12 rounded-[40px] border border-brand-gold/30"
              >
                <Trophy className="w-32 h-32 text-brand-gold mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
                <h1 className="text-5xl font-black text-white mb-4">انتهت اللعبة!</h1>
                {getWinner() ? (
                  <>
                    <h2 className="text-3xl font-bold text-zinc-300 mb-8">الفائز الأول</h2>
                    <div className="w-40 h-40 rounded-full border-[6px] border-brand-gold overflow-hidden mb-6 mx-auto shadow-[0_0_50px_rgba(212,175,55,0.4)] relative">
                       <img src={getWinner()?.avatar} alt={getWinner()?.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-5xl font-black text-brand-gold mb-2">{getWinner()?.username}</div>
                    <div className="text-2xl text-white font-bold bg-white/10 px-6 py-2 rounded-xl inline-block">{getWinner()?.score} نقاط</div>
                  </>
                ) : (
                  <p className="text-2xl text-zinc-400">لا يوجد فائزين</p>
                )}
                <button
                  onClick={() => {
                    setPlayers([]);
                    setPhase('lobby');
                  }}
                  className="mt-12 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" /> عودة للردهة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Leaderboard */}
      <div className={`w-[350px] flex flex-col gap-4 transition-all duration-300 ${!showChat ? 'w-[500px]' : ''}`}>
        <div className="bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <Users className="w-6 h-6 text-brand-gold" />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-brand-gold to-yellow-200">
              اللاعبين والمراكز
            </span>
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative z-10">
            {[...players].sort((a,b) => b.score - a.score).map((p, i) => (
              <motion.div 
                layout
                key={p.username} 
                className={`p-3 rounded-2xl flex items-center gap-4 border transition-all ${
                  i === 0 && p.score > 0
                    ? 'bg-brand-gold/10 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <div className={`font-black text-lg w-6 text-center ${i === 0 && p.score > 0 ? 'text-brand-gold' : 'text-zinc-500'}`}>
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 relative ${i===0 && p.score > 0 ? 'border-brand-gold' : 'border-white/10'}`}>
                  <img src={p.avatar} alt="avatar" className="w-full h-full object-cover" />
                  {i === 0 && p.score > 0 && (
                    <div className="absolute -top-2 -right-2 text-brand-gold drop-shadow-md">
                      <Crown className="w-5 h-5 fill-brand-gold" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{p.username}</div>
                  <div className="text-brand-gold/70 text-xs font-bold mt-0.5">{p.score} نقاط</div>
                </div>
              </motion.div>
            ))}
            
            {players.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                <Users className="w-12 h-12 mb-4" />
                <p>لا يوجد لاعبين</p>
                <p className="text-xs mt-1">بانتظار انضمام اللاعبين...</p>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <div className="h-[400px] bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative flex flex-col pt-16">
            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-6">
              <MessageSquare className="w-5 h-5 text-brand-gold ml-2" />
              <span className="text-white font-bold">الشات المباشر</span>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col-reverse p-4 pt-20 custom-scrollbar relative z-0">
              <AnimatePresence>
                {messages.slice().reverse().map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-brand-gold flex-shrink-0">
                        <img src={msg.avatar} alt={msg.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm">{msg.username}</div>
                        <p className="text-zinc-300 text-sm pl-8 font-arabic break-words">{msg.message}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
