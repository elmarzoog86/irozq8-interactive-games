import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trophy, Timer, MessageSquare, XCircle, Bomb, Zap, Activity, Shield, CheckCircle2, Info, MessageSquareOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { ChatSidebar } from './ChatSidebar';

interface Player {
  id: string;
  name: string;
  team: 'pink' | 'blue' | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'playing' | 'results';
  data: {
    timer: number;
    tasks: { id: number; text: string; count?: number; target?: number; completed: boolean; answer?: string }[];
    isDefused: boolean;
    isExploded: boolean;
  };
}

export const BombRelayGame: React.FC<{ onLeave: () => void; messages: any[] }> = ({ onLeave, messages }) => {
  const [showChat, setShowChat] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [roomId] = useState(() => Math.random().toString(36).substring(7));
  const [taskInput, setTaskInput] = useState('');
  const processedMessages = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;
    
    messages.forEach(msg => {
      const messageText = msg.message || msg.text;
      const messageUser = msg.username || msg.user;
      if (messageText && !processedMessages.current.has(msg.id)) {
        processedMessages.current.add(msg.id);
        if (messageText.trim().toLowerCase() === '!join') {
          socket.emit('switch_team', { roomId, team: 'pink', name: messageUser });
        }
      }
    });
  }, [messages, socket, roomId]);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit('join_team_game', { roomId, name: 'Streamer', gameType: 'bombrelay' });
    newSocket.on('team_game_state', (newState: GameState) => setState(newState));
    return () => { newSocket.disconnect(); };
  }, [roomId]);

  const switchTeam = (playerId: string, team: 'pink' | 'blue' | null) => {
    socket?.emit('switch_team', { roomId, playerId, team });
  };

  const startGame = () => socket?.emit('start_team_game', roomId);

  const resetGame = () => socket?.emit('reset_team_game', roomId);

  const submitTask = (taskId: number, answer?: string) => {
    socket?.emit('submit_team_action', { roomId, action: 'task_progress', payload: { taskId, answer } });
  };

  if (!state) return <div className="flex items-center justify-center h-full text-white">جاري الاتصال...</div>;

  return (
    <div className="flex h-full w-full bg-brand-black overflow-hidden font-arabic text-white" dir="rtl">

      <button onClick={() => setShowChat(!showChat)} className="absolute bottom-6 left-6 text-brand-cyan/70 hover:text-brand-cyan flex items-center gap-2 transition-colors z-[90] bg-brand-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-cyan/20 hover:border-brand-cyan/40 shadow-xl">
            {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
          </button>
  
      {/* Main Game Area */}
      <div className="flex-1 relative p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-brand-pink uppercase glow-cyan-text">سباق القنبلة</h1>
            <p className="text-brand-cyan/60">تعاون مع فريقك لتفكيك القنبلة</p>
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
                <h3 className="font-black text-lg text-white">انضم الآن للمهمة!</h3>
                <p className="text-brand-cyan/70 text-sm">استخدم الرابط أعلاه للانضمام</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="min-h-[calc(100%-120px)] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {state.status === 'waiting' && (
            <motion.div key="waiting" className="grid grid-cols-2 gap-12 w-full max-w-6xl">
              <div className="bg-brand-pink/5 border border-brand-cyan/20 p-8 rounded-[40px] text-center">
                <Shield className="w-16 h-16 text-brand-pink mx-auto mb-4" />
                <h2 className="text-3xl font-black text-brand-pink mb-6">فريق التفكيك</h2>
                <div className="space-y-2 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar">
                  {state.players.map(p => (
                    <div key={p.id} className="bg-brand-indigo/10 p-3 rounded-xl flex justify-between items-center border border-brand-indigo/10">
                      <span>{p.name}</span>
                      <button onClick={() => switchTeam(p.id, 'pink')} className="text-[10px] bg-brand-cyan/20 px-2 py-1 rounded border border-brand-cyan/20">تثبيت</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-8">
                <Bomb className="w-32 h-32 text-brand-indigo animate-pulse" />
                <button onClick={startGame} className="bg-brand-pink hover:bg-brand-pink text-brand-black font-black px-16 py-5 rounded-2xl text-2xl transition-all shadow-[0_0_30px_rgba(0, 229, 255,0.4)]">
                  ابدأ المهمة
                </button>
              </div>
            </motion.div>
          )}

          {state.status === 'playing' && (
            <motion.div key="playing" className="w-full max-w-4xl space-y-12 text-center">
              <div className="relative inline-block">
                <div className={`text-8xl font-black font-mono ${state.data.timer < 10 ? 'text-red-500 animate-ping' : 'text-brand-cyan'}`}>
                  {state.data.timer}s
                </div>
                <Bomb className="w-12 h-12 text-brand-cyan/20 absolute -top-8 -right-8" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                {state.data.tasks.map((task) => (
                  <div key={task.id} className={`p-8 rounded-[32px] border-2 transition-all flex justify-between items-center ${task.completed ? 'bg-brand-cyan/20 border-brand-cyan' : 'bg-brand-black/70 border-brand-cyan/20'}`}>
                    <div className="text-right">
                      <h3 className="text-2xl font-bold mb-2 text-white">{task.text}</h3>
                      {task.target && (
                        <div className="w-64 h-4 bg-brand-black/70 rounded-full overflow-hidden border border-brand-cyan/10">
                          <div 
                            className="h-full bg-brand-cyan transition-all" 
                            style={{ width: `${(task.count! / task.target!) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    
                    {!task.completed ? (
                      <div className="flex gap-4">
                        {task.target ? (
                          <button 
                            onClick={() => submitTask(task.id)}
                            className="bg-brand-pink text-brand-black px-8 py-4 rounded-2xl font-black hover:bg-brand-pink"
                          >
                            تفكيك!
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="الإجابة..."
                              className="bg-brand-black/70 border border-brand-cyan/20 p-4 rounded-xl outline-none focus:border-brand-cyan text-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  submitTask(task.id, (e.target as HTMLInputElement).value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <CheckCircle2 className="w-12 h-12 text-brand-cyan" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {state.status === 'results' && (
            <motion.div key="results" className="text-center space-y-8">
              {state.data.isDefused ? (
                <>
                  <Trophy className="w-48 h-48 text-brand-cyan mx-auto animate-bounce" />
                  <h2 className="text-6xl font-black text-brand-cyan">تم التفكيك بنجاح!</h2>
                </>
              ) : (
                <>
                  <div className="text-9xl">💥</div>
                  <h2 className="text-6xl font-black text-red-500">انفجرت القنبلة!</h2>
                </>
              )}
              <button onClick={resetGame} className="bg-brand-black/70 border border-brand-cyan/20 px-12 py-4 rounded-2xl font-bold text-brand-cyan hover:bg-brand-cyan/10 transition-all">
                العودة للردهة
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {/* Active Players List */}
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-brand-cyan font-bold flex items-center gap-2">
          <Users className="w-5 h-5" />
          الفريق النشط ({state.players.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {state.players.map(p => (
          <div key={p.id} className="bg-brand-black/70 p-2 rounded-lg border border-white/5 flex items-center justify-between">
            <span className="text-zinc-200 text-sm truncate">{p.name}</span>
            {p.team === 'pink' && <Shield className="w-4 h-4 text-brand-cyan" />}
          </div>
        ))}
        {state.players.length === 0 && (
          <div className="text-zinc-500 text-center text-sm py-4">لا يوجد لاعبين</div>
        )}
      </div>
    </div>

      {/* Sidebar */}
      {showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300 p-6 z-[80]">
          <div className="flex-1 min-h-0 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl relative backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 via-transparent to-brand-black/60 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <ChatSidebar messages={messages} instructions={[
          "اكتب !join للانضمام لفريق التفكيك",
          "انضم عبر الرابط للعب",
        ]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

