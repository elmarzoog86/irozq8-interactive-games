import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, Timer, MessageSquare, XCircle, Shield, Swords, AlertCircle, CheckCircle2, Info, Crown, MessageSquareOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ChatSidebar } from './ChatSidebar';
import { TEAM_FEUD_QUESTIONS } from '../data/team-feud-questions';

interface Player {
  id: string;
  name: string;
  team: 'pink' | 'blue' | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'buzzer' | 'playing' | 'results';
  data: {
    question: string;
    answers: { text: string; points: number; revealed: boolean }[];
    strikes: { pink: number; blue: number };
    scores: { pink: number; blue: number };
    currentTurn: 'pink' | 'blue';
    roundPoints: number;
    isStealOpportunity: boolean;
    leaders: { pink: string | null; blue: string | null };
    buzzerTimer?: number;
    buzzerActive?: boolean;
  };
}

export const TeamFeudGame: React.FC<{ 
  onLeave: () => void; 
  messages: any[];
  channelName?: string;
  isConnected?: boolean;
  error?: string | null;
}> = ({ onLeave, messages, channelName, isConnected, error }) => {
  const [showChat, setShowChat] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [roomId] = useState(() => Math.random().toString(36).substring(7));
  const [guess, setGuess] = useState('');
  const processedMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;
    
    // Removed !gold and !black chat join feature for Family Feud
  }, [messages, socket, roomId]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.emit('join_team_game', { roomId, name: 'Streamer', gameType: 'teamfeud' });

    newSocket.on('team_game_state', (newState: GameState) => {
      setState(newState);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const switchTeam = (playerId: string, team: 'pink' | 'blue' | null) => {
    socket?.emit('switch_team', { roomId, playerId, team });
  };

  const setLeader = (playerId: string, team: 'pink' | 'blue') => {
    socket?.emit('submit_team_action', { roomId, action: 'set_leader', payload: { playerId, team } });
  };

  const startGame = () => {
    socket?.emit('start_team_game', roomId);
  };

  const resetGame = () => {
    socket?.emit('reset_team_game', roomId);
  };

  const submitGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (guess.trim()) {
      socket?.emit('submit_team_action', { roomId, action: 'guess', payload: { guess: guess.trim() } });
      setGuess('');
    }
  };

  if (!state) return <div className="flex items-center justify-center h-full text-white">جاري الاتصال...</div>;

  return (
    <div className="flex h-full w-full bg-brand-black/80  rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl font-arabic text-white" dir="rtl">

      <button onClick={() => setShowChat(!showChat)} className="absolute bottom-6 left-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-[90] bg-brand-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40 shadow-xl">
            {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
          </button>
  
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none" />
      {/* Main Game Area */}
      <div className="flex-1 relative p-8 overflow-y-auto z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-brand-pink uppercase glow-cyan-text">تحدي الفرق</h1>
            <p className="text-brand-cyan/60">لعبة تخمين الإجابات الأكثر شيوعاً</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-brand-black/70 border border-brand-cyan/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-cyan/50 flex items-center gap-2">
              <span>{window.location.origin}/team/{roomId}</span>
            </div>
            <button onClick={resetGame} className="bg-brand-black/70 border border-brand-cyan/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-cyan hover:bg-brand-cyan/10 transition-all">
              إعادة تعيين
            </button>
            <button onClick={onLeave} className="bg-brand-black/70 border border-brand-cyan/20 px-4 py-2 rounded-xl text-sm font-bold text-brand-cyan/70 hover:text-brand-cyan transition-all flex items-center gap-2">
              <XCircle className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>

        {/* Join Instructions Banner */}
        {state.status === 'waiting' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-brand-indigo/10 border border-brand-indigo/30 p-4 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="bg-brand-pink p-2 rounded-xl">
                <Users className="w-6 h-6 text-brand-black" />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">انضم الآن للعب!</h3>
                <p className="text-brand-cyan/70 text-sm">استخدم الرابط أعلاه للانضمام</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="min-h-[calc(100%-180px)] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {state.status === 'waiting' && (
            <motion.div key="waiting" className="grid grid-cols-2 gap-12 w-full max-w-6xl">
              <div className="bg-brand-black/70 border border-brand-cyan/20 p-8 rounded-[40px] text-center shadow-[0_0_30px_rgba(0, 229, 255,0.1)]">
                <Shield className="w-16 h-16 text-brand-pink mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0, 229, 255,0.5)]" />
                <h2 className="text-3xl font-black text-brand-pink mb-6">الفريق الوردي</h2>
                <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                  {state.players.filter(p => p.team === 'pink').map(p => (
                    <div key={p.id} className="bg-brand-indigo/10 p-3 rounded-xl flex justify-between items-center border border-brand-indigo/20">
                      <div className="flex items-center gap-2">
                        {state.data?.leaders?.pink === p.id && <Crown className="w-4 h-4 text-brand-cyan" />}
                        <span className="font-bold">{p.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {state.data?.leaders?.pink === p.id ? (
                          <span className="text-[10px] bg-brand-cyan text-brand-black px-2 py-1 rounded font-bold">القائد</span>
                        ) : (
                          <button onClick={() => setLeader(p.id, 'pink')} className="text-[10px] bg-brand-cyan/20 hover:bg-brand-cyan/40 px-2 py-1 rounded border border-brand-cyan/30 transition-colors">تعيين قائد</button>
                        )}
                        <button onClick={() => switchTeam(p.id, 'blue')} className="text-[10px] bg-brand-black/70 hover:bg-brand-black/80 px-2 py-1 rounded border border-brand-cyan/30 transition-colors">نقل للأسود</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-black/70 border border-brand-cyan/10 p-8 rounded-[40px] text-center opacity-80">
                <Shield className="w-16 h-16 text-zinc-400 mx-auto mb-4" />
                <h2 className="text-3xl font-black text-white mb-6">الفريق الأزرق</h2>
                <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                  {state.players.filter(p => p.team === 'blue').map(p => (
                    <div key={p.id} className="bg-brand-black/70 p-3 rounded-xl flex justify-between items-center border border-zinc-700">
                      <div className="flex items-center gap-2">
                        {state.data?.leaders?.blue === p.id && <Crown className="w-4 h-4 text-white" />}
                        <span className="font-bold text-white">{p.name}</span>
                      </div>
                      <div className="flex gap-2">
                        {state.data?.leaders?.blue === p.id ? (
                          <span className="text-[10px] bg-white text-brand-black px-2 py-1 rounded font-bold">القائد</span>
                        ) : (
                          <button onClick={() => setLeader(p.id, 'blue')} className="text-[10px] bg-white/20 hover:bg-white/40 px-2 py-1 rounded border border-white/30 transition-colors">تعيين قائد</button>
                        )}
                        <button onClick={() => switchTeam(p.id, 'pink')} className="text-[10px] bg-brand-indigo/10 hover:bg-brand-cyan/20 px-2 py-1 rounded border border-brand-indigo/20 transition-colors">نقل للذهبي</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex flex-col items-center gap-6 mt-8">
                <div className="bg-brand-black/70 border border-brand-cyan/20 p-6 rounded-2xl w-full max-w-md text-center">
                  <h3 className="text-xl font-bold mb-4 text-brand-cyan">لاعبين بدون فريق</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {state.players.filter(p => !p.team).map(p => (
                      <div key={p.id} className="bg-brand-black/70 p-2 rounded-lg flex gap-2 items-center border border-brand-cyan/10">
                        <span>{p.name}</span>
                        <button onClick={() => switchTeam(p.id, 'pink')} className="bg-brand-pink w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0, 229, 255,0.5)]"></button>
                        <button onClick={() => switchTeam(p.id, 'blue')} className="bg-zinc-400 w-4 h-4 rounded-full border border-zinc-500"></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={startGame} className="bg-brand-pink hover:bg-brand-pink text-brand-black font-black px-16 py-5 rounded-2xl text-2xl transition-all shadow-[0_0_30px_rgba(0, 229, 255,0.4)]">
                  ابدأ اللعبة
                </button>
              </div>
            </motion.div>
          )}

          {state.status === 'buzzer' && (
            <motion.div key="buzzer" className="w-full flex flex-col items-center justify-center space-y-12 min-h-[50vh]">
              <h2 className="text-4xl font-black text-brand-cyan italic glow-cyan-text">استعد للإجابة!</h2>
              <div className="flex gap-16 items-center w-full justify-center">
                <div className="flex flex-col items-center gap-4 bg-brand-indigo/10 p-8 rounded-[40px] border-2 border-brand-indigo/30">
                  <Shield className="w-24 h-24 text-brand-cyan drop-shadow-[0_0_20px_rgba(0, 229, 255,0.6)]" />
                  <span className="text-3xl font-black text-white">
                    {state.players.find(p => p.id === state.data.leaders?.pink)?.name || 'الوردي'}
                  </span>
                  {state.data.buzzerActive && 
                   (
                    state.data.leaders?.pink === socket?.id || 
                    (!state.data.leaders?.pink && (state.data.leaders?.blue !== socket?.id))
                   ) && (
                    <button 
                      onClick={() => socket?.emit('submit_team_action', { roomId, action: 'buzz', payload: { team: 'pink' } })}
                      className="mt-4 px-12 py-6 rounded-full border-8 font-black text-3xl shadow-[0_0_50px_rgba(255,0,0,0.6)] active:scale-95 transition-all bg-red-600 hover:bg-red-500 border-red-800 text-white"
                    >
                      زر الوردي
                    </button>
                  )}
                </div>
                
                <div className="px-12">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={state.data.buzzerTimer}
                    className="text-9xl font-black text-brand-cyan drop-shadow-[0_0_50px_rgba(0, 229, 255,0.8)]"
                  >
                    {state.data.buzzerTimer! > 0 ? state.data.buzzerTimer : 'GO!'}
                  </motion.div>
                </div>
                
                <div className="flex flex-col items-center gap-4 bg-brand-black/70 p-8 rounded-[40px] border-2 border-zinc-700">
                  <Shield className="w-24 h-24 text-zinc-400 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                  <span className="text-3xl font-black text-white">
                    {state.players.find(p => p.id === state.data.leaders?.blue)?.name || 'الأزرق'}
                  </span>
                  {state.data.buzzerActive && 
                   (
                    state.data.leaders?.blue === socket?.id || 
                    (!state.data.leaders?.blue && (state.data.leaders?.pink !== socket?.id))
                   ) && (
                    <button 
                      onClick={() => socket?.emit('submit_team_action', { roomId, action: 'buzz', payload: { team: 'blue' } })}
                      className="mt-4 px-12 py-6 rounded-full border-8 font-black text-3xl shadow-[0_0_50px_rgba(255,0,0,0.6)] active:scale-95 transition-all bg-red-600 hover:bg-red-500 border-red-800 text-white"
                    >
                      زر الأزرق
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xl text-brand-cyan/60 animate-pulse mt-8">
                أول من يضغط الزر يجيب أولاً!
              </p>
            </motion.div>
          )}

          {state.status === 'playing' && (
            <motion.div key="playing" className="w-full max-w-6xl space-y-8">
              {/* Leaders Display */}
              <div className="flex justify-center gap-12 mb-4">
                <div className="flex items-center gap-3 bg-brand-indigo/10 border border-brand-indigo/30 px-6 py-3 rounded-2xl">
                  <Crown className="w-6 h-6 text-brand-cyan" />
                  <div className="text-right">
                    <p className="text-[10px] text-brand-cyan/60 uppercase font-black">قائد الفريق الوردي</p>
                    <p className="text-lg font-black text-white">
                      {state.players.find(p => p.id === state.data.leaders.pink)?.name || 'لم يتم التعيين'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/20 px-6 py-3 rounded-2xl">
                  <Crown className="w-6 h-6 text-white" />
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase font-black">قائد الفريق الأزرق</p>
                    <p className="text-lg font-black text-white">
                      {state.players.find(p => p.id === state.data.leaders.blue)?.name || 'لم يتم التعيين'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className={`p-6 rounded-3xl border-4 transition-all ${state.data.currentTurn === 'pink' ? 'border-brand-cyan bg-brand-indigo/10 scale-110' : 'border-brand-indigo/10 opacity-50'}`}>
                  <h3 className="text-2xl font-black text-brand-cyan">ذهبي: {state.data.scores.pink}</h3>
                  <div className="flex gap-1 mt-2">
                    {[...Array(state.data.isStealOpportunity && state.data.currentTurn === 'pink' ? 1 : 3)].map((_, i) => (
                      <XCircle key={i} className={`w-6 h-6 ${i < state.data.strikes.pink ? 'text-brand-cyan fill-brand-cyan' : 'text-brand-cyan/10'}`} />
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-black italic text-brand-cyan glow-cyan-text">{state.data.question}</h2>
                  <div className="bg-brand-black/70 border border-brand-cyan/20 p-4 rounded-2xl inline-block">
                    <span className="text-xl font-bold text-white">
                      {state.data.isStealOpportunity ? 'فرصة سرقة - ' : ''}دور الفريق {state.data.currentTurn === 'pink' ? 'الوردي' : 'الأزرق'}
                    </span>
                  </div>
                  {state.data.roundPoints > 0 && (
                    <div className="text-2xl font-black text-brand-cyan mt-2">
                      النقاط المجمعة: {state.data.roundPoints}
                    </div>
                  )}
                </div>

                <div className={`p-6 rounded-3xl border-4 transition-all ${state.data.currentTurn === 'blue' ? 'border-zinc-400 bg-zinc-800/80 scale-110' : 'border-zinc-800 opacity-50'}`}>
                  <h3 className="text-2xl font-black text-white">أسود: {state.data.scores.blue}</h3>
                  <div className="flex gap-1 mt-2">
                    {[...Array(state.data.isStealOpportunity && state.data.currentTurn === 'blue' ? 1 : 3)].map((_, i) => (
                      <XCircle key={i} className={`w-6 h-6 ${i < state.data.strikes.blue ? 'text-white fill-white' : 'text-white/10'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
                {state.data.answers.map((ans, i) => (
                  <div key={i} className={`p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${ans.revealed ? 'bg-brand-cyan border-brand-pink text-brand-black shadow-[0_0_20px_rgba(0, 229, 255,0.3)]' : 'bg-brand-black/80 border-brand-cyan/20'}`}>
                    <span className="text-2xl font-black">{ans.revealed ? ans.text : `${i + 1} . . . . . . . . .`}</span>
                    {ans.revealed && <span className="text-xl font-bold">{ans.points}</span>}
                  </div>
                ))}
              </div>

              <form onSubmit={submitGuess} className="max-w-md mx-auto mt-12">
                <div className="relative">
                  <input 
                    type="text" 
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="اكتب الإجابة هنا..."
                    className="w-full bg-brand-black/70 border-2 border-brand-cyan/20 p-6 rounded-3xl text-xl font-bold focus:border-brand-cyan outline-none transition-all text-white"
                  />
                  <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-cyan text-brand-black p-3 rounded-2xl hover:bg-brand-pink">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              </form>
              {/* Team Management during game */}
              <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-brand-cyan/10">
                <div className="bg-brand-black/20 p-4 rounded-2xl">
                  <h4 className="text-brand-cyan font-bold mb-2">إدارة الفريق الوردي</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {state.players.filter(p => p.team === 'pink').map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs bg-brand-black/70 p-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          {state.data.leaders.pink === p.id && <Crown className="w-3 h-3 text-brand-cyan" />}
                          {p.name}
                        </span>
                        <button onClick={() => setLeader(p.id, 'pink')} className="text-[8px] bg-brand-cyan/20 px-2 py-1 rounded">قائد</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-brand-black/20 p-4 rounded-2xl">
                  <h4 className="text-white font-bold mb-2">إدارة الفريق الأزرق</h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                    {state.players.filter(p => p.team === 'blue').map(p => (
                      <div key={p.id} className="flex justify-between items-center text-xs bg-brand-black/70 p-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          {state.data.leaders.blue === p.id && <Crown className="w-3 h-3 text-white" />}
                          {p.name}
                        </span>
                        <button onClick={() => setLeader(p.id, 'blue')} className="text-[8px] bg-white/20 px-2 py-1 rounded">قائد</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {state.status === 'results' && (
            <motion.div key="results" className="w-full flex flex-col items-center gap-8 max-w-4xl mx-auto text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="bg-brand-black/70 border-2 border-brand-cyan/20 p-8 rounded-[40px] shadow-[0_0_50px_rgba(0, 229, 255,0.2)] w-full">
                <Trophy className="w-24 h-24 text-brand-cyan mx-auto mb-4 drop-shadow-[0_0_15px_rgba(0, 229, 255,0.6)]" />
                <h2 className="text-4xl font-black text-white mb-6">نتائج الجولة</h2>
                
                <div className="flex justify-center gap-12 mb-8">
                  <div className="text-center p-6 bg-brand-indigo/10 rounded-3xl border border-brand-indigo/30 min-w-[200px]">
                    <h3 className="text-2xl font-black text-brand-cyan mb-2">الوردي</h3>
                    <p className="text-5xl font-black text-white">{state.data.scores.pink}</p>
                  </div>
                  <div className="text-center p-6 bg-white/5 rounded-3xl border border-white/20 min-w-[200px]">
                    <h3 className="text-2xl font-black text-white mb-2">الأزرق</h3>
                    <p className="text-5xl font-black text-white">{state.data.scores.blue}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-brand-cyan/60">الإجابات الصحيحة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {state.data.answers.map((ans, i) => (
                      <div key={i} className="bg-brand-black/70 p-4 rounded-xl border border-brand-cyan/10 flex justify-between px-6">
                        <span className="font-bold text-white">{ans.text}</span>
                        <span className="font-bold text-brand-pink">{ans.points}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button onClick={startGame} className="bg-brand-pink hover:bg-brand-pink text-brand-black font-black px-8 py-4 rounded-2xl text-xl transition-all shadow-lg flex items-center gap-2">
                    <Swords className="w-6 h-6" />
                    جولة جديدة
                  </button>
                  <button onClick={resetGame} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-8 py-4 rounded-2xl text-xl transition-all">
                    إنهاء اللعبة
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-zinc-800">
          <h3 className="text-brand-cyan font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            الفرق ({state.players.length})
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Gold Team */}
          <div>
            <h4 className="text-brand-cyan text-sm font-bold mb-2 flex justify-between px-2">
              الفريق الوردي
              <span className="bg-brand-pink/20 px-2 rounded text-xs">{state.players.filter(p => p.team === 'pink').length}</span>
            </h4>
            <div className="space-y-1">
              {state.players.filter(p => p.team === 'pink').map(p => (
                <div key={p.id} className="bg-brand-pink/5 p-2 rounded border border-brand-cyan/10 flex items-center gap-2 text-sm">
                   {state.data?.leaders?.pink === p.id && <Crown className="w-3 h-3 text-brand-cyan" />}
                   <span className="text-zinc-200 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Black Team */}
          <div>
            <h4 className="text-zinc-400 text-sm font-bold mb-2 flex justify-between px-2">
              الفريق الأزرق
              <span className="bg-zinc-800 px-2 rounded text-xs">{state.players.filter(p => p.team === 'blue').length}</span>
            </h4>
            <div className="space-y-1">
              {state.players.filter(p => p.team === 'blue').map(p => (
                <div key={p.id} className="bg-zinc-900 p-2 rounded border border-zinc-800 flex items-center gap-2 text-sm">
                   {state.data?.leaders?.blue === p.id && <Crown className="w-3 h-3 text-zinc-400" />}
                   <span className="text-zinc-400 truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    {/* Sidebar */}
      {showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300 p-6 z-[80]">
          <div className="flex-1 min-h-0 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl relative backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 via-transparent to-brand-black/60 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <ChatSidebar messages={messages} instructions={[
          "انضم عبر الرابط للعب",
          "الستريمر سيقوم بتعيين قائد لكل فريق",
          "القائد فقط من يمكنه كتابة الإجابات"
        ]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

