import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Timer, MessageSquare, XCircle, Search, Key, Shield, Eye, EyeOff, Info, Users, Copy, MessageSquareOff } from 'lucide-react';
import { socket } from '../socket';
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
    history?: {
      type: 'hint' | 'reveal';
      team: 'gold' | 'black';
      word?: string;
      count?: number;
      cardWord?: string;
      cardType?: string;
      playerName?: string;
      timestamp: number;
    }[];
  };
}

export const CodeNamesGame: React.FC<{ 
  onLeave: () => void; 
  messages: any[];
  channelName: string;
  isConnected: boolean;
  error: string | null;
}> = ({ onLeave, messages, channelName, isConnected, error }) => {
  const [state, setState] = useState<GameState | null>(null);
  const [roomId] = useState(() => Math.random().toString(36).substring(7));
  const [isSpymaster, setIsSpymaster] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    socket.emit('join_team_game', { roomId, name: 'Streamer', gameType: 'codenames' });
    
    const handleGameState = (newState: GameState) => setState(newState);
    socket.on('team_game_state', handleGameState);
    
    return () => { 
      socket.off('team_game_state', handleGameState);
    };
  }, [roomId]);

  const switchTeam = (playerId: string, team: 'gold' | 'black' | null) => {
    socket.emit('switch_team', { roomId, playerId, team });
  };

  const setSpymaster = (playerName: string, team: 'gold' | 'black') => {
    socket.emit('submit_team_action', { roomId, action: 'set_spymaster', payload: { playerName, team } });
  };

  const startGame = () => socket.emit('start_team_game', roomId);

  const resetGame = () => socket.emit('reset_team_game', roomId);

  const revealCard = (index: number) => {
    socket.emit('submit_team_action', { roomId, action: 'reveal', payload: { index } });
  };

  if (!state) return <div className="flex items-center justify-center h-full text-white">جاري الاتصال...</div>;

  return (
    <div className="flex h-full w-full gap-6 p-6 min-h-0 font-arabic" dir="rtl">
      {/* Main Game Area */}
      <div className="flex-1 bg-black/80  rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col relative text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 relative p-4 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-10 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-black italic tracking-tighter text-brand-gold uppercase glow-gold-text">لعبة الشفرة</h1>
              <p className="text-brand-gold/60">ابحث عن الكلمات السرية لفريقك</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-black/70 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold/50 flex items-center gap-2">
                <span>{window.location.origin}/team/{roomId}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/team/${roomId}`)}
                  className="p-1 hover:text-brand-gold hover:bg-brand-gold/10 rounded transition-all"
                  title="نسخ الرابط"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <button onClick={resetGame} className="bg-black/70 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold hover:bg-brand-gold/10 transition-all">
                إعادة تعيين
              </button>
              <button onClick={onLeave} className="bg-black/70 border border-brand-gold/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-gold/70 hover:text-brand-gold transition-all flex items-center gap-2">
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
                <div className="bg-black/70 border border-brand-gold/20 p-8 rounded-[40px] text-center shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  <Shield className="w-16 h-16 text-brand-gold mx-auto mb-4 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
                  <h2 className="text-3xl font-black text-brand-gold mb-6">الفريق الذهبي</h2>
                  <div className="space-y-2 min-h-[200px]">
                    {state.players.filter(p => p.team === 'gold').map(p => (
                      <div key={p.id} className={`bg-brand-gold/10 p-3 rounded-xl flex justify-between items-center border ${state.data?.spymasters?.gold === p.name ? 'border-brand-gold border-2' : 'border-brand-gold/20'}`}>
                        <div className="flex items-center gap-2">
                          {state.data?.spymasters?.gold === p.name && <Eye className="w-4 h-4 text-brand-gold" />}
                          <span className="font-bold">{p.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSpymaster(p.name, 'gold')} className="text-[10px] bg-brand-gold/20 hover:bg-brand-gold/40 px-2 py-1 rounded border border-brand-gold/30 transition-colors">Spymaster</button>
                          <button onClick={() => switchTeam(p.id, 'black')} className="text-[10px] bg-black/70 hover:bg-black/80 px-2 py-1 rounded border border-brand-gold/30 transition-colors">الأسود</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-black/70 border border-brand-gold/10 p-8 rounded-[40px] text-center opacity-80">
                  <Shield className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-black text-white mb-6">الفريق الأسود</h2>
                  <div className="space-y-2 min-h-[200px]">
                    {state.players.filter(p => p.team === 'black').map(p => (
                      <div key={p.id} className={`bg-black/70 p-3 rounded-xl flex justify-between items-center border ${state.data?.spymasters?.black === p.name ? 'border-white border-2' : 'border-zinc-700'}`}>
                        <div className="flex items-center gap-2">
                          {state.data?.spymasters?.black === p.name && <Eye className="w-4 h-4 text-white" />}
                          <span className="font-bold text-white">{p.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setSpymaster(p.name, 'black')} className="text-[10px] bg-white/20 hover:bg-white/40 px-2 py-1 rounded border border-white/30 transition-colors">Spymaster</button>
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
                <motion.div key="playing" className="w-full max-w-6xl flex flex-col h-full flex-1 min-h-0 space-y-4">
                  {state.data.currentHint && (
                  <div className="bg-brand-gold/10 border-2 border-brand-gold p-6 rounded-3xl text-center max-w-2xl mx-auto shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <h3 className="text-xl text-brand-gold/80 mb-2">تلميح Spymaster الحالي</h3>
                    <div className="text-5xl font-black text-brand-gold flex items-center justify-center gap-4 mb-4">
                      <span>{state.data.currentHint.word}</span>
                      <span className="text-brand-gold/50">-</span>
                      <span>{state.data.currentHint.count}</span>
                    </div>
                    {state.data.guessesLeft !== undefined && (
                      <div className="inline-block bg-black/50 border border-brand-gold/30 px-6 py-2 rounded-full">
                        <span className="text-white font-bold">الخيارات المتبقية: </span>
                        <span className="text-brand-gold font-black mx-1">{state.data.guessesLeft}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className={`p-4 rounded-2xl border-2 ${state.data.currentTurn === 'gold' ? 'border-brand-gold bg-brand-gold/10' : 'border-brand-gold/10'}`}>
                    <span className="text-xl font-bold text-brand-gold">الذهبي: {state.data.scores.gold}</span>
                  </div>

                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 font-bold transition-all ${showHistory ? 'bg-brand-gold text-black border-brand-gold' : 'bg-black/50 text-brand-gold border-brand-gold/30 hover:bg-brand-gold/10 hover:border-brand-gold'}`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>{showHistory ? 'إخفاء السجل' : 'سجل التلميحات'}</span>
                  </button>

                  <div className={`p-4 rounded-2xl border-2 ${state.data.currentTurn === 'black' ? 'border-zinc-400 bg-zinc-800/80' : 'border-zinc-800'}`}>
                    <span className="text-xl font-bold text-white">الأسود: {state.data.scores.black}</span>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {showHistory && state.data.history && state.data.history.length > 0 && (
                      <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                        className="fixed top-0 left-0 h-full w-80 max-w-sm bg-black/90 border-r-2 border-brand-gold/50 p-6 z-50 overflow-y-auto shadow-[20px_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 backdrop-blur-md"
                      >
                        <div className="flex justify-between items-center border-b border-brand-gold/30 pb-4">
                          <h3 className="text-xl font-bold text-brand-gold flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            سجل الحركات
                          </h3>
                          <button
                            onClick={() => setShowHistory(false)}
                            className="text-zinc-400 hover:text-white transition-colors"
                          >
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>
                        <div className="flex-1 space-y-3 mt-4">
                          {state.data.history.map((entry: any, idx: number) => (
                            <div key={idx} className={`p-4 rounded-xl flex flex-col gap-2 border ${entry.team === 'gold' ? 'bg-brand-gold/10 border-brand-gold/30 text-brand-gold' : 'bg-zinc-800/80 border-zinc-600 text-zinc-300'}`}>
                              <span className="text-xs opacity-50 font-mono self-end">
                                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {entry.type === 'hint' ? (
                                <div className="flex flex-col gap-1 text-sm text-center">
                                  <span className="opacity-70">{entry.playerName ? `القائد (${entry.playerName}) أعطى تلميح:` : 'القائد أعطى تلميح:'}</span>
                                  <span className="font-black text-2xl tracking-wide">«{entry.word}» ({entry.count})</span>
                                </div>
                              ) : entry.type === 'pass' ? (
                                <div className="flex flex-col gap-1 text-sm text-center">
                                  <span className="font-bold text-red-400">أنهى {entry.playerName || 'الفريق'} الدور</span>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1 text-sm text-center">
                                  <span className="opacity-70">{entry.playerName || 'لاعب'} اختار:</span>
                                  <span className={`font-bold px-3 py-1 rounded-lg text-lg ${
                                    entry.cardType === 'gold' ? 'bg-brand-gold text-black shadow-[0_0_10px_rgba(212,175,55,0.5)]' :
                                    entry.cardType === 'black' ? 'bg-zinc-900 border border-zinc-700 text-white' :
                                    entry.cardType === 'assassin' ? 'bg-red-800 text-red-100 shadow-[0_0_15px_rgba(153,27,27,0.5)]' :
                                    'bg-zinc-700 text-zinc-300'
                                  }`}>
                                    {entry.cardWord}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-5 grid-rows-5 gap-2 flex-1 min-h-0">
                    {state.data.board.map((card, i) => {
                    let bgColor = 'bg-black/80';
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
                          onClick={() => revealCard(i)}
                          className={`relative w-full h-full rounded-2xl border-b-[6px] transition-all flex items-center justify-center p-2 md:p-4 text-center font-black text-xl md:text-2xl 2xl:text-3xl ${bgColor} ${textColor} ${borderColor} ${card.revealed ? 'opacity-50 scale-95' : 'shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:scale-105 hover:bg-black/80'}`}
                        >
                        <span className="break-words px-2 leading-tight">{card.word}</span>
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

      {/* Teams Sidebar */}
      <div className="w-64 flex flex-col gap-4 shrink-0">
        <div className="flex-1 bg-black/80  rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col p-4">
           <h3 className="text-brand-gold font-bold mb-4 flex items-center gap-2">
             <Shield className="w-5 h-5" /> الفرق ({state.players.length})
           </h3>
           
           <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
             {/* Gold Team */}
             <div>
               <h4 className="text-brand-gold font-bold mb-2 flex items-center justify-between">
                 <span>الفريق الذهبي</span>
                 <span className="bg-brand-gold/20 px-2 rounded">{state.players.filter(p => p.team === 'gold').length}</span>
               </h4>
               <div className="space-y-1">
                 {state.players.filter(p => p.team === 'gold').map(p => (
                   <div key={p.id} className="text-sm bg-brand-gold/5 p-2 rounded text-zinc-300 flex items-center gap-2">
                     {state.data?.spymasters?.gold === p.name && <Eye className="w-3 h-3 text-brand-gold" />}
                     <span className="truncate">{p.name}</span>
                   </div>
                 ))}
               </div>
             </div>
             
             <div className="bg-black/70 border border-zinc-800 p-4 rounded-xl">
               <h4 className="text-white font-bold mb-2 flex items-center justify-between">
                 <span>الفريق الأسود</span>
                 <span className="bg-zinc-800 px-2 rounded">{state.players.filter(p => p.team === 'black').length}</span>
               </h4>
               <div className="space-y-1">
                 {state.players.filter(p => p.team === 'black').map(p => (
                   <div key={p.id} className="text-sm bg-zinc-900 p-2 rounded text-zinc-400 flex items-center gap-2">
                     {state.data?.spymasters?.black === p.name && <Eye className="w-3 h-3 text-white" />}
                     <span className="truncate">{p.name}</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>
      
      {/* Twitch Chat Sidebar */}
      
    </div>
  );
};

