import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Square, RotateCcw, ArrowRight, UserPlus, Timer, User } from 'lucide-react';

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
  const [turnTimeLeft, setTurnTimeLeft] = useState(15);
  const [lastPlayer, setLastPlayer] = useState<string | null>(null);
  
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

    const attemptedWord = text.split(/\s+/)[0].replace(/[^\u0600-\u06FF]/g, ''); // Keep only Arabic chars
    if (!attemptedWord) return;

    const requiredLetter = currentWord.slice(-1);
    
    const normalize = (char: string) => {
      if (['أ', 'إ', 'آ', 'ا'].includes(char)) return 'ا';
      if (['ة', 'ه'].includes(char)) return 'ه';
      return char;
    };

    const firstChar = attemptedWord.charAt(0);
    
    if (normalize(firstChar) === normalize(requiredLetter) && !usedWords.has(attemptedWord)) {
      // Valid word!
      setCurrentWord(attemptedWord);
      setUsedWords(prev => new Set(prev).add(attemptedWord));
      setScores(prev => ({
        ...prev,
        [latestMessage.username]: (prev[latestMessage.username] || 0) + 10
      }));
      setLastPlayer(latestMessage.username);
      nextTurn();
    }
  }, [messages, status, currentWord, usedWords, activePlayers, currentPlayerIndex]);

  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTurnTimeLeft(prev => {
          if (prev <= 1) {
            handlePlayerTimeout();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, activePlayers, currentPlayerIndex]);

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
      setTurnTimeLeft(15);
    }
  };

  const nextTurn = () => {
    setCurrentPlayerIndex(prev => (prev + 1) % activePlayers.length);
    setTurnTimeLeft(15);
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
    setTurnTimeLeft(15);
    setStatus('playing');
    processedMessageIds.current.clear();
  };

  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 10);

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-brand-gold/10 bg-black/40 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-brand-gold/5 hover:bg-brand-gold/10 text-brand-gold/70 hover:text-brand-gold rounded-xl transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">سلسلة الكلمات</h2>
            <p className="text-brand-gold/50 text-sm">تبدأ الكلمة بآخر حرف من الكلمة السابقة</p>
          </div>
        </div>
        
        {status === 'playing' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-6 py-3 rounded-xl font-bold text-xl border border-brand-gold/30">
              <Timer className="w-6 h-6" />
              {turnTimeLeft} ثانية
            </div>
            <button
              onClick={() => setStatus('finished')}
              className="flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 text-white rounded-xl font-bold transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
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
              className="w-full max-w-md bg-black/40 p-12 rounded-3xl border border-brand-gold/20 text-center relative overflow-hidden shadow-2xl"
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
                <UserPlus className="w-32 h-32 text-brand-gold mx-auto mb-8 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
                <h3 className="text-3xl font-bold text-white mb-4">إعداد اللعبة</h3>
                <p className="text-zinc-400 mb-12 text-lg">اطلب من المتابعين كتابة <span className="text-brand-gold font-bold bg-brand-gold/10 px-2 py-1 rounded-lg border border-brand-gold/20">!join</span> للمشاركة. نحتاج لاعبين على الأقل.</p>
                
                <button
                  onClick={startGame}
                  disabled={joinedPlayers.length < 2}
                  className="w-full flex items-center justify-center gap-3 py-6 bg-brand-gold hover:bg-brand-gold-light disabled:bg-zinc-800 disabled:text-zinc-500 text-black rounded-2xl font-bold text-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current" />
                  ابدأ اللعب
                </button>
              </div>
            </motion.div>
          )}

          {status === 'playing' && (
            <div className="flex flex-col items-center w-full">
              <div className="text-zinc-400 text-xl mb-4">الكلمة الحالية:</div>
              <motion.div 
                key={currentWord}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-bold text-white mb-12 flex items-center justify-center gap-2 flex-row-reverse"
              >
                {currentWord.split('').map((char, i) => (
                  <span 
                    key={i} 
                    className={i === currentWord.length - 1 ? "text-brand-gold glow-gold-text" : ""}
                  >
                    {char}
                  </span>
                ))}
              </motion.div>

              <div className="text-2xl text-zinc-300 mb-12">
                الحرف المطلوب: <span className="text-brand-gold font-bold text-4xl mx-2">{currentWord.slice(-1)}</span>
              </div>

              <div className="bg-black/40 border border-brand-gold/20 rounded-3xl p-8 w-full max-w-md text-center shadow-xl">
                <div className="text-brand-gold/50 text-sm font-bold uppercase tracking-wider mb-2">دور اللاعب</div>
                <div className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                  <User className="w-8 h-8 text-brand-gold" />
                  {activePlayers[currentPlayerIndex]}
                </div>
                <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-brand-gold/10">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 15, ease: "linear" }}
                    key={currentPlayerIndex}
                    className="h-full bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]"
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
              <Trophy className="w-32 h-32 text-brand-gold mx-auto mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] glow-gold" />
              <h3 className="text-4xl font-bold text-white mb-4">انتهت اللعبة!</h3>
              {activePlayers.length === 1 && (
                <p className="text-2xl text-brand-gold font-bold mb-4">الفائز: {activePlayers[0]}</p>
              )}
              <p className="text-xl text-zinc-400 mb-8">تم لعب {usedWords.size} كلمة</p>
              
              <button
                onClick={() => {
                  setStatus('setup');
                  setJoinedPlayers([]);
                }}
                className="flex items-center gap-2 px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-black rounded-xl font-bold text-lg transition-colors mx-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                <RotateCcw className="w-6 h-6" />
                لعبة جديدة
              </button>
            </motion.div>
          )}
        </div>

        {/* Players Sidebar */}
        <div className="w-80 bg-black/40 border-r border-brand-gold/10 p-6 flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-brand-gold" />
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
                    className="bg-black/40 border border-brand-gold/10 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-sm border border-brand-gold/30">
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
                      index === currentPlayerIndex ? 'bg-brand-gold/20 border-brand-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'bg-black/40 border-brand-gold/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white truncate max-w-[120px]">{username}</span>
                      {index === currentPlayerIndex && <span className="text-xs text-brand-gold font-bold">دوره</span>}
                    </div>
                    <span className="text-brand-gold font-bold">{scores[username] || 0}</span>
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
