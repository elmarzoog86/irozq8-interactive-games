import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Users, ArrowLeft, ArrowRight, Languages, Timer, CheckCircle2, Crown, Tag, MessageSquare, MessageSquareOff } from 'lucide-react';

interface Player {
  username: string;
  score: number;
  avatar: string;
}

interface Question {
  letter: string;
  category: string;
  answers: string[];
}

const QUESTIONS: Question[] = [
  { letter: 'م', category: 'حيوان', answers: ['ماعز', 'مها', 'ميمون', 'مدرع', 'محار', 'مكاك', 'ماموث'] },
  { letter: 'ب', category: 'خضار/فواكه', answers: ['بطيخ', 'برتقال', 'بصل', 'باذنجان', 'بقدونس', 'باميا', 'بازلاء', 'بنجر', 'برقوق', 'بوملي'] },
  { letter: 'س', category: 'دولة', answers: ['سوريا', 'سعودية', 'سويسرا', 'سريلانكا', 'سنغافورة', 'سودان', 'سويد', 'سنغال', 'سلوفاكيا', 'سلوفينيا'] },
  { letter: 'ك', category: 'جماد', answers: ['كرسي', 'كتاب', 'كأس', 'كوب', 'كراسة', 'كيس', 'كفر', 'كنبة', 'كابل', 'كمبيوتر', 'كيبورد', 'كاميرا', 'كشاف'] },
  { letter: 'ف', category: 'حيوان', answers: ['فيل', 'فأر', 'فهد', 'فقمة', 'فلامنجو', 'فراشة', 'فرس النهر'] },
  { letter: 'م', category: 'دولة', answers: ['مصر', 'مغرب', 'موريتانيا', 'ماليزيا', 'مالي', 'مكسيك', 'موزمبيق', 'مقدونيا', 'مدغشقر'] },
  { letter: 'ت', category: 'خضار/فواكه', answers: ['تفاح', 'توت', 'تين', 'تمر', 'تمر هندي', 'ترنج'] },
  { letter: 'ن', category: 'حيوان', answers: ['نمر', 'نسر', 'نورس', 'نحلة', 'نملة', 'نعامة', 'ناقة', 'نيص'] },
  { letter: 'ع', category: 'دولة', answers: ['عراق', 'عمان', 'عمان', 'عربية'] },
  { letter: 'د', category: 'حيوان', answers: ['دب', 'دجاجة', 'ديك', 'دولفين', 'دودة', 'ديناصور', 'دبور'] },
  { letter: 'أ', category: 'دولة', answers: ['المانيا', 'امريكا', 'ارجنتين', 'اسبانيا', 'ايطاليا', 'اردن', 'امارات', 'استراليا', 'اوروجواي', 'اكوادور'] },
  { letter: 'ط', category: 'جماد', answers: ['طاولة', 'طائرة', 'طبق', 'طنجرة', 'طوق', 'طاقية', 'طبلة', 'طلاء'] },
  { letter: 'ق', category: 'حيوان', answers: ['قرد', 'قط', 'قطة', 'قنديل', 'قرش', 'قنفذ', 'قملة', 'قندس'] },
  { letter: 'ر', category: 'خضار/فواكه', answers: ['رمان', 'رامبوتان', 'رطب', 'ريحان'] },
];

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

type Phase = 'idle' | 'countdown' | 'playing' | 'round_winner' | 'game_over';

