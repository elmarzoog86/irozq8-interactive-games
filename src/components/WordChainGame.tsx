import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Square, RotateCcw, ArrowRight, UserPlus, Timer, User, Check, X, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  message: string;
  color?: string;
}

interface Props {
  messages: Message[];
  onLeave: () => void;
}

const STARTING_WORDS = [
  "تفاحة", "كتاب", "قلم", "شمس", "قمر", "بحر", "جبل", "نهر", "سماء", "أرض", 
  "وردة", "شجرة", "بيت", "مدرسة", "جامعة", "طالب", "معلم", "طبيب", "مهندس", "فنان"
];

export const WordChainGame: React.FC<Props> = ({ messages, onLeave }) => {
  const [status, setStatus] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [currentWord, setCurrentWord] = useState('');
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [joinedPlayers, setJoinedPlayers] = useState<string[]>([]);
  const [activePlayers, setActivePlayers] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [lastPlayer, setLastPlayer] = useState<string | null>(null);
  const [pendingWord, setPendingWord] = useState<{word: string, player: string} | null>(null);
  
  const processedMessageIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (processedMessageIds.current.has(latestMessage.id)) return;
    processedMessageIds.current.add(latestMessage.id);

    const text = latestMessage.message.trim().toLowerCase();
    
    // Handle !join
    if (text === '!join') {
      if (status === 'setup') {
        setJoinedPlayers(prev => {
          if (prev.includes(latestMessage.username)) return prev;
          return [...prev, latestMessage.username];
        });
      }
      return;
    }

    if (status !== 'playing') return;

    // Only accept words from the current player
    const currentPlayer = activePlayers[currentPlayerIndex];
    if (latestMessage.username !== currentPlayer) return;

    // Require command before the word to avoid random chat/emotes
    if (!text.startsWith('!w ') && !text.startsWith('!ج ')) return;

    const attemptedWord = text.substring(3).trim().split(/\s+/)[0].replace(/[^\u0600-\u06FF]/g, ''); // Keep only Arabic chars
    if (!attemptedWord) return;

    const requiredLetter = currentWord.slice(-1);
    
    const normalize = (char: string) => {
      if (['أ', 'إ', 'آ', 'ا', 'ء', 'ؤ', 'ئ'].includes(char)) return 'ا';
      if (['ة', 'ه'].includes(char)) return 'ه';
      return char;
    };

    const firstChar = attemptedWord.charAt(0);
    
    if (normalize(firstChar) === normalize(requiredLetter) && !usedWords.has(attemptedWord)) {
      if (!pendingWord) {
        setPendingWord({ word: attemptedWord, player: latestMessage.username });
      }
    }
  }, [messages, status, currentWord, usedWords, activePlayers, currentPlayerIndex, pendingWord]);

  useEffect(() => {
    if (status === 'playing' && !pendingWord) {
      timerRef.current = window.setInterval(() => {
        setTurnTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, pendingWord]);

  useEffect(() => {
    if (status === 'playing' && turnTimeLeft === 0 && !pendingWord) {
      handlePlayerTimeout();
    }
  }, [turnTimeLeft, status, pendingWord]);

  const getTurnDuration = (wordsCount: number) => {
    const rounds = wordsCount - 1;
    if (rounds >= 40) return 15;
    if (rounds >= 30) return 20;
    if (rounds >= 20) return 25;
    return 30;
  };

  const handlePlayerTimeout = () => {
    const playerToRemove = activePlayers[currentPlayerIndex];
    const newActivePlayers = activePlayers.filter(p => p !== playerToRemove);

    if (newActivePlayers.length <= 1) {
      setActivePlayers(newActivePlayers);
      setStatus('finished');
    } else {
      setActivePlayers(newActivePlayers);
      // If we removed the last player in the list, wrap around to 0
      const nextIndex = currentPlayerIndex >= newActivePlayers.length ? 0 : currentPlayerIndex;
      setCurrentPlayerIndex(nextIndex);
      setTurnTimeLeft(getTurnDuration(usedWords.size));
    }
  };

  const nextTurn = (newWordsCount: number) => {
    setCurrentPlayerIndex(prev => (prev + 1) % activePlayers.length);
    setTurnTimeLeft(getTurnDuration(newWordsCount));
  };

  const acceptWord = () => {
    if (!pendingWord) return;
    setCurrentWord(pendingWord.word);
    const newWordsCount = usedWords.size + 1;
    setUsedWords(prev => new Set(prev).add(pendingWord.word));
    setScores(prev => ({
      ...prev,
      [pendingWord.player]: (prev[pendingWord.player] || 0) + 10
    }));
    setLastPlayer(pendingWord.player);
    setPendingWord(null);
    nextTurn(newWordsCount);
  };  const rejectWord = () => {
    setPendingWord(null);
  };

  const startGame = () => {
    if (joinedPlayers.length < 2) return;
    
    const randomStartWord = STARTING_WORDS[Math.floor(Math.random() * STARTING_WORDS.length)];
    setCurrentWord(randomStartWord);
    setUsedWords(new Set([randomStartWord]));
    setScores({});
    setLastPlayer(null);
    setActivePlayers([...joinedPlayers].sort(() => Math.random() - 0.5));
    setCurrentPlayerIndex(0);
    setTurnTimeLeft(30);
    setStatus('playing');
    processedMessageIds.current.clear();
  };

  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 10);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-brand-black/80  rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-brand-cyan/10 bg-brand-black/70 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-brand-cyan/5 hover:bg-brand-indigo/10 text-brand-cyan/70 hover:text-brand-cyan rounded-xl transition-colors border border-brand-indigo/20 hover:border-brand-cyan/40"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">سلسلة الكلمات</h2>
            <p className="text-brand-cyan/50 text-sm">تبدأ الكلمة بآخر حرف من الكلمة السابقة</p>
          </div>
        </div>
        
        {status === 'playing' && (
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xl border transition-all ${
              turnTimeLeft <= 10 
                ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                : 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30'
            }`}>
              <Timer className={`w-6 h-6 ${turnTimeLeft <= 10 ? 'animate-bounce' : ''}`} />
              <span className={turnTimeLeft <= 10 ? 'font-black' : ''}>{turnTimeLeft} ثانية</span>
            </div>
            <button
              onClick={() => setStatus('finished')}
              className="flex items-center gap-2 px-6 py-3 bg-brand-black/70 hover:bg-brand-black/80 text-white rounded-xl font-bold transition-colors border border-brand-cyan/20 hover:border-brand-cyan/40"
            >
              <Square className="w-5 h-5 fill-current" />
              إنهاء اللعبة
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {status === 'setup' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-brand-black/70 p-12 rounded-3xl border border-brand-cyan/20 text-center relative overflow-hidden shadow-2xl"
            >
              {/* Chalkboard Background Decoration */}
              <div className="absolute inset-0 opacity-10 z-0 pointer-events-none">
                <img 
                  src="/wordchain.png" 
                  alt="Chalkboard Background" 
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80";
                  }}
                />
              </div>

              <div className="relative z-10">
                <UserPlus className="w-24 h-24 text-brand-cyan mx-auto mb-6 drop-shadow-[0_0_20px_rgba(0, 229, 255,0.3)]" />
                <h3 className="text-3xl font-bold text-white mb-4">إعداد اللعبة</h3>
                <p className="text-zinc-400 mb-6 text-lg">اطلب من المتابعين كتابة <span className="text-brand-pink font-bold bg-brand-indigo/10 px-2 py-1 rounded-lg border border-brand-indigo/20">!join</span> للمشاركة. نحتاج لاعبين على الأقل.</p>
                
                {/* Tutorial Section */}
                <div className="bg-brand-black/50 border border-brand-cyan/20 rounded-2xl p-5 mb-8 text-right text-sm">
                  <h4 className="text-brand-cyan font-bold mb-3 flex items-center gap-2 justify-end text-lg">
                    <span>طريقة اللعب</span>
                    <HelpCircle className="w-5 h-5" />
                  </h4>
                  <ul className="text-zinc-300 space-y-3">
                    <li>1. الانضمام عبر كتابة <span className="text-brand-pink font-mono">!join</span> في الشات.</li>
                    <li>2. عند بدء اللعبة، سيظهر دور لاعب معين وحرف مطلوب لتكوين كلمة.</li>
                    <li>3. يجب أن يكتب اللاعب كلمة تبدأ بآخر حرف من الكلمة السابقة.</li>
                      <li>4. طريقة الإجابة: <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded">!w الكلمة</span> أو <span className="text-white font-mono bg-zinc-800 px-2 py-1 rounded">!ج الكلمة</span>.</li>
                      <li>5. لديك <span className="text-brand-pink font-bold">وقت محدد يقل مع كثرة الكلمات</span> للإجابة قبل الإقصاء!</li>
                  </ul>
                </div>

                <button
                  onClick={startGame}
                  disabled={joinedPlayers.length < 2}
                  className="w-full flex items-center justify-center gap-3 py-6 bg-brand-pink hover:bg-pink-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-brand-black rounded-2xl font-bold text-2xl transition-all shadow-[0_0_30px_rgba(0, 229, 255,0.4)] hover:shadow-[0_0_40px_rgba(0, 229, 255,0.6)] active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current" />
                  ابدأ اللعب
                </button>
              </div>
            </motion.div>
          )}

          {status === 'playing' && (
            <div className="flex flex-col items-center w-full">
              {pendingWord && (
                <div className="absolute inset-0 bg-brand-black/80 z-50 flex items-center justify-center backdrop-blur-sm rounded-l-[40px]">
                  <motion.div 
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    className="bg-zinc-900 border border-brand-indigo/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
                  >
                    <h3 className="text-xl text-zinc-400 mb-6">هل هذه الكلمة صحيحة؟</h3>
                    <div className="flex flex-col items-center gap-3 mb-6">
                      <img 
                        src={`https://decapi.me/twitch/avatar/${pendingWord.player}`} 
                        alt={pendingWord.player}
                        className="w-20 h-20 rounded-full border-2 border-brand-cyan bg-brand-black/50"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${pendingWord.player}&background=27272a&color=00e5ff`;
                        }}
                      />
                      <span className="text-2xl font-bold text-white">{pendingWord.player}</span>
                    </div>
                    
                    <div className="text-5xl font-black text-brand-pink mb-8 bg-brand-black/40 py-4 rounded-xl border border-brand-cyan/10">
                      {pendingWord.word}
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={acceptWord}
                        className="flex-1 flex flex-col items-center gap-2 py-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl hover:scale-105 transition-all outline-none border border-green-500/30"
                      >
                        <Check className="w-8 h-8" />
                        <span className="font-bold text-lg">قبول (صح)</span>
                      </button>
                      <button
                        onClick={rejectWord}
                        className="flex-1 flex flex-col items-center gap-2 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl hover:scale-105 transition-all outline-none border border-red-500/30"
                      >
                        <X className="w-8 h-8" />
                        <span className="font-bold text-lg">رفض (خطأ)</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              <div className="text-zinc-400 text-xl mb-4">الكلمة الحالية:</div>
              <motion.div 
                key={currentWord}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-bold text-brand-cyan glow-cyan-text mb-12 flex items-center justify-center"
                dir="rtl"
              >
                {currentWord}
              </motion.div>

              <div className="text-2xl text-zinc-300 mb-12">
                الحرف المطلوب: <span className="text-brand-pink font-bold text-4xl mx-2">{currentWord.slice(-1)}</span>
              </div>
              
              <div className="mb-8 bg-zinc-900/80 border border-brand-cyan/20 px-6 py-3 rounded-xl flex items-center gap-3">
                <span className="text-zinc-400">للإجابة اكتب:</span>
                <span className="text-white font-mono bg-brand-black px-3 py-1 rounded">!w الكلمة</span>
                <span className="text-zinc-500">أو</span>
                <span className="text-white font-mono bg-brand-black px-3 py-1 rounded">!ج الكلمة</span>
              </div>

              <div className="bg-brand-black/70 border border-brand-cyan/20 rounded-3xl p-8 w-full max-w-md text-center shadow-xl">
                <div className="text-brand-cyan/50 text-sm font-bold uppercase tracking-wider mb-2">دور اللاعب</div>
                <div className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <User className="w-8 h-8 text-brand-cyan" />
                  {activePlayers[currentPlayerIndex]}
                </div>
                  <div className="w-full bg-brand-black/80 h-2 rounded-full overflow-hidden border border-brand-cyan/10">
                    <motion.div 
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: getTurnDuration(usedWords.size), ease: "linear" }}
                      key={`${currentPlayerIndex}-${usedWords.size}`}
                      className="h-full bg-brand-cyan shadow-[0_0_10px_rgba(0, 229, 255,0.5)]"
                    />
                  </div>
              </div>
            </div>
          )}

          {status === 'finished' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Trophy className="w-32 h-32 text-brand-indigo mx-auto mb-6 drop-shadow-[0_0_30px_rgba(0, 229, 255,0.5)] glow-cyan" />
              <h3 className="text-4xl font-bold text-white mb-4">انتهت اللعبة!</h3>
              {activePlayers.length === 1 && (
                <p className="text-2xl text-brand-cyan font-bold mb-4">الفائز: {activePlayers[0]}</p>
              )}
              <p className="text-xl text-zinc-400 mb-8">تم لعب {usedWords.size} كلمة</p>
              
              <button
                onClick={() => {
                  setStatus('setup');
                  setJoinedPlayers([]);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-brand-cyan hover:bg-brand-pink text-brand-black rounded-xl font-bold text-lg transition-colors mx-auto shadow-[0_0_20px_rgba(0, 229, 255,0.2)]"
              >
                <RotateCcw className="w-6 h-6" />
                لعبة جديدة
              </button>
            </motion.div>
          )}
        </div>

        {/* Players Sidebar */}
        <div className="w-80 bg-brand-black/70 border-r border-brand-cyan/10 p-6 flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-brand-cyan" />
            <h3 className="text-xl font-bold text-white">اللاعبون</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            <AnimatePresence>
              {status === 'setup' ? (
                joinedPlayers.map((username, index) => (
                  <motion.div
                    key={username}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-brand-black/70 border border-brand-cyan/10 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center font-bold text-sm border border-brand-cyan/30">
                      {index + 1}
                    </div>
                    <span className="font-bold text-white truncate">{username}</span>
                  </motion.div>
                ))
              ) : (
                activePlayers.map((username, index) => (
                  <motion.div
                    key={username}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`border rounded-xl p-4 flex items-center justify-between transition-colors ${
                      index === currentPlayerIndex ? 'bg-brand-cyan/20 border-brand-cyan/50 shadow-[0_0_15px_rgba(0, 229, 255,0.2)]' : 'bg-brand-black/70 border-brand-cyan/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white truncate max-w-[120px]">{username}</span>
                      {index === currentPlayerIndex && <span className="text-xs text-brand-pink font-bold">دوره</span>}
                    </div>
                    <span className="text-brand-pink font-bold">{scores[username] || 0}</span>
                  </motion.div>
                ))
              )}
              {(status === 'setup' ? joinedPlayers.length : activePlayers.length) === 0 && (
                <div className="text-center text-zinc-500 py-8">
                  لا يوجد لاعبون بعد
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

