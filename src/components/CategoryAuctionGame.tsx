import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Timer, Play, Settings, SkipForward, AlertCircle, Gavel, DollarSign, Crown, Users, MessageSquareOff, MessageSquare, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';
import type { ChatMessage } from '../types';

interface Message {
  id: string;
  username: string;
  message: string;
  color?: string;
}

interface Player {
  username: string;
  score: number;
}

interface CategoryAuctionGameProps {
  channelName: string;
  messages: Message[];
  onLeave: () => void;
}

const CATEGORIES = [
  { name: 'عواصم دول عربية', answers: ['الرياض', 'الكويت', 'الدوحة', 'ابوظبي', 'المنامة', 'مسقط', 'القاهرة', 'الخرطوم', 'طرابلس', 'تونس', 'الجزائر', 'الرباط', 'نواكشوط', 'مقديشو', 'جيبوتي', 'موروني', 'عمان', 'دمشق', 'بيروت', 'بغداد', 'صنعاء', 'القدس'] },
  { name: 'ألوان', answers: ['احمر', 'اصفر', 'ازرق', 'اخضر', 'برتقالي', 'بنفسجي', 'وردي', 'اسود', 'ابيض', 'رمادي', 'بني', 'ذهبي', 'فضي', 'كحلي', 'عنابي', 'زيتي'] },
  { name: 'فواكه', answers: ['تفاح', 'موز', 'برتقال', 'عنب', 'بطيخ', 'رمان', 'كيوي', 'مانجو', 'فراولة', 'خوخ', 'مشمش', 'كمثرى', 'اناناس', 'توت', 'تين', 'ليمون'] },
  { name: 'حيوانات مفترسة', answers: ['اسد', 'نمر', 'فهد', 'ذئب', 'ضبع', 'دب', 'تمساح', 'قرش', 'ثعلب', 'نمر ثلجي'] }
];