export function ScattergoriesGame({ messages, onLeave, channelName }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundWinner, setRoundWinner] = useState<{ player: Player, word: string } | null>(null);
  const [showChat, setShowChat] = useState(true);

  const processedMessageIds = useRef<Set<string>>(new Set());

  // Handle Gameplay chat (No explicit JOIN needed)
  useEffect(() => {
    if (phase === 'playing' && questions.length > 0) {
      const currentQuestion = questions[currentRoundIndex];
      
      messages.forEach(async msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          
          // Check if answer is correctly in the category list
          const isCorrect = currentQuestion.answers.some(ans => text === ans || text.includes(ans));
          
          if (isCorrect) {
             // Handle adding score instantly to player or creating them
             let winnerArr = [...players];
             let playerIndex = winnerArr.findIndex(p => p.username === msg.username);
             
             let playerToUpdate: Player;

             if (playerIndex === -1) {
                // New player answered correctly on the fly!
                const avatarRaw = await fetch(`https://decapi.me/twitch/avatar/${msg.username}`).then(r => r.text()).catch(() => '');
                const avatar = avatarRaw && avatarRaw.startsWith('http') ? avatarRaw : `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`;
                
                playerToUpdate = { username: msg.username, score: 1, avatar };
                winnerArr.push(playerToUpdate);
             } else {
                winnerArr[playerIndex].score += 1;
                playerToUpdate = winnerArr[playerIndex];
             }

            setPlayers(winnerArr);
            setRoundWinner({ player: playerToUpdate, word: text });
            setPhase('round_winner');
            
            setTimeout(() => {
              if (currentRoundIndex + 1 >= questions.length) {
                setPhase('game_over');
              } else {
                setCurrentRoundIndex(prev => prev + 1);
                setPhase('countdown');
              }
            }, 5000);
          }
        }
      });
    }
  }, [messages, phase, questions, currentRoundIndex, players]);

  // Round Timer
  useEffect(() => {
    if (phase === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // No one answered in time
            if (currentRoundIndex + 1 >= questions.length) {
                setPhase('game_over');
            } else {
                setCurrentRoundIndex(c => c + 1);
                setPhase('countdown');
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, currentRoundIndex, questions]);

  // Countdown logic
  useEffect(() => {
    if (phase === 'countdown') {
      setCountdown(3);
      setTimeLeft(30);
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
    setQuestions(shuffleArray(QUESTIONS).slice(0, maxRounds));
    setPhase('countdown');
    setRoundWinner(null);
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
              حرف <span className="text-brand-gold">وفئة</span>
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
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center max-w-2xl"
              >
                <div className="w-32 h-32 bg-brand-gold/10 rounded-3xl flex items-center justify-center border-2 border-brand-gold mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] transform rotate-6">
                  <Languages className="w-16 h-16 text-brand-gold -rotate-6" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">سرعة البديهة والكلمات!</h1>
                
                <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 text-right mb-8 w-full">
                    <h3 className="text-brand-gold font-bold mb-2 flex items-center gap-2">
                        <Tag className="w-5 h-5" /> طريقة اللعب:
                    </h3>
                    <ul className="text-zinc-300 space-y-2 text-sm">
                        <li>1. <span className="text-red-400 font-bold">لا داعي</span> لكتابة !join في هذه اللعبة! الردهة مفتوحة للجميع.</li>
                        <li>2. ستظهر <span className="text-brand-gold font-bold">فئة وحرف</span> على الشاشة.</li>
                        <li>3. أسرع شخص في الشات يكتب كلمة صحيحة تنتمي للفئة وتبدأ بالحرف سيحصل على النقطة تلقائياً!</li>
                    </ul>
                </div>

                <div className="flex flex-col items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/10 mb-8 w-full">
                  <h3 className="text-brand-gold font-bold text-xl">اختر عدد الجولات</h3>
                  <div className="flex gap-4">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setMaxRounds(num)}
                        className={`px-6 py-2 rounded-xl font-bold transition-all ${
                          maxRounds === num
                            ? 'bg-brand-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {num} جولات
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startGame}
                  className="bg-brand-gold hover:bg-brand-gold-light text-black font-black px-12 py-5 rounded-2xl text-xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] flex items-center gap-3 transform hover:scale-105"
                >
                  <Play className="w-6 h-6 fill-black" /> ابدأ اللعبة الآن
                </button>
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
                <h2 className="text-3xl font-bold text-zinc-400 mb-8">الجولة {currentRoundIndex + 1} تبدأ خلال..</h2>
                <div className="text-9xl font-black text-brand-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]">
                  {countdown}
                </div>
              </motion.div>
            )}

            {phase === 'playing' && questions[currentRoundIndex] && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full"
              >
                {/* Timer Bar */}
                <div className="w-full max-w-2xl bg-white/5 rounded-full h-4 mb-16 border border-white/10 overflow-hidden relative">
                    <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / 30) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                        className={`absolute top-0 bottom-0 right-0 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-brand-gold'} shadow-[0_0_15px_rgba(212,175,55,0.5)]`}
                    />
                </div>

                <div className="flex gap-8 mb-12 w-full justify-center">
                    <div className="bg-zinc-900 border-2 border-brand-gold/30 rounded-3xl p-8 flex flex-col items-center shadow-2xl w-64">
                         <span className="text-zinc-500 font-bold mb-4 uppercase tracking-widest text-sm">الفئة المطلوبة</span>
                         <span className="text-4xl font-black text-white">{questions[currentRoundIndex].category}</span>
                    </div>

                    <div className="bg-brand-gold/10 border-2 border-brand-gold rounded-3xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(212,175,55,0.3)] w-64 transform scale-110">
                         <span className="text-brand-gold/60 font-bold mb-4 uppercase tracking-widest text-sm">تبدأ بحرف</span>
                         <span className="text-6xl font-black text-brand-gold">{questions[currentRoundIndex].letter}</span>
                    </div>
                </div>

                <div className="bg-white/5 px-8 py-4 rounded-xl border border-white/10 text-white font-bold flex items-center gap-3">
                  <Timer className="w-6 h-6 text-brand-gold animate-pulse" /> أسرع واكتب في الشات!
                </div>
              </motion.div>
            )}

            {phase === 'round_winner' && roundWinner && (
              <motion.div
                key="round_winner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center text-center bg-black/80 p-12 rounded-[40px] border-2 border-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              >
                <div className="bg-brand-gold text-black font-black text-2xl px-8 py-2 rounded-xl mb-8 transform -rotate-2">
                    « {roundWinner.word} »
                </div>
                
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-brand-gold overflow-hidden mb-6 shadow-2xl relative z-10">
                    <img src={roundWinner.player.avatar} alt={roundWinner.player.username} className="w-full h-full object-cover" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -bottom-4 -right-4 bg-brand-gold text-black p-3 rounded-full border-4 border-black z-20"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{roundWinner.player.username}</h3>
                <p className="text-brand-gold font-bold text-xl">إجابة صحيحة! وحصل على النقطة</p>
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
                  <p className="text-2xl text-zinc-400">لا يوجد متصدرين</p>
                )}
                <button
                  onClick={() => {
                    setPlayers([]);
                    setPhase('idle');
                  }}
                  className="mt-12 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" /> عودة وبداية جديدة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Leaderboard */}
      <div className={`w-[350px] flex flex-col gap-4 transition-all duration-300 ${!showChat ? 'w-[500px]' : ''}`}>
        <div className="flex-1 bg-black/80 rounded-[40px] border border-brand-gold/20 p-6 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <Users className="w-6 h-6 text-brand-gold" />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-brand-gold to-yellow-200">
              قائمة المتصدرين
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
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50 text-center gap-4">
                <Languages className="w-12 h-12 mb-2" />
                <div>
                   <p className="font-bold mb-1">الردهة مفتوحة</p>
                   <p className="text-xs">المشاركين سيدخلون للقائمة تلقائياً بمجرد إجابتهم بشكل صحيح</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <div className="h-[400px] bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10" />
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-gold" />
              <span className="text-white font-bold">الشات المباشر</span>
            </div>
            
            <div className="h-full overflow-y-auto flex flex-col-reverse p-4 pt-20 custom-scrollbar relative z-0">
              <AnimatePresence>
                {messages.slice().reverse().map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-3 bg-white/5 rounded-2xl p-3 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-brand-gold/20 flex items-center justify-center text-xs">
                        {msg.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm" style={{ color: msg.color || '#fff' }}>
                        {msg.username}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm pl-8 font-arabic break-words">{msg.message}</p>
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
