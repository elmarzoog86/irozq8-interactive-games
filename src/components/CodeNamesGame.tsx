import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, MessageSquare, XCircle, Search, Key, Shield, Eye, EyeOff, Info, Users, Copy } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { TwitchChat } from './TwitchChat';

interface Player {
  id: string;
  name: string;
  team: 'gold' | 'black' | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'playing' | 'results';
  data: {
    board: { word: string; type: 'gold' | 'black' | 'neutral' | 'assassin'; revealed: boolean; votes?: string[] }[];
    currentTurn: 'gold' | 'black';
    scores: { gold: number; black: number };
    winner?: 'gold' | 'black';
    spymasters?: { gold: string | null; black: string | null };
    currentHint?: { word: string; count: number } | null;
  };
}

export const CodeNamesGame: React.FC<{ 
  onLeave: () => void; 
  messages: any[];
  channelName: string;
  isConnected: boolean;
  error: string | null;
}> = ({ onLeave, messages, channelName, isConnected, error }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [roomId] = useState(() => Math.random().toString(36).substring(7));
  const [isSpymaster, setIsSpymaster] = useState(true);  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit('join_team_game', { roomId, name: 'Streamer', gameType: 'codenames' });
    newSocket.on('team_game_state', (newState: GameState) => setState(newState));
    return () => { newSocket.disconnect(); };
  }, [roomId]);

  const switchTeam = (playerId: string, team: 'gold' | 'black' | null) => {
    socket?.emit('switch_team', { roomId, playerId, team });
  };

  const setSpymaster = (playerId: string, team: 'gold' | 'black') => {
    socket?.emit('submit_team_action', { roomId, action: 'set_spymaster', payload: { playerId, team } });
  };

  const startGame = () => socket?.emit('start_team_game', roomId);

  const resetGame = () => socket?.emit('reset_team_game', roomId);

  const revealCard = (index: number) => {
    socket?.emit('submit_team_action', { roomId, action: 'reveal', payload: { index } });
  };

  if (!state) return <div className="flex items-center justify-center h-full text-white">جاري الاتصال...</div>;

  return (
    <div className="flex h-full w-full gap-6 p-6 font-arabic" dir="rtl">
      {/* Main Game Area */}
      <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 relative p-8 overflow-y-auto z-10 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic tracking-tighter text-brand-gold uppercase glow-gold-text">لعبة الشفرة</h1>
              <p className="text-brand-gold/60">ابحث عن الكلمات السرية لفريقك</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-black/40 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold/50 flex items-center gap-2">
                <span>{window.location.origin}/team/{roomId}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/team/${roomId}`)}
                  className="p-1 hover:text-brand-gold hover:bg-brand-gold/10 rounded transition-all"
                  title="نسخ الرابط"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button onClick={resetGame} className="bg-black/40 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold hover:bg-brand-gold/10 transition-all">
                إعادة تعيين
              </button>
              <button onClick={onLeave} className="bg-black/40 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold/70 hover:text-brand-gold transition-all flex items-center gap-2">
                <XCircle className="w-4 h-4" /> خروج
              </button>
            </div>
          </div>

          {/* Join Instructions Banner */}
          {state.status === 'waiting' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-brand-gold/10 border border-brand-gold/30 p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-gold p-2 rounded-xl">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">انضم الآن للعب!</h3>
                  <p className="text-brand-gold/70 text-sm">استخدم الرابط أعلاه للانضمام</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="min-h-[calc(100%-120px)] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {state.status === 'waiting' && (
              <motion.div key="waiting" className="grid grid-cols-2 gap-12 w-full max-w-6xl">
                <div className="bg-black/40 border border-brand-gold/20 p-8 rounded-[40px] text-center shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  <Shield className="w-16 h-16 text-brand-gold mx-auto mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                  <h2 className="text-3xl font-black text-brand-gold mb-6">الفريق الذهبي</h2>
                  <div className="space-y-2 min-h-[200px]">
                    {state.players.filter(p => p.team === 'gold').map(p => (
                      <div key={p.id} className={`bg-brand-gold/10 p-3 rounded-xl flex justify-between items-center border ${state.data?.spymasters?.gold === p.id ? 'border-brand-gold border-2' : 'border-brand-gold/20'}`}>
                        <div className="flex items-center gap-2">
                          {state.data?.spymasters?.gold === p.id && <Eye className="w-4 h-4 text-brand-gold" />}
                          <span className="font-bold">{p.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSpymaster(p.id, 'gold')} className="text-[10px] bg-brand-gold/20 hover:bg-brand-gold/40 px-2 py-1 rounded border border-brand-gold/30 transition-colors">Spymaster</button>
                          <button onClick={() => switchTeam(p.id, 'black')} className="text-[10px] bg-black/40 hover:bg-black/60 px-2 py-1 rounded border border-brand-gold/30 transition-colors">الأسود</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 border border-brand-gold/10 p-8 rounded-[40px] text-center opacity-80">
                  <Shield className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-white mb-6">الفريق الأسود</h2>
                  <div className="space-y-2 min-h-[200px]">
                    {state.players.filter(p => p.team === 'black').map(p => (
                      <div key={p.id} className={`bg-black/40 p-3 rounded-xl flex justify-between items-center border ${state.data?.spymasters?.black === p.id ? 'border-white border-2' : 'border-zinc-700'}`}>
                        <div className="flex items-center gap-2">
                          {state.data?.spymasters?.black === p.id && <Eye className="w-4 h-4 text-white" />}
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSpymaster(p.id, 'black')} className="text-[10px] bg-white/20 hover:bg-white/40 px-2 py-1 rounded border border-white/30 transition-colors">Spymaster</button>
                          <button onClick={() => switchTeam(p.id, 'gold')} className="text-[10px] bg-brand-gold/10 hover:bg-brand-gold/20 px-2 py-1 rounded border border-brand-gold/20 transition-colors">الذهبي</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 flex flex-col items-center gap-6">
                  <button onClick={startGame} className="bg-brand-gold hover:bg-brand-gold-light text-black font-black px-16 py-5 rounded-2xl text-2xl transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    ابدأ اللعبة
                  </button>
                </div>
              </motion.div>
            )}

            {state.status === 'playing' && (
              <motion.div key="playing" className="w-full max-w-6xl space-y-6">
                {state.data.currentHint && (
                  <div className="bg-brand-gold/10 border-2 border-brand-gold p-6 rounded-3xl text-center max-w-2xl mx-auto shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <h3 className="text-xl text-brand-gold/80 mb-2">تلميح Spymaster الحالي</h3>
                    <div className="text-5xl font-black text-brand-gold flex items-center justify-center gap-4">
                      <span>{state.data.currentHint.word}</span>
                      <span className="text-brand-gold/50">-</span>
                      <span>{state.data.currentHint.count}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className={`p-4 rounded-2xl border-2 ${state.data.currentTurn === 'gold' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gold/10'}`}>
                    <span className="text-xl font-bold text-brand-gold">الذهبي: {state.data.scores.gold}</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-black italic text-white">دور الفريق {state.data.currentTurn === 'gold' ? 'الذهبي' : 'الأسود'}</h2>
                  </div>
                  <div className={`p-4 rounded-2xl border-2 ${state.data.currentTurn === 'black' ? 'border-zinc-400 bg-zinc-800/50' : 'border-zinc-800'}`}>
                    <span className="text-xl font-bold text-white">الأسود: {state.data.scores.black}</span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 h-full pb-8">
                  {state.data.board.map((card, i) => {
                    let bgColor = 'bg-black/60';
                    let textColor = 'text-brand-gold/40';
                    let borderColor = 'border-brand-gold/10';

                      if (card.revealed) {
                        if (card.type === 'gold') { bgColor = 'bg-brand-gold'; textColor = 'text-black'; borderColor = 'border-brand-gold-light'; }
                        else if (card.type === 'black') { bgColor = 'bg-zinc-800'; textColor = 'text-white'; borderColor = 'border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]'; }
                        else if (card.type === 'assassin') { bgColor = 'bg-zinc-950'; textColor = 'text-red-500'; borderColor = 'border-red-900'; }
                        else { bgColor = 'bg-black/80'; textColor = 'text-zinc-500'; borderColor = 'border-zinc-800'; }
                      }                    return (
                      <button
                        key={i}
                        disabled={true}
                        className={`relative min-h-[140px] rounded-3xl border-b-[6px] transition-all flex items-center justify-center p-4 text-center font-black text-3xl md:text-4xl ${bgColor} ${textColor} ${borderColor} ${card.revealed ? 'opacity-50 scale-95' : 'shadow-[0_0_20px_rgba(212,175,55,0.1)]'}`}
                      >
                        {card.word}
                        {!card.revealed && card.votes?.length > 0 && (
                          <div className="absolute -top-3 -right-3 bg-brand-gold text-black rounded-full min-w-[32px] h-8 px-2 flex items-center justify-center text-lg font-black shadow-[0_0_15px_rgba(212,175,55,0.5)] border-2 border-yellow-200 z-10 animate-bounce">
                            {card.votes.length}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {state.status === 'results' && (
              <motion.div
                key="results"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center space-y-8 w-full"
              >
                <Trophy className="w-32 h-32 text-brand-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
                <h2 className="text-6xl font-black italic text-brand-gold glow-gold-text">
                  فاز الفريق {state.data.winner === 'gold' ? 'الذهبي' : 'الأسود'}!
                </h2>
                <button
                  onClick={resetGame}
                  className="mt-8 bg-brand-gold hover:bg-brand-gold-light text-black font-black px-12 py-4 rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  لعبة جديدة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Twitch Chat Sidebar */}
      <div className="w-[500px] h-full flex-shrink-0 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
        <TwitchChat 
          channelName={channelName}
          messages={messages}
          isConnected={isConnected}
          error={error}
        />
      </div>
    </div>
  );
};