export default function CategoryAuctionGame({ channelName, messages, onLeave }: CategoryAuctionGameProps) {
  const [gameState, setGameState] = useState<'idle' | 'lobby' | 'bidding' | 'playing' | 'game_over'>('idle');
  const [players, setPlayers] = useState<Player[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);

  const [currentCategory, setCurrentCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [bids, setBids] = useState<{username: string, amount: number}[]>([]);
  const [highestBidder, setHighestBidder] = useState<{username: string, amount: number} | null>(null);
  
  const [guessedAnswers, setGuessedAnswers] = useState<string[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);

  const startGame = () => {
    setGameState('idle');
    setPlayers([]);
    setCurrentRound(0);
  };

  const startRound = useCallback(() => {
    if (currentRound >= maxRounds) {
      endGame();
      return;
    }
    
    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setCurrentCategory(randomCat);
    setBids([]);
    setHighestBidder(null);
    setGuessedAnswers([]);
    
    setGameState('bidding');
    setTimeLeft(30);
    setCurrentRound(prev => prev + 1);
  }, [currentRound, maxRounds]);

  const endGame = () => {
    setGameState('game_over');
    if (players.length > 0) {
      const topPlayer = [...players].sort((a, b) => b.score - a.score)[0];
      setWinner(topPlayer);
    }
  };

  useEffect(() => {
    if (gameState === 'bidding') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            if (highestBidder) {
              setGameState('playing');
              setTimeLeft(45); // 45 seconds to answer
            } else {
              // No one bid
              setTimeout(startRound, 3000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing') {
       const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Failed
            setTimeout(startRound, 4000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, highestBidder, startRound]);

  useEffect(() => {
    if (messages.length === 0) return;
    const msg = messages[messages.length - 1];
    const text = msg.message.trim();
    const username = msg.username;

    if (gameState === 'bidding') {
      const num = parseInt(text);
      if (!isNaN(num) && num > 0) {
        if (!highestBidder || num > highestBidder.amount) {
          setHighestBidder({ username, amount: num });
          setBids(prev => [{username, amount: num}, ...prev].slice(0, 5));
          
          setPlayers(prev => {
            if (!prev.find(p => p.username === username)) {
              return [...prev, { username, score: 0 }];
            }
            return prev;
          });
        }
      }
    } else if (gameState === 'playing' && highestBidder && currentCategory) {
      if (username === highestBidder.username) {
        // Check if answer is valid
        const isCorrect = currentCategory.answers.includes(text);
        const isAlreadyGuessed = guessedAnswers.includes(text);
        
        if (isCorrect && !isAlreadyGuessed) {
          setGuessedAnswers(prev => [...prev, text]);
          
          if (guessedAnswers.length + 1 >= highestBidder.amount) {
            // Won!
            setPlayers(prev => prev.map(p => 
              p.username === username ? { ...p, score: p.score + highestBidder.amount * 10 } : p
            ));
            setTimeout(startRound, 4000);
          }
        }
      }
    }
  }, [messages, gameState, highestBidder, currentCategory, guessedAnswers, startRound]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/95 relative">
      <button 
        onClick={onLeave}
        className="absolute top-6 right-6 text-zinc-500 hover:text-brand-gold transition-colors flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-full"
      >
        <ArrowRight className="w-5 h-5" />
        العودة للرئيسية
      </button>

      <div className="max-w-4xl w-full flex flex-col items-center gap-8">
        
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            <Gavel className="w-12 h-12 text-brand-gold" />
          </motion.div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            مزاد الفئات
          </h1>
          <p className="text-xl text-zinc-400">راهن على عدد الإجابات التي يمكنك تذكرها!</p>
        </div>

        {/* Game Area */}
        {gameState === 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/50 border border-brand-gold/30 rounded-3xl p-8 w-full max-w-2xl text-center backdrop-blur-sm shadow-[0_0_50px_rgba(212,175,55,0.05)]"
          >
            <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 mb-8 text-right">
              <div className="flex items-center gap-3 mb-4 justify-end">
                <h3 className="text-xl font-bold text-brand-gold">طريقة اللعب</h3>
                <Tag className="w-6 h-6 text-brand-gold" />
              </div>
              <ul className="text-zinc-300 space-y-3 text-lg dir-rtl list-none">
                <li className="flex items-center gap-2 justify-end">
                  <span>تظهر فئة معينة (مثال: عواصم عربية).</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                </li>
                <li className="flex items-center gap-2 justify-end">
                  <span>اكتب رقم في الشات للمزايدة (مثال: 5).</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                </li>
                <li className="flex items-center gap-2 justify-end text-right mt-1">
                  <span>صاحب أعلى مزايدة يكتب إجاباته <span className="text-brand-gold font-bold">مباشرة في الشات</span> (كل إجابة برسالة عادية) قبل انتهاء الوقت!</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                startGame();
                startRound();
              }}
              className="mt-4 bg-brand-gold text-black px-12 py-4 rounded-full font-bold text-xl hover:bg-yellow-400 transition-colors shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              بدء اللعبة
            </button>
          </motion.div>
        )}

        {(gameState === 'bidding' || gameState === 'playing') && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="flex justify-between items-center text-brand-gold mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                <span className="text-xl font-bold">الجولة {currentRound}/{maxRounds}</span>
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <Timer className={`w-8 h-8 ${timeLeft <= 5 ? 'text-red-500' : 'text-brand-gold'}`} />
                <span className={timeLeft <= 5 ? 'text-red-500' : 'text-white'}>{timeLeft}</span>
              </div>
            </div>

            <div className="bg-black/50 border border-brand-gold/30 rounded-3xl p-8 text-center shadow-xl">
              <h2 className="text-3xl text-brand-gold mb-2 font-bold">الفئة المحددة:</h2>
              <div className="text-5xl font-black text-white py-6 bg-white/5 rounded-2xl mb-6 border border-white/10 shadow-inner">
                {currentCategory?.name}
              </div>
              
              {gameState === 'bidding' && (
                <div>
                  <div className="text-2xl text-zinc-300 mb-4 animate-pulse">اكتب رقماً في الشات للمزايدة!</div>
                  <div className="flex flex-col items-center gap-2 mt-6">
                    {highestBidder ? (
                      <div className="bg-brand-gold/20 border border-brand-gold/50 px-8 py-4 rounded-2xl">
                        <span className="text-xl text-zinc-400">أعلى مزايدة: </span>
                        <span className="text-3xl font-bold text-brand-gold mx-2">{highestBidder.amount}</span>
                        <span className="text-xl text-white">من {highestBidder.username}</span>
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-lg">بانتظار المزايدات...</div>
                    )}
                  </div>
                </div>
              )}

              {gameState === 'playing' && highestBidder && (
                <div>
                  <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-2xl p-6 mb-6">
                     <p className="text-2xl text-white mb-2">الدور على <span className="text-brand-gold font-bold">{highestBidder.username}</span></p>
                     <p className="text-xl text-zinc-300">يجب أن يكتب <span className="text-brand-gold text-3xl font-bold mx-2">{highestBidder.amount}</span> إجابات صحيحة في الشات!</p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                     {guessedAnswers.map((ans, i) => (
                       <motion.div 
                         initial={{ scale: 0 }} animate={{ scale: 1 }} key={i}
                         className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 flex items-center justify-between"
                       >
                         <CheckCircle2 className="w-5 h-5 text-green-400" />
                         <span className="text-xl text-white font-bold">{ans}</span>
                       </motion.div>
                     ))}
                     {Array.from({length: Math.max(0, highestBidder.amount - guessedAnswers.length)}).map((_, i) => (
                       <div key={`empty-${i}`} className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-center min-h-[50px]">
                         <span className="text-zinc-600">...</span>
                       </div>
                     ))}
                  </div>
                  
                  {timeLeft === 0 && guessedAnswers.length < highestBidder.amount && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-8 text-red-500 text-3xl font-bold">
                      انتهى الوقت! لم ينجح في التحدي!
                    </motion.div>
                  )}
                  {guessedAnswers.length >= highestBidder.amount && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-8 text-green-400 text-3xl font-bold">
                      نجاح! مبرووووك!
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === 'game_over' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/50 border border-brand-gold/30 rounded-3xl p-12 text-center shadow-2xl w-full max-w-2xl"
          >
            <Trophy className="w-24 h-24 text-brand-gold mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">انتهت اللعبة!</h2>
            {winner ? (
              <div className="bg-brand-gold/10 rounded-2xl p-6 mb-8 border border-brand-gold/20">
                <p className="text-xl text-zinc-300 mb-2">الفائز هو</p>
                <p className="text-4xl font-black text-brand-gold">{winner.username}</p>
                <p className="text-2xl text-white mt-2">{winner.score} نقطة</p>
              </div>
            ) : (
              <p className="text-2xl text-zinc-400 mb-8">لا يوجد فائزين</p>
            )}
            <button
              onClick={startGame}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-lg flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowRight className="w-5 h-5" /> عودة وبداية جديدة
            </button>
          </motion.div>
        )}

        {/* Players Scoreboard */}
        {(gameState === 'bidding' || gameState === 'playing' || gameState === 'game_over') && players.length > 0 && (
          <div className="w-full max-w-4xl bg-black/40 border border-brand-gold/20 rounded-2xl p-6 overflow-hidden">
            <h3 className="text-brand-gold font-bold text-xl mb-4 text-right">اللاعبين</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar flex-row-reverse">
              {players.sort((a,b) => b.score - a.score).map((p, i) => (
                <div key={p.username} className="bg-black/60 border border-white/10 rounded-xl p-3 min-w-[200px] flex items-center justify-between">
                   <div className="text-brand-gold font-bold text-xl">{p.score}</div>
                   <div className="flex items-center gap-3">
                     <span className="text-white font-bold max-w-[100px] truncate">{p.username}</span>
                     <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold">
                       {i + 1}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header content... */}
        <div className="flex gap-4">
          <button
            onClick={startGame}
            className="bg-brand-gold text-black px-4 py-2 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)] flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            إعادة تشغيل
          </button>
        </div>

        {/* Sidebar (Leaderboard) */}
        <div className="w-[350px] flex flex-col gap-4 transition-all duration-300">
          {/* Leaderboard */}
          <div className="bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-brand-gold/20 bg-gradient-to-br from-brand-gold/10 to-transparent">
              <h3 className="text-xl font-bold text-brand-gold mb-4">لوحة المتصدرين</h3>
              
              <div className="flex flex-col gap-2">
                {players.sort((a, b) => b.score - a.score).map((player, i) => (
                  <div key={player.username} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold font-bold">
                        {i + 1}
                      </div>
                      <span className="text-white font-bold">{player.username}</span>
                    </div>
                    <div className="text-brand-gold font-bold text-xl">
                      {player.score}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}