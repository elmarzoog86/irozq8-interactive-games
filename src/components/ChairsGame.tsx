import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, Trophy, ArrowLeft, Settings, Armchair, Music } from 'lucide-react';
import { TwitchChat } from './TwitchChat';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface ChairsGameProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

interface Player {
  username: string;
  isAlive: boolean;
  chairId: string | null;
  color: string;
}

interface Chair {
  id: string;
  number: number;
  claimedBy: string | null;
}

const COLORS = [
  '#D4AF37', '#C5A028', '#B8860B', '#996515', '#8A660B',
  '#FFD700', '#DAA520', '#B8860B', '#CFB53B', '#E6BE8A'
];

const SONGS = [
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=empty-mind-118973.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b8175567.mp3?filename=chill-abstract-intention-110855.mp3'
];

export const ChairsGame: React.FC<ChairsGameProps> = ({ messages, onLeave, channelName, isConnected, error }) => {
  const [phase, setPhase] = useState<'config' | 'joining' | 'playing' | 'winner'>('config');
  const [roundState, setRoundState] = useState<'countdown' | 'music' | 'active' | 'round_end'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [roundNumber, setRoundNumber] = useState(1);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());

  const activePlayers = (Object.values(players) as Player[]).filter(p => p.isAlive);
  const allPlayersList = Object.values(players) as Player[];

  useEffect(() => {
    messages.forEach(msg => {
      if (!processedMessageIds.current.has(msg.id)) {
        processedMessageIds.current.add(msg.id);
        
        const text = msg.message.trim().toLowerCase();
        
        if (phase === 'joining' && text === '!join') {
          setPlayers(prev => {
            if (!prev[msg.username]) {
              const color = COLORS[Object.keys(prev).length % COLORS.length];
              return { 
                ...prev, 
                [msg.username]: { username: msg.username, isAlive: true, chairId: null, color } 
              };
            }
            return prev;
          });
        } else if (phase === 'playing' && roundState === 'active') {
          const num = parseInt(text);
          if (!isNaN(num)) {
            const player = players[msg.username];
            if (player && player.isAlive && !player.chairId) {
              const targetChair = chairs.find(c => c.number === num && !c.claimedBy);
              if (targetChair) {
                // Claim chair
                setChairs(prev => prev.map(c => c.id === targetChair.id ? { ...c, claimedBy: msg.username } : c));
                setPlayers(prev => ({
                  ...prev,
                  [msg.username]: { ...prev[msg.username], chairId: targetChair.id }
                }));
              }
            }
          }
        }
      }
    });
  }, [messages, phase, roundState, chairs, players]);

  // Check if round ended
  useEffect(() => {
    if (phase === 'playing' && roundState === 'active') {
      const unclaimedChairs = chairs.filter(c => !c.claimedBy);
      if (unclaimedChairs.length === 0 && chairs.length > 0) {
        setRoundState('round_end');
        
        // Find eliminated player
        const eliminated = activePlayers.find(p => !p.chairId);
        if (eliminated) {
          setEliminatedPlayer(eliminated.username);
          setPlayers(prev => ({
            ...prev,
            [eliminated.username]: { ...prev[eliminated.username], isAlive: false }
          }));
        }

        setTimeout(() => {
          startNextRound();
        }, 4000);
      }
    }
  }, [chairs, phase, roundState, activePlayers]);

  // Countdown timer
  useEffect(() => {
    if (phase === 'playing' && roundState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setRoundState('music');
      }
    }
  }, [countdown, phase, roundState]);

  // Music player
  useEffect(() => {
    if (phase === 'playing' && roundState === 'music') {
      const song = SONGS[Math.floor(Math.random() * SONGS.length)];
      if (audioRef.current) {
        audioRef.current.src = song;
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }

      // Random duration between 5s and 15s
      const duration = Math.floor(Math.random() * 10000) + 5000;
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setRoundState('active');
      }, duration);

      return () => {
        clearTimeout(timer);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      };
    }
  }, [phase, roundState]);

  const startGame = () => {
    setPhase('playing');
    setRoundNumber(1);
    startRound(activePlayers);
  };

  const startNextRound = () => {
    setPlayers(prev => {
      const alive = (Object.values(prev) as Player[]).filter(p => p.isAlive);
      if (alive.length <= 1) {
        setPhase('winner');
        return prev;
      }
      
      // Reset chairIds
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        next[k].chairId = null;
      });
      
      setRoundNumber(r => r + 1);
      startRound(alive as Player[]);
      return next;
    });
  };

  const startRound = (alivePlayers: Player[]) => {
    const numChairs = alivePlayers.length - 1;
    const newChairs: Chair[] = [];
    const usedNumbers = new Set<number>();
    
    for (let i = 0; i < numChairs; i++) {
      let num;
      do {
        num = Math.floor(Math.random() * 90) + 10; // 10-99
      } while (usedNumbers.has(num));
      usedNumbers.add(num);
      
      newChairs.push({
        id: `chair-${i}`,
        number: num,
        claimedBy: null
      });
    }
    
    setChairs(newChairs);
    setEliminatedPlayer(null);
    setRoundState('countdown');
    setCountdown(3);
  };

  const getPosition = (index: number, total: number, radius: number) => {
    if (total === 0) return { x: 50, y: 50 };
    if (total === 1) return { x: 50, y: 50 };
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  const renderPhase = () => {
    if (phase === 'config') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto font-arabic" dir="rtl">
          <div className="bg-black/40 backdrop-blur-md border border-brand-gold/20 p-8 rounded-2xl w-full text-center">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              <Armchair className="w-8 h-8 text-brand-gold" />
              لعبة الكراسي
            </h2>
            <p className="text-zinc-400 mb-8">
              لعبة الكراسي الموسيقية لدردشة تويتش! يكتب اللاعبون رقم الكرسي للجلوس. آخر لاعب يبقى واقفاً يتم إقصاؤه.
            </p>
            <button 
              onClick={() => setPhase('joining')}
              className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <Play className="w-5 h-5" /> فتح الردهة
            </button>
          </div>
        </div>
      );
    }

    if (phase === 'joining') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-arabic" dir="rtl">
          <h2 className="text-4xl font-bold text-white mb-4">بانتظار اللاعبين</h2>
          <p className="text-xl text-zinc-400 mb-8">
            اكتب <span className="text-brand-gold font-mono bg-brand-gold/10 px-3 py-1 rounded-lg border border-brand-gold/20">!join</span> في الدردشة للعب
          </p>
          
          <div className="bg-black/40 backdrop-blur-md border border-brand-gold/20 rounded-2xl p-6 w-full max-w-4xl mb-8 min-h-[300px] max-h-[500px] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-zinc-300">اللاعبون المنضمون</h3>
              <span className="bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-sm font-bold border border-brand-gold/30">
                المجموع {allPlayersList.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {allPlayersList.map((p) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={p.username} 
                    className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl flex items-center gap-2"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-zinc-200 font-bold">{p.username}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {allPlayersList.length === 0 && (
                <div className="w-full text-zinc-500 italic text-center py-12">لم ينضم أي لاعب بعد...</div>
              )}
            </div>
          </div>

          <button 
            onClick={startGame}
            disabled={allPlayersList.length < 2}
            className="bg-brand-gold hover:bg-brand-gold-light disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-bold py-4 px-12 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            بدء اللعبة <Play className="w-5 h-5" />
          </button>
        </div>
      );
    }

    if (phase === 'playing') {
      // Create a stable array of alive players for positioning
      const alivePlayers = allPlayersList.filter(p => p.isAlive || (roundState === 'round_end' && p.username === eliminatedPlayer));

      return (
        <div className="flex flex-col items-center justify-center h-full w-full font-arabic" dir="rtl">
          <div className="relative w-full max-w-2xl aspect-square mx-auto bg-black/80 rounded-full border-8 border-brand-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.2)] overflow-hidden flex items-center justify-center">
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#d4af37 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            {/* Center text */}
            <div className="absolute top-12 text-3xl font-bold text-brand-gold/50">جولة {roundNumber}</div>
            
            {/* Music Indicator */}
            <AnimatePresence>
              {roundState === 'music' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 flex flex-col items-center justify-center z-10"
                >
                  <Music className="w-20 h-20 text-brand-gold animate-bounce" />
                  <div className="text-brand-gold/80 font-bold mt-4 text-xl animate-pulse">الموسيقى تعمل...</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chairs */}
            {(roundState === 'active' || roundState === 'round_end') && chairs.map((chair, i) => {
              const pos = getPosition(i, chairs.length, 15);
              return (
                <div 
                  key={chair.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <Armchair className={`w-10 h-10 ${chair.claimedBy ? 'text-zinc-600' : 'text-brand-gold'}`} />
                  {roundState === 'active' && !chair.claimedBy && (
                    <div className="bg-black/80 text-brand-gold font-bold px-2 py-1 rounded text-sm mt-1 absolute -bottom-6 border border-brand-gold/30">
                      {chair.number}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Players */}
            {alivePlayers.map((player, i) => {
              let pos = getPosition(i, alivePlayers.length, 38);
              
              // If player has a chair, move them to the chair
              if (player.chairId) {
                const chairIndex = chairs.findIndex(c => c.id === player.chairId);
                if (chairIndex !== -1) {
                  pos = getPosition(chairIndex, chairs.length, 15);
                }
              }

              return (
                <motion.div
                  key={player.username}
                  animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded mt-1 max-w-[100px] truncate">
                    {player.username}
                  </div>
                </motion.div>
              );
            })}

            {/* Overlays */}
            <AnimatePresence>
              {roundState === 'countdown' && (
                <motion.div 
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute text-9xl font-black text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] z-30"
                >
                  {countdown > 0 ? countdown : 'GO!'}
                </motion.div>
              )}
              
              {roundState === 'round_end' && eliminatedPlayer && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute bg-red-600/90 text-white px-8 py-4 rounded-2xl font-bold text-2xl backdrop-blur-sm z-30 shadow-2xl"
                  dir="rtl"
                >
                  {eliminatedPlayer} تم إقصاؤه!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-12 text-2xl font-bold text-brand-gold/80" dir="rtl">
              اكتب رقم اقرب كرسي
            </div>
          </div>
        </div>
      );
    }

    if (phase === 'winner') {
      const winner = activePlayers[0];
      return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto text-center font-arabic" dir="rtl">
          <Trophy className="w-24 h-24 text-brand-gold mb-8 glow-gold" />
          <h2 className="text-6xl font-black text-white mb-4 tracking-tight">مبروك! {winner?.username} فاز!</h2>
          
          {winner && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-black/60 border border-brand-gold/30 p-12 rounded-3xl mb-12 shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center text-black font-bold text-5xl mx-auto mb-6 border-4 border-brand-gold"
                style={{ backgroundColor: winner.color }}
              >
                {winner.username.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-4xl font-bold text-brand-gold mb-2">{winner.username}</h3>
              <p className="text-xl text-zinc-400">الصامد الأخير!</p>
            </motion.div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setPhase('config');
                setPlayers({});
              }}
              className="bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg border border-white/10"
            >
              اللعب مرة أخرى
            </button>
            <button 
              onClick={onLeave}
              className="bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-4 px-8 rounded-xl transition-colors text-lg shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              العودة للألعاب
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex gap-8 h-[85vh] w-full max-w-[1600px] mx-auto">
      <audio ref={audioRef} />
      {/* Main Game Area */}
      <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 p-8 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] font-arabic" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent" />
        <button 
          onClick={onLeave} 
          className="absolute top-6 right-6 text-brand-gold/70 hover:text-brand-gold flex items-center gap-2 transition-colors z-50 bg-brand-gold/5 px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40"
        >
          <ArrowLeft className="w-5 h-5 rotate-180" /> العودة للردهة
        </button>
        
        <div className="h-full w-full flex flex-col relative z-10">
          {renderPhase()}
        </div>
      </div>

        {/* Twitch Chat Sidebar */}
      <div className="w-[500px] flex flex-col gap-4">
          <div className="flex-1 min-h-0 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
          <TwitchChat 
            channelName={channelName} 
            messages={messages} 
            isConnected={isConnected} 
            error={error} 
          />
        </div>
      </div>
    </div>
  );
};
