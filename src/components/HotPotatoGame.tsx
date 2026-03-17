import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Users, Play, Trophy, ArrowRight, RotateCcw, MessageSquare, MessageSquareOff, Bomb } from "lucide-react";
import { TwitchChat } from './TwitchChat';
import { hotPotatoQuestions, Question } from '../data/hot-potato-questions';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface HotPotatoGameProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

type GamePhase = 'config' | 'joining' | 'playing' | 'winner';

interface Player {
  username: string;
  isAlive: boolean;
  joinedAt: number;
}

export function HotPotatoGame({ messages, onLeave, channelName, isConnected, error }: HotPotatoGameProps) {
  const [phase, setPhase] = useState<GamePhase>('joining');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showChat, setShowChat] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  const [usedQuestions, setUsedQuestions] = useState<Set<number>>(new Set());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (phase !== 'joining') return;

    const newPlayers = [...players];
    let hasNew = false;

    messages.forEach(msg => {
      if (processedMessagesRef.current.has(msg.id)) return;
      
      const text = msg.message.toLowerCase().trim();
      if (text === '!join' || text === '!مشاركة') {
        if (!newPlayers.find(p => p.username === msg.username)) {
          newPlayers.push({
            username: msg.username,
            isAlive: true,
            joinedAt: Date.now()
          });
          hasNew = true;
          processedMessagesRef.current.add(msg.id);
        }
      }
    });

    if (hasNew) {
      setPlayers(newPlayers);
    }
  }, [messages, phase]);

  useEffect(() => {
    if (phase !== 'playing' || !currentPlayer || !currentQuestion) return;

    let answeredCorrectly = false;

    messages.forEach(msg => {
      if (processedMessagesRef.current.has(msg.id)) return;

      if (msg.username === currentPlayer.username) {
        const text = msg.message.toLowerCase().trim();
        const isCorrect = currentQuestion.a.some(ans => text === ans.toLowerCase() || text.includes(ans.toLowerCase()));
        
        if (isCorrect) {
          answeredCorrectly = true;
          processedMessagesRef.current.add(msg.id);
        }
      }
    });

    if (answeredCorrectly) {
      passBomb();
    }
  }, [messages, phase, currentPlayer, currentQuestion]);

  const startGame = () => {
    if (players.length < 2) return;
    setPhase('playing');
    setUsedQuestions(new Set());
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const firstPlayer = players[randomIndex];
    setCurrentPlayer(firstPlayer);
    
    pickNewQuestion(new Set());
    setTimeLeft(20);
    startTimer();
  };

  const pickNewQuestion = (used: Set<number>) => {
    let available = hotPotatoQuestions.map((_, i) => i).filter(i => !used.has(i));
    if (available.length === 0) {
      used.clear();
      available = hotPotatoQuestions.map((_, i) => i);
    }
    const rIdx = available[Math.floor(Math.random() * available.length)];
    setCurrentQuestion(hotPotatoQuestions[rIdx]);
    used.add(rIdx);
    setUsedQuestions(used);
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleExplosion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const passBomb = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const alivePlayers = players.filter(p => p.isAlive);
    if (alivePlayers.length <= 1) return;

    const others = alivePlayers.filter(p => p.username !== currentPlayer?.username);
    const nextPlayer = others[Math.floor(Math.random() * others.length)];
    
    setCurrentPlayer(nextPlayer);
    pickNewQuestion(usedQuestions);
    setTimeLeft(20);
    startTimer();
  };

  const handleExplosion = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setPlayers(prev => {
      const updated = prev.map(p => 
        p.username === currentPlayer?.username ? { ...p, isAlive: false } : p
      );
      
      const alive = updated.filter(p => p.isAlive);
      if (alive.length === 1) {
        setWinner(alive[0]);
        setPhase('winner');
      } else if (alive.length > 1) {
        setTimeout(() => {
          const nextPlayer = alive[Math.floor(Math.random() * alive.length)];
          setCurrentPlayer(nextPlayer);
          pickNewQuestion(usedQuestions);
          setTimeLeft(20);
          startTimer();
        }, 3000);
      } else {
        setPhase('winner');
      }
      
      return updated;
    });
    
    setCurrentPlayer(null);
    setCurrentQuestion(null);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPlayers([]);
    setCurrentPlayer(null);
    setCurrentQuestion(null);
    setWinner(null);
    setPhase('joining');
    setTimeLeft(20);
    processedMessagesRef.current.clear();
  };

  const activeCount = players.filter(p => p.isAlive).length;

  return (
    <div className="flex gap-8 h-full bg-transparent w-full max-w-[1600px] mx-auto p-6 font-arabic" dir="rtl">
      <div className="flex-1 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 p-8 flex flex-col relative overflow-hidden shadow-2xl">
        <button onClick={() => setShowChat(!showChat)} className="absolute bottom-6 left-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-[90] bg-brand-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40 shadow-xl">
          {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
          {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none" />
        
        <button
          onClick={onLeave}
          className="absolute top-6 right-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-50 bg-brand-cyan/5 px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40"
        >
          <ArrowRight className="w-5 h-5" /> العودة للردهة
        </button>

        <div className="h-full w-full pt-12 flex flex-col relative z-10 items-center justify-center">
          
          {phase === 'joining' && (
            <div className="text-center w-full max-w-2xl bg-zinc-900/80 border border-brand-cyan/30 rounded-3xl p-12 backdrop-blur-md">
              <Bomb className="w-24 h-24 text-brand-pink mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,42,128,0.6)] animate-pulse" />
              <h2 className="text-5xl font-black text-white mb-4">البطاطا الساخنة</h2>
              
              <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-4 mb-6 text-right">
                <h4 className="font-bold text-brand-cyan mb-2 text-lg">طريقة اللعب:</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  عندما يتم اختيارك وتكون القنبلة بيدك، سيظهر سؤال على الشاشة. أجب عليه بشكل صحيح في الشات بأسرع وقت لتمرير القنبلة إلى لاعب آخر. إذا انتهى الوقت (٢٠ ثانية) والقنبلة بيدك، ستنفجر وتخرج من اللعبة! آخر من ينجو هو الفائز.
                </p>
              </div>

              <p className="text-brand-cyan/80 text-xl mb-8">اكتب <span className="font-bold text-brand-pink">!join</span> أو <span className="font-bold text-brand-pink">!مشاركة</span> في الشات للمشاركة!</p>
              
              <div className="bg-brand-black/50 p-6 rounded-2xl border border-brand-cyan/20 mb-8 min-h-[150px] max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-cyan" /> اللاعبون
                  </h3>
                  <span className="bg-brand-pink/20 text-brand-pink px-3 py-1 rounded-full text-sm font-bold border border-brand-pink/30">
                    {players.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p) => (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      key={p.username}
                      className="bg-brand-cyan/10 border border-brand-cyan/30 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      {p.username}
                    </motion.div>
                  ))}
                  {players.length === 0 && (
                    <p className="text-zinc-500 w-full text-center py-4">في انتظار انضمام اللاعبين...</p>
                  )}
                </div>
              </div>

              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="w-full bg-brand-cyan hover:bg-brand-pink disabled:bg-zinc-800 disabled:text-zinc-500 text-brand-black font-black py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(0,229,255,0.3)] text-xl flex items-center justify-center gap-3 disabled:shadow-none"
              >
                <Play className="w-6 h-6" /> بدء اللعبة
              </button>
            </div>
          )}

          {phase === 'playing' && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="flex justify-between w-full max-w-4xl px-8 mb-8">
                <div className="bg-brand-black/60 border border-brand-cyan/30 px-6 py-3 rounded-2xl">
                  <span className="text-brand-cyan/70 text-sm block mb-1">اللاعبون المتبقون</span>
                  <span className="text-3xl font-black text-white">{activeCount}</span>
                </div>
                <motion.div 
                  animate={{ 
                    scale: timeLeft <= 5 ? [1, 1.2, 1] : 1,
                    color: timeLeft <= 5 ? ['#ef4444', '#ff2a80', '#ef4444'] : '#00e5ff'
                  }}
                  transition={{ repeat: Infinity, duration: timeLeft <= 5 ? 0.5 : 1 }}
                  className="bg-brand-black/60 border border-brand-cyan/30 px-8 py-3 rounded-2xl text-center min-w-[200px]"
                >
                  <span className="text-zinc-400 text-sm block mb-1">الوقت المتبقي</span>
                  <span className="text-4xl font-mono font-black" dir="ltr">{timeLeft}s</span>
                </motion.div>
              </div>

              {currentPlayer && currentQuestion ? (
                <div className="text-center w-full max-w-4xl bg-gradient-to-b from-zinc-900/90 to-brand-black/90 border-2 border-brand-pink/50 rounded-3xl p-12 shadow-[0_0_50px_rgba(255,42,128,0.2)] flex flex-col items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-pink/10 via-transparent to-transparent opacity-50 pulse-slow" />
                  
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: timeLeft / 20 }}
                    className="mb-8 relative z-10"
                  >
                    <Bomb className="w-32 h-32 text-brand-pink drop-shadow-[0_0_30px_rgba(255,42,128,0.8)]" />
                  </motion.div>

                  <h3 className="text-2xl text-zinc-300 mb-2 z-10">القنبلة الآن بيد:</h3>
                  <div className="text-5xl font-black text-brand-cyan mb-12 z-10 bg-brand-cyan/10 px-8 py-4 rounded-2xl border border-brand-cyan/30">
                    {currentPlayer.username}
                  </div>

                  <div className="bg-brand-black/80 border border-brand-pink/20 p-8 rounded-2xl w-full z-10">
                    <p className="text-brand-pink/70 text-sm mb-4 font-bold">أجب لتمرير القنبلة!</p>
                    <h2 className="text-4xl font-bold text-white leading-relaxed">{currentQuestion.q}</h2>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5 }}
                  >
                    <Flame className="w-48 h-48 text-red-500 mx-auto mb-6" />
                    <h1 className="text-6xl font-black text-red-500">بوووووم!</h1>
                  </motion.div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3 justify-center w-full max-w-4xl max-h-[150px] overflow-y-auto">
                {players.map(p => {
                  let cls = '';
                  if (p.username === currentPlayer?.username) {
                    cls = 'bg-brand-pink text-white border-2 border-white shadow-[0_0_15px_rgba(255,42,128,0.5)] scale-110';
                  } else if (p.isAlive) {
                    cls = 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30';
                  } else {
                    cls = 'bg-red-900/20 text-red-500/50 border border-red-900/30 line-through';
                  }

                  return (
                    <div 
                      key={p.username} 
                      className={"px-4 py-2 rounded-xl text-sm font-bold transition-all " + cls}
                    >
                      {p.username} {p.username === currentPlayer?.username ? '💣' : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'winner' && winner && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center w-full max-w-2xl bg-zinc-900/80 border border-brand-cyan/50 rounded-3xl p-12 backdrop-blur-md"
            >
              <Trophy className="w-32 h-32 text-brand-cyan mx-auto mb-8 drop-shadow-[0_0_30px_rgba(0,229,255,0.6)]" />
              <h2 className="text-4xl font-bold text-white mb-4">الناجي الأخير!</h2>
              <div className="text-6xl font-black text-brand-pink mb-12 drop-shadow-xl">
                {winner.username}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-brand-cyan hover:bg-brand-pink text-brand-black font-black py-4 rounded-xl transition-all text-xl"
                >
                  <RotateCcw className="w-6 h-6 inline-block ml-2" /> لعب مرة أخرى
                </button>
                <button
                  onClick={onLeave}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all border border-zinc-600"
                >
                  إنهاء
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {showChat && (
        <div className="w-[450px] shrink-0 flex flex-col gap-4 z-50">
          <div className="flex-1 min-h-0 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none" />
            <TwitchChat
              channelName={channelName}
              messages={messages}
              isConnected={isConnected}
              error={error}
            />
          </div>
        </div>
      )}
    </div>
  );
}
