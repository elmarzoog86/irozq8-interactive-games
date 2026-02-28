import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Play, ShieldAlert, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

interface RouletteGameProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

interface Player {
  username: string;
  color: string;
  status: 'alive' | 'eliminated';
}

export const RouletteGame: React.FC<RouletteGameProps> = ({ messages, onLeave, channelName, isConnected, error }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'spinning' | 'action' | 'finished'>('lobby');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Auto-join from chat
  useEffect(() => {
    if (gameState !== 'lobby') return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    const text = latestMessage.message.trim().toLowerCase();
    if (text === '!join' || text === '!انضمام') {
      setPlayers(prev => {
        if (prev.some(p => p.username === latestMessage.username)) return prev;
        return [...prev, { username: latestMessage.username, color: latestMessage.color || '#D4AF37', status: 'alive' }];
      });
    }
  }, [messages, gameState]);

  const startGame = () => {
    if (players.length < 2) return;
    spinWheel();
  };

  const spinWheel = () => {
    setGameState('spinning');
    setSelectedPlayer(null);
    
    const alivePlayers = players.filter(p => p.status === 'alive');
    if (alivePlayers.length <= 1) {
      setWinner(alivePlayers[0] || null);
      setGameState('finished');
      return;
    }

    // Simulate spin delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * alivePlayers.length);
      setSelectedPlayer(alivePlayers[randomIndex]);
      setGameState('action');
    }, 3000);
  };

  const eliminatePlayer = (username: string) => {
    setPlayers(prev => prev.map(p => p.username === username ? { ...p, status: 'eliminated' } : p));
    
    // Check if game is over after elimination
    setTimeout(() => {
      const remaining = players.filter(p => p.username !== username && p.status === 'alive');
      if (remaining.length <= 1) {
        setWinner(remaining[0] || null);
        setGameState('finished');
      } else {
        spinWheel(); // Next round
      }
    }, 2000);
  };

  const resetGame = () => {
    setPlayers([]);
    setGameState('lobby');
    setSelectedPlayer(null);
    setWinner(null);
  };

  return (
    <div className="flex flex-col h-full bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent z-0 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Skull className="w-8 h-8 text-brand-gold" />
            روليت البقاء
          </h2>
          <p className="text-brand-gold/50 mt-1">
            {gameState === 'lobby' ? 'اكتب !join أو !انضمام في الدردشة للمشاركة' : 'البقاء للأقوى!'}
          </p>
        </div>
        <button 
          onClick={onLeave}
          className="text-brand-gold/70 hover:text-brand-gold transition-colors text-sm flex items-center gap-2 bg-brand-gold/5 hover:bg-brand-gold/10 px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للردهة
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        {gameState === 'lobby' && (
          <div className="flex flex-col items-center max-w-2xl w-full">
            <div className="bg-black/40 border border-brand-gold/20 rounded-2xl p-8 w-full text-center mb-8">
              <Users className="w-16 h-16 text-brand-gold/50 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">في انتظار اللاعبين...</h3>
              <p className="text-brand-gold/70 mb-6">اللاعبون المنضمون: <span className="text-brand-gold font-bold text-xl">{players.length}</span></p>
              
              <div className="flex flex-wrap gap-2 justify-center max-h-48 overflow-y-auto p-4 bg-black/60 rounded-xl border border-brand-gold/10">
                {players.length === 0 ? (
                  <span className="text-zinc-500 text-sm">لا يوجد لاعبين بعد</span>
                ) : (
                  players.map(p => (
                    <span key={p.username} className="px-3 py-1 rounded-full text-sm font-bold bg-black/40 border border-brand-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]" style={{ color: p.color }}>
                      {p.username}
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={players.length < 2}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                players.length >= 2 
                  ? 'bg-brand-gold hover:bg-brand-gold-light text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-6 h-6" />
              بدء اللعبة
            </button>
          </div>
        )}

        {gameState === 'spinning' && (
          <div className="flex flex-col items-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border-4 border-t-brand-gold border-r-black border-b-brand-gold border-l-black mb-8"
            />
            <h3 className="text-3xl font-bold text-white animate-pulse">جاري اختيار الضحية...</h3>
          </div>
        )}

        {gameState === 'action' && selectedPlayer && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center bg-black/60 border border-brand-gold/20 rounded-3xl p-12 text-center max-w-lg w-full shadow-[0_0_50px_rgba(212,175,55,0.1)]"
          >
            <ShieldAlert className="w-20 h-20 text-brand-gold mb-6" />
            <h3 className="text-2xl text-zinc-300 mb-2">تم اختيار:</h3>
            <h2 className="text-5xl font-black mb-8" style={{ color: selectedPlayer.color }}>
              {selectedPlayer.username}
            </h2>
            
            <p className="text-brand-gold/80 mb-8">لقد وقع عليك الاختيار! سيتم إقصاؤك من اللعبة.</p>

            <button
              onClick={() => eliminatePlayer(selectedPlayer.username)}
              className="bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            >
              تأكيد الإقصاء
            </button>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 bg-brand-gold/20 rounded-full flex items-center justify-center mb-6 border-4 border-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.5)]">
              <span className="text-6xl">👑</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">الناجي الأخير!</h2>
            {winner ? (
              <h3 className="text-5xl font-black mb-8" style={{ color: winner.color }}>
                {winner.username}
              </h3>
            ) : (
              <h3 className="text-3xl font-bold text-zinc-400 mb-8">لا يوجد فائز</h3>
            )}
            
            <button
              onClick={resetGame}
              className="bg-brand-gold hover:bg-brand-gold-light text-black font-bold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              لعب مرة أخرى
            </button>
          </motion.div>
        )}

      </div>
      
      {/* Sidebar: Alive Players */}
      {gameState !== 'lobby' && (
        <div className="absolute left-8 top-8 bottom-8 w-64 bg-black/60 backdrop-blur-xl border border-brand-gold/20 rounded-3xl p-6 overflow-y-auto shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20">
          <h4 className="text-lg font-bold text-white mb-4 border-b border-brand-gold/10 pb-2">اللاعبون ({players.filter(p => p.status === 'alive').length})</h4>
          <div className="space-y-2">
            {players.map(p => (
              <div 
                key={p.username} 
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  p.status === 'alive' 
                    ? 'bg-black/40 border-brand-gold/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]' 
                    : 'bg-red-900/10 border-red-900/30 opacity-40 line-through'
                }`}
              >
                <span className="font-bold truncate" style={{ color: p.status === 'alive' ? p.color : '#ef4444' }}>
                  {p.username}
                </span>
                {p.status === 'eliminated' && <Skull className="w-4 h-4 text-red-500/50" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
