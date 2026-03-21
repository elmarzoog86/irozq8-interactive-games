import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crosshair, Skull, User, XCircle, Volume2, VolumeX, AlertTriangle, ChevronRight } from 'lucide-react';
import { ChatMessage } from '../types';
import { TwitchChat } from './TwitchChat';

interface GameProps {
  messages?: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

type Mode = 'lobby' | 'playing' | 'game_over';

const playSound = (type: 'spin' | 'click' | 'bang' | 'win' | 'lobby_click' | 'heartbeat', volume = 0.5) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'spin') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'heartbeat') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'bang') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(20, ctx.currentTime + 0.8);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'win') {
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(440, ctx.currentTime);
       osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
       osc.frequency.setValueAtTime(659, ctx.currentTime + 0.3);
       gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
       gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
       osc.start(ctx.currentTime);
       osc.stop(ctx.currentTime + 0.8);
    } else if (type === 'lobby_click') {
       osc.type = 'sine';
       osc.frequency.setValueAtTime(600, ctx.currentTime);
       gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
       osc.start(ctx.currentTime);
       osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
};

export function RussianRouletteChatGame({ messages = [], onLeave, channelName, isConnected, error }: GameProps) {
  const [mode, setMode] = useState<Mode>('lobby');
  const [players, setPlayers] = useState<string[]>([]);
  const [deadPlayers, setDeadPlayers] = useState<string[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const [bullets, setBullets] = useState<number[]>([Math.floor(Math.random() * 6)]);
  const [currentChamber, setCurrentChamber] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [message, setMessage] = useState('');
  const [hasPulledTrigger, setHasPulledTrigger] = useState(false);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);

  const startGame = () => {
    if (players.length < 2) {
       setMessage('نتحتاج لاعبين على الأقل لبدء الجولة!');
       return;
    }
    if (soundEnabled) playSound('lobby_click');
    setMode('playing');
    setDeadPlayers([]);
    setActivePlayerIndex(0);
    setTimeLeft(20);
    setHasPulledTrigger(false);
    spinCylinder();
    processedMessageIds.current.clear();
  };

  const spinCylinder = (addBullet = false) => {
     setBullets(prev => {
        const count = addBullet ? Math.min(6, prev.length + 1) : prev.length;
        const newBullets = new Set<number>();
        while(newBullets.size < count) {
           newBullets.add(Math.floor(Math.random() * 6));
        }
        return Array.from(newBullets);
     });
     setCurrentChamber(0);
     if (soundEnabled) playSound('spin');
     setMessage('دوران الأسطوانة... الموت يقترب!');
  };

  const eliminatePlayer = useCallback((player: string, reason: string) => {
     setScreenShake(true);
     setTimeout(() => setScreenShake(false), 500);
     if (soundEnabled) playSound('bang');
     
     setPlayers(prev => {
        const next = prev.filter(p => p !== player);
        setDeadPlayers(d => [...d, player]);
        
        if (next.length <= 1) {
           setMode('game_over');
           if (soundEnabled) playSound('win');
        } else {
           const nextIdx = Math.floor(Math.random() * next.length);
           setActivePlayerIndex(nextIdx);
           setTimeLeft(20);
           setBullets([Math.floor(Math.random() * 6)]);
           setCurrentChamber(0);
           if (soundEnabled) playSound('spin');
           setMessage('دوران الأسطوانة... الدور على: ' + next[nextIdx]);
        }
        return next;
     });
     setHasPulledTrigger(false);
  }, [soundEnabled]);

  const surviveTurn = useCallback(() => {
     if (soundEnabled) playSound('click');
     setMessage('نقرة فارغة! اكتب !pass @اسم لتمرير المسدس!');
     setHasPulledTrigger(true);
  }, [soundEnabled]);

  useEffect(() => {
    if (mode === 'playing' && !hasPulledTrigger && players.length > 0) {
      const timer = setTimeout(() => {
        const currentPlayer = players[activePlayerIndex];
        if (bullets.includes(currentChamber)) {
            eliminatePlayer(currentPlayer, 'تلقى رصاصة!');
        } else {
            setCurrentChamber(c => c + 1);
            surviveTurn();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mode, activePlayerIndex, hasPulledTrigger, players, bullets, currentChamber, eliminatePlayer, surviveTurn]);

  useEffect(() => {
    if (mode === 'playing') {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(t => {
           if (t <= 1) {
              const cp = players[activePlayerIndex];
              eliminatePlayer(cp, hasPulledTrigger ? 'تأخر في التمرير!' : 'تأخر في الإطلاق!');
              return 20;
           }
           if (soundEnabled && t <= 3) playSound('heartbeat');
           return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [mode, activePlayerIndex, players, eliminatePlayer, soundEnabled, hasPulledTrigger]);

  useEffect(() => {
    if (mode === 'game_over') return;

    const newMsgs = messages.filter(m => !processedMessageIds.current.has(m.id));
    if (newMsgs.length === 0) return;

    newMsgs.forEach(m => processedMessageIds.current.add(m.id));

    newMsgs.forEach(msg => {
      const text = msg.message.trim().toLowerCase();
      const uname = msg.username;
      
      if (mode === 'lobby' && text === '!join') {
         setPlayers(p => {
            if (!p.includes(uname)) {
               if (soundEnabled) playSound('lobby_click');
               return [...p, uname];
            }
            return p;
         });
      }

      if (mode === 'playing') {
         if (players[activePlayerIndex] === uname) {
            if (text.startsWith('!pass ')) {
               if (hasPulledTrigger) {
                  const target = text.replace('!pass ', '').replace('@', '').trim();
                  if (target && target !== uname && players.includes(target)) {
                     const targetIdx = players.indexOf(target);
                     setActivePlayerIndex(targetIdx);
                     setTimeLeft(20);
                     setHasPulledTrigger(false);
                     if (soundEnabled) playSound('lobby_click');
                     setMessage(`تم تمرير المسدس إلى ${target}!`);
                  }
               }
            }
         }
      }
    });

  }, [messages, mode, players, deadPlayers, activePlayerIndex, currentChamber, bullets, eliminatePlayer, surviveTurn, soundEnabled, hasPulledTrigger]);

  return (
    <div className={`flex w-full h-full gap-8 overflow-hidden font-arabic transition-transform duration-75 ${screenShake ? 'scale-105 translate-x-1 translate-y-1' : ''}`} dir="rtl">
      <div className="flex-1 rounded-[40px] border border-zinc-800 bg-black backdrop-blur-xl flex flex-col relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]">
        
        <AnimatePresence>
          {mode === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black overflow-y-auto">
              <Crosshair className="w-24 h-24 text-zinc-400 mb-6" />
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">الروليت <span className="text-red-600">الروسي</span></h1>
              <div className="text-zinc-500 text-xl font-medium mb-8 max-w-3xl text-center">
                مرحباً بك في غرفة الإعدام! الهدف هو البقاء حياً بينما يقل عدد الناجين وتزيد فرص الموت.
                <br/><span className="text-red-500 text-sm">(نظام الإطلاق التلقائي مفعل)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl mb-8 w-full">
                <div className="bg-black/80 border border-zinc-800 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!join</div>
                   <div className="text-zinc-400 text-sm">للانضمام إلى قائمة اللاعبين.</div>       
                </div>
                <div className="bg-black/80 border border-zinc-800 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!pass @اسم</div>
                   <div className="text-zinc-400 text-sm">إذا نجوت، يمكنك تمرير المسدس للاعب معين.</div>       
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-8">
                الضحايا المحتملون: <span className="text-red-600">{players.length}</span>
              </div>

              <div className="flex gap-4 z-30 relative">
                 <button onClick={startGame} className="bg-red-800 hover:bg-red-700 text-white font-black px-12 py-4 rounded-full text-2xl transition-all shadow-[0_0_40px_rgba(153,27,27,0.4)] cursor-pointer hover:scale-105">
                   استعد للموت
                 </button>
              </div>

              <div className="absolute top-8 left-8 flex items-center gap-4">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-white/50 hover:text-white transition-colors p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
              </div>
              <div className="absolute top-8 right-8">
                <button onClick={onLeave} className="text-white/50 hover:text-white flex items-center gap-2 font-bold px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <XCircle className="w-5 h-5" /> خروج
                </button>
              </div>
              
              {message && <div className="mt-8 text-red-500 font-bold text-xl">{message}</div>}
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== 'lobby' && (
          <div className="p-6 flex justify-between items-center z-10 border-b border-zinc-800 bg-black/80">
            <div className="flex items-center gap-4">
              <Skull className="w-8 h-8 text-zinc-500" />
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">غرفة الإعدام</h2>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border-2 ${timeLeft <= 3 ? 'bg-red-900/50 border-red-500 text-red-500 animate-ping' : 'bg-black border-zinc-700 text-white'}`}>
              <AlertTriangle className="w-5 h-5" />
              <span className="text-2xl font-mono font-black">{timeLeft}s</span>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 bg-black rounded-xl border border-zinc-800 text-white/50 hover:text-white cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button onClick={onLeave} className="p-3 bg-black rounded-xl border border-zinc-800 text-white/50 hover:text-red-400 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
            </div>
          </div>
        )}

        {mode === 'playing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-hidden z-10 relative">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 to-black pointer-events-none" />
             
             <div className="z-10 bg-black/80 border border-red-900/30 px-8 py-4 rounded-full mb-12 shadow-[0_0_30px_rgba(153,27,27,0.2)]">
                <div className="text-red-500 font-bold text-xl">{message}</div>
             </div>

             <div className="flex items-center justify-center gap-12 z-10 w-full mb-16">
                <div className="relative">
                   <div className="w-48 h-48 rounded-full border-4 border-zinc-800 bg-zinc-900/50 flex items-center justify-center relative shadow-[inset_0_0_50px_rgba(0,0,0,1)]">
                      <Crosshair className={`w-32 h-32 ${timeLeft <= 3 ? 'text-red-600 animate-pulse' : 'text-zinc-600'}`} />
                   </div>
                   {players[activePlayerIndex] && (
                     <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-800 text-white font-black px-6 py-2 rounded-xl text-xl shadow-[0_0_20px_rgba(153,27,27,0.5)]">
                        دور: {players[activePlayerIndex]}
                     </div>
                   )}
                </div>
             </div>

             <div className="w-full max-w-3xl bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 z-10">
                <h3 className="text-zinc-500 mb-4 font-bold">اللاعبون المتبقون ({players.length})</h3>     
                <div className="flex flex-wrap gap-3">
                   {players.map((p, i) => (
                      <span key={p} className={`px-4 py-2 rounded-lg font-bold border ${i === activePlayerIndex ? 'bg-red-900/50 border-red-500 text-red-200' : 'bg-black border-zinc-800 text-zinc-400'}`}>
                         {p}
                      </span>
                   ))}
                </div>
             </div>
             
             <div className="w-full max-w-3xl mt-4 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6 z-10">
                <h3 className="text-zinc-500 mb-4 font-bold flex items-center gap-2"><Skull className="w-4 h-4"/> الضحايا ({deadPlayers.length})</h3>
                <div className="flex flex-wrap gap-3">
                   {deadPlayers.map(p => (
                      <span key={p} className="px-4 py-2 rounded-lg font-bold bg-black border border-red-900/30 text-red-900/50 line-through">
                         {p}
                      </span>
                   ))}
                   {deadPlayers.length === 0 && <span className="text-zinc-700">لا يوجد ضحايا بعد...</span>}
                </div>
             </div>
          </div>
        )}

        <AnimatePresence>
          {mode === 'game_over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8">
              <Skull className="w-40 h-40 mb-6 text-red-600 drop-shadow-[0_0_50px_rgba(220,38,38,0.5)]" />
              <h2 className="text-3xl text-zinc-400 font-bold mb-2">الناجي الوحيد</h2>
              <h1 className="text-7xl font-black mb-8 text-white">
                {players[0] || 'لا أحد'}
              </h1>
              <div className="flex gap-4">
                 <button onClick={() => { setMode('lobby'); setPlayers([]); }} className="mt-8 bg-white text-black font-black px-12 py-4 rounded-full hover:scale-105 transition-transform text-xl cursor-pointer">
                   لعبة جديدة
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {mode !== 'lobby' && (
        <div className="w-80 h-full flex flex-col bg-black/60 backdrop-blur-xl rounded-[40px] border border-zinc-800 overflow-hidden shadow-2xl shrink-0">
          <TwitchChat channelName={channelName} messages={messages} isConnected={isConnected} error={error} />
        </div>
      )}
    </div>
  );
}
