import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Timer, Crosshair, Heart, Zap, Flag, XCircle, Volume2, VolumeX, AlertTriangle, Skull } from 'lucide-react';
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

interface PlayerStats {
  username: string;
  damageDealt: number;
  healingDone: number;
  lastActionTime: number;
}

interface Gang {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  hp: number;
  maxHp: number;
  members: Record<string, PlayerStats>;
}

const INITIAL_GANGS: Gang[] = [
  { id: 'red', name: 'العصابة الحمراء', color: 'text-red-500', bgColor: 'bg-red-500', borderColor: 'border-red-500', hp: 10000, maxHp: 10000, members: {} },
  { id: 'blue', name: 'العصابة الزرقاء', color: 'text-blue-500', bgColor: 'bg-blue-500', borderColor: 'border-blue-500', hp: 10000, maxHp: 10000, members: {} }
];

const playSound = (type: 'shoot' | 'heal' | 'raid' | 'win' | 'click', volume = 0.5) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'shoot') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'heal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'raid') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'win') {
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(440, ctx.currentTime);
       osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
       osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
       osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
       gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
       gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
       osc.start(ctx.currentTime);
       osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'click') {
       osc.type = 'sine';
       osc.frequency.setValueAtTime(800, ctx.currentTime);
       gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
       gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
       osc.start(ctx.currentTime);
       osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {}
};

export function TurfWarsGame({ messages = [], onLeave, channelName, isConnected, error }: GameProps) {
  const [mode, setMode] = useState<Mode>('lobby');
  const [gangs, setGangs] = useState<Gang[]>(INITIAL_GANGS);
  const [actionFeed, setActionFeed] = useState<{id: string, text: string, type: 'shoot'|'heal'|'raid'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [winner, setWinner] = useState<Gang | null>(null);
  const [raidActive, setRaidActive] = useState(false);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);
  const driveByRef = useRef<Record<string, { count: number, lastTime: number }>>({});
  const gameStartTime = useRef<number>(0);

  const addLog = useCallback((text: string, type: 'shoot'|'heal'|'raid') => {
    setActionFeed(p => [{id: Math.random().toString(), text, type}, ...p].slice(0, 10));
  }, []);

  const startGame = () => {
    if (soundEnabled) playSound('click');
    setMode('playing');
    gameStartTime.current = Date.now();
    processedMessageIds.current.clear();
    setWinner(null);
    setGangs(prev => prev.map(g => ({
      ...g,
      hp: g.maxHp,
      members: Object.fromEntries(
        Object.entries(g.members).map(([name, stats]) => [name, { ...stats, damageDealt: 0, healingDone: 0, lastActionTime: 0 }])
      )
    })));
  };

  const movePlayer = (username: string, targetGangId: string) => {
      setGangs(prev => {
          let playerStats: PlayerStats | null = null;
          let sourceGangId: string | null = null;
          
          for (const g of prev) {
             if (g.members[username]) {
                playerStats = g.members[username];
                sourceGangId = g.id;
                break;
             }
          }
          
          if (!playerStats || !sourceGangId || sourceGangId === targetGangId) return prev;

          return prev.map(g => {
              if (g.id === sourceGangId) {
                  const { [username]: removed, ...rest } = g.members;
                  return { ...g, members: rest };
              }
              if (g.id === targetGangId) {
                  return { ...g, members: { ...g.members, [username]: playerStats! } };
              }
              return g;
          });
      });
  };

  useEffect(() => {
    if (mode === 'playing') {
      timerRef.current = window.setInterval(() => {
        setGangs(prev => {
           let maxHpGang = prev[0];
           let allHp = 0;
           prev.forEach(g => {
              allHp += g.hp;
              if (g.hp > maxHpGang.hp) maxHpGang = g;
           });
           
           // Raid Logic: Only after 30s, 5% chance.
           if (Date.now() - gameStartTime.current > 30000 && Math.random() < 0.05 && maxHpGang.hp > 2000 && allHp > 5000) {
              setRaidActive(true);
              setTimeout(() => setRaidActive(false), 3000);
              if (soundEnabled) playSound('raid');
              addLog(`🚨 قوات التدخل السريع داهمت ${maxHpGang.name}! تم خصم نصف دمهم!`, 'raid');
              
              return prev.map(g => {
                 if (g.id === maxHpGang.id) {
                    return { ...g, hp: Math.floor(g.hp / 2) };
                 }
                 return g;
              });
           }
           return prev;
        });
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [mode, addLog, soundEnabled]);

  useEffect(() => {
     if (mode === 'playing') {
        const aliveGangs = gangs.filter(g => g.hp > 0);
        if (aliveGangs.length === 1) {
           setWinner(aliveGangs[0]);
           setMode('game_over');
           if (soundEnabled) playSound('win');
        } else if (aliveGangs.length === 0) {
           setMode('game_over');
        }
     }
  }, [gangs, mode, soundEnabled]);

  useEffect(() => {
    if (mode === 'game_over') return;

    const newMsgs = messages.filter(m => !processedMessageIds.current.has(m.id));
    if (newMsgs.length === 0) return;

    newMsgs.forEach(m => processedMessageIds.current.add(m.id));

    setGangs(prev => {
      let nextGangs = [...prev];
      let madeChanges = false;
      const now = Date.now();
      
      newMsgs.forEach(msg => {
        const text = msg.message.trim().toLowerCase();
        const uname = msg.username;
        
        let playerGangId: string | null = null;
        let playerStats: PlayerStats | null = null;

        for (const g of nextGangs) {
           if (g.members[uname]) {
              playerGangId = g.id;
              playerStats = g.members[uname];
              break;
           }
        }

        if (mode === 'lobby') {
           if (text.startsWith('!join ')) {
              const targetColor = text.replace('!join ', '').trim();
              if (['red', 'blue'].includes(targetColor) && !playerGangId) {
                 nextGangs = nextGangs.map(g => {
                    if (g.id === targetColor) {
                       const newMembers = { ...g.members, [uname]: { username: uname, damageDealt: 0, healingDone: 0, lastActionTime: 0 } };
                       madeChanges = true;
                       if (soundEnabled) playSound('click');
                       return { ...g, members: newMembers };
                    }
                    return g;
                 });
              }
           }
        }

        if (mode === 'playing' && playerGangId && playerStats) {
           // Cooldown check (10s) for actions except join/betray
           const onCooldown = (now - playerStats.lastActionTime) < 10000;

           if (text === '!shoot') {
               if (!onCooldown) {
                   const targetGangs = nextGangs.filter(g => g.id !== playerGangId && g.hp > 0);
                   if (targetGangs.length > 0) {
                      const targetGang = targetGangs[Math.floor(Math.random() * targetGangs.length)];
                      const dmg = 50 + Math.floor(Math.random() * 50);
                      
                      nextGangs = nextGangs.map(g => {
                         if (g.id === targetGang.id) {
                            return { ...g, hp: Math.max(0, g.hp - dmg) };
                         }
                         if (g.id === playerGangId) {
                             // Update player stats
                             const p = g.members[uname];
                             return { 
                                 ...g, 
                                 members: { 
                                     ...g.members, 
                                     [uname]: { ...p, damageDealt: p.damageDealt + dmg, lastActionTime: now } 
                                 } 
                             };
                         }
                         return g;
                      });
                      madeChanges = true;
                      if (Math.random() > 0.7) {
                         addLog(`🔫 ${uname} أطلق النار على ${targetGang.name} (-${dmg})`, 'shoot');
                         if (soundEnabled) playSound('shoot');
                      }
                   }
               }
           } else if (text === '!heal') {
               if (!onCooldown) {
                   const heal = 30 + Math.floor(Math.random() * 30);
                   nextGangs = nextGangs.map(g => {
                      if (g.id === playerGangId) {
                         const p = g.members[uname];
                         return { 
                             ...g, 
                             hp: Math.min(g.maxHp, g.hp + heal),
                             members: {
                                 ...g.members,
                                 [uname]: { ...p, healingDone: p.healingDone + heal, lastActionTime: now }
                             }
                         };
                      }
                      return g;
                   });
                   madeChanges = true;
                   if (Math.random() > 0.8) {
                      addLog(`💉 ${uname} عالج عصابته (+${heal})`, 'heal');
                      if (soundEnabled) playSound('heal');
                   }
               }
           } else if (text.startsWith('!driveby ')) {
              // DriveBy logic remains similar but relies on group effort, individual cooldown? 
              // driveByRef is global per gang. Let's keep it per gang for now as it's a "combo" move.
              const targetColor = text.replace('!driveby ', '').trim();
              if (['red', 'blue'].includes(targetColor) && targetColor !== playerGangId) {
                  // Only count if not on cooldown? Or maybe driveby doesn't follow normal cooldown?
                  // Let's say driveby is separate, but maybe check cooldown too?
                  // User didn't specify, but let's apply cooldown to be safe or it's spammy.
                  if (!onCooldown) {
                      const gangDriveBy = driveByRef.current[playerGangId] || { count: 0, lastTime: 0 };
                      if (now - gangDriveBy.lastTime > 5000) {
                          gangDriveBy.count = 1;
                      } else {
                          gangDriveBy.count += 1;
                      }
                      gangDriveBy.lastTime = now;
                      driveByRef.current[playerGangId] = gangDriveBy;

                      // Update player lastActionTime to prevent spamming !driveby to trigger it alone
                      nextGangs = nextGangs.map(g => {
                          if (g.id === playerGangId) {
                              const p = g.members[uname];
                              return { ...g, members: { ...g.members, [uname]: { ...p, lastActionTime: now } } };
                          }
                          return g;
                      });

                      if (gangDriveBy.count >= 3) {
                         gangDriveBy.count = 0;
                         const dmg = 1000;
                         nextGangs = nextGangs.map(g => {
                            if (g.id === targetColor) {
                               return { ...g, hp: Math.max(0, g.hp - dmg) };
                            }
                            return g;
                         });
                         addLog(`🚗💨 هجوم قاسي بالسيارة من ${playerGangId} على ${targetColor}! (-${dmg})`, 'shoot');
                         if (soundEnabled) playSound('shoot');
                      }
                      madeChanges = true;
                  }
              }
           } else if (text.startsWith('!betray ')) {
              const targetColor = text.replace('!betray ', '').trim();
              if (['red', 'blue'].includes(targetColor) && targetColor !== playerGangId) {
                  const dmg = 400;
                  nextGangs = nextGangs.map(g => {
                     if (g.id === playerGangId) {
                        const { [uname]: removed, ...rest } = g.members;
                        return { ...g, hp: Math.max(0, g.hp - dmg), members: rest };
                     }
                     if (g.id === targetColor) {
                        // Reset stats on betray? Or keep them? "Betrayal resets your honor" -> resets stats seems fair.
                        return { ...g, members: { ...g.members, [uname]: { username: uname, damageDealt: 0, healingDone: 0, lastActionTime: 0 } } };
                     }
                     return g;
                  });
                  madeChanges = true;
                  addLog(`🐍 ${uname} خان عصابته وانضم إلى ${targetColor}! وسرق ${dmg} نقطة دم!`, 'raid');
                  if (soundEnabled) playSound('click');
              }
           } else if (text === '!bribe') {
               const myGang = nextGangs.find(g => g.id === playerGangId);
               if (myGang && myGang.hp > 1000) {
                  if (!onCooldown) {
                      let maxHpGang: Gang | null = null;
                      nextGangs.forEach(g => {
                         if (g.id !== playerGangId && g.hp > 0) {
                            if (!maxHpGang || g.hp > maxHpGang.hp) maxHpGang = g;
                         }
                      });
                      if (maxHpGang) {
                         nextGangs = nextGangs.map(g => {
                            if (g.id === playerGangId) {
                                const p = g.members[uname];
                                return { 
                                    ...g, 
                                    hp: g.hp - 500,
                                    members: { ...g.members, [uname]: { ...p, lastActionTime: now } }
                                };
                            }
                            if (maxHpGang && g.id === maxHpGang.id) return { ...g, hp: Math.max(0, g.hp - 1500) };
                            return g;
                         });
                         madeChanges = true;
                         setRaidActive(true);
                         setTimeout(() => setRaidActive(false), 3000);
                         addLog(`💰 ${uname} دفع رشوة ووجه الشرطة لمداهمة ${maxHpGang.name}!`, 'raid');
                         if (soundEnabled) playSound('raid');
                      }
                  }
               }
           }
        }
      });
      return madeChanges ? nextGangs : prev;
    });
  }, [messages, mode, soundEnabled, addLog]);

  return (
    <div className="flex w-full h-full gap-8 bg-black/50 overflow-hidden font-arabic" dir="rtl">
      <div className="flex-1 rounded-[40px] border border-white/20 bg-black/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
        
        <AnimatePresence>
          {mode === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-black/90 to-black overflow-y-auto">
              <Flag className="w-24 h-24 text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]" />
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">حرب <span className="text-gray-400">العصابات</span></h1>
              <p className="text-white/60 text-xl font-medium mb-8 max-w-3xl text-center">
                مرحباً بك في ساحة حرب العصابات الأم! اختر عصابتك وادافع عن أراضيكم!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mb-8 w-full">
                <div className="bg-black/50 border border-white/20 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!join color</div>
                   <div className="text-white/80 text-sm">للانضمام لعصابة (red, blue).</div>
                </div>
                <div className="bg-black/50 border border-white/20 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!shoot</div>
                   <div className="text-white/80 text-sm">لإطلاق النار على عصابة معادية عشوائياً.</div>
                </div>
                <div className="bg-black/50 border border-white/20 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!heal</div>
                   <div className="text-white/80 text-sm">لعلاج عصابتك وزيادة نقاط صحتها.</div>
                </div>
                <div className="bg-black/50 border border-white/20 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!driveby color</div>
                   <div className="text-white/80 text-sm">هجوم سريع بالسيارة. إذا فعلها 3 من عصابتك في ثوانٍ، تُدمر العصابة المقصودة بشدة!</div>
                </div>
                <div className="bg-black/50 border border-white/20 p-4 rounded-2xl">
                   <div className="font-bold text-white mb-1 text-lg">!bribe</div>
                   <div className="text-white/80 text-sm">دفع رشاوي من صحة عصابتك (500) لتوجيه مداهمة قوة التدخل السريع لأقوى عصابة!</div>
                </div>
                <div className="bg-red-900/40 border border-red-500/50 p-4 rounded-2xl">
                   <div className="font-bold text-red-400 mb-1 text-lg">!betray color</div>
                   <div className="text-white/80 text-sm">خيانة عصابتك وسرقة نقاط للانتقال لعصابة أخرى.</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 w-full max-w-2xl mb-8">
                 {gangs.map(g => (
                    <div key={g.id} className={`p-6 rounded-2xl border-2 ${g.borderColor} bg-black/50 flex flex-col items-center min-h-[300px]`}>
                       <span className={`text-2xl font-black mb-2 ${g.color}`}>{g.name}</span>
                       <span className="text-4xl font-bold text-white mb-2">{Object.keys(g.members).length}</span>
                       <span className="text-white/50 mb-6">أعضاء</span>

                       <div className="w-full flex-1 overflow-y-auto max-h-60 custom-scrollbar bg-black/30 rounded-xl p-2 gap-1 flex flex-col">
                           {Object.values(g.members).length === 0 && <div className="text-white/30 text-center py-4">انتظار انضمام لاعبين...</div>}
                           {Object.values(g.members).map(m => (
                               <div key={m.username} className="flex justify-between items-center text-white/90 text-sm bg-white/10 p-2 rounded-lg border border-white/5">
                                   <span className="font-bold truncate max-w-[120px]">{m.username}</span>
                                   <button 
                                      onClick={() => movePlayer(m.username, g.id === 'red' ? 'blue' : 'red')}
                                      className="text-xs bg-white/10 hover:bg-white/20 p-1 px-3 rounded-md transition-colors cursor-pointer border border-white/10"
                                   >
                                       نقل
                                   </button>
                               </div>
                           ))}
                       </div>
                    </div>
                 ))}
              </div>

              <div className="flex gap-4 z-30 relative">
                 <button onClick={startGame} className="bg-white text-black font-black px-12 py-4 rounded-full text-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer hover:scale-105">
                   بدء حرب الشوارع
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
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== 'lobby' && (
          <div className="p-6 flex justify-between items-center z-10 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/30">
                <Crosshair className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">حرب العصابات النشطة</h2>
              </div>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 bg-black/50 rounded-xl border border-white/10 text-white/50 hover:text-white cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button onClick={onLeave} className="p-3 bg-black/50 rounded-xl border border-white/10 text-white/50 hover:text-red-400 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
            </div>
          </div>
        )}

        {mode === 'playing' && (
          <div className="flex-1 flex flex-col p-6 overflow-hidden z-10 relative">
            {raidActive && (
               <div className="absolute inset-0 z-0 bg-blue-500/10 pointer-events-none flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-ping" />
                  <div className="bg-blue-600 border border-blue-400 text-white font-black px-12 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(37,99,235,0.8)] z-10 animate-bounce">
                    <AlertTriangle className="w-8 h-8" />
                    مداهمة قوات التدخل السريع (SWAT)!!
                    <AlertTriangle className="w-8 h-8" />
                  </div>
               </div>
            )}
            
            <div className="flex-1 grid grid-cols-2 gap-6 z-10 w-full max-w-6xl mx-auto h-[600px]">
               {gangs.map((g, idx) => (
                  <motion.div key={g.id} layout className={`p-4 rounded-3xl border-4 ${g.borderColor} bg-black/60 relative overflow-hidden flex flex-col items-center h-full`}>
                     {g.hp <= 0 && <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center"><Skull className="w-24 h-24 text-zinc-600" /></div>}
                     <div className="flex flex-col items-center w-full mb-4 z-10 shrink-0">
                        <h3 className={`text-4xl font-black mb-1 ${g.color}`}>{g.name}</h3>
                        <span className="text-xl text-white/50">الأعضاء: {Object.keys(g.members).length}</span>
                     </div>
                     
                     <div className="w-full relative h-10 bg-black rounded-full border-2 border-white/20 overflow-hidden px-1 flex items-center z-10 mb-2 shrink-0">
                        <motion.div 
                           className={`h-8 rounded-full ${g.bgColor}`}
                           animate={{ width: `${Math.max(0, (g.hp / g.maxHp) * 100)}%` }}
                           transition={{ type: 'spring' }}
                        />
                     </div>
                     <div className="text-3xl font-mono font-bold text-white z-10 mb-4 shrink-0">{Math.floor(g.hp)} / {g.maxHp} HP</div>

                     <div className="w-full flex-1 overflow-y-auto custom-scrollbar bg-black/40 rounded-xl p-3 gap-2 flex flex-col min-h-0 z-10 border border-white/10">
                         {Object.values(g.members).sort((a,b) => (b.damageDealt + b.healingDone) - (a.damageDealt + a.healingDone)).map((m, i) => (
                             <div key={m.username} className={`flex justify-between items-center text-white/90 text-sm p-3 rounded-lg border border-white/5 ${i < 3 ? 'bg-white/10' : 'bg-white/5'}`}>
                                 <div className="flex items-center gap-3">
                                     <span className="opacity-50 font-mono w-4">{i+1}</span>
                                     <span className="font-bold">{m.username}</span>
                                 </div>
                                 <div className="flex gap-4 font-mono">
                                     <div className="flex items-center gap-1 text-red-300 bg-red-900/40 px-2 py-1 rounded">
                                         <span>⚔️</span>
                                         <span>{m.damageDealt}</span>
                                     </div>
                                     <div className="flex items-center gap-1 text-green-300 bg-green-900/40 px-2 py-1 rounded">
                                         <span>❤️</span>
                                         <span>{m.healingDone}</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                  </motion.div>
               ))}
            </div>

            <div className="h-48 mt-6 bg-black/40 border border-white/10 rounded-3xl p-4 flex flex-col shadow-xl z-10 overflow-hidden">
               <h3 className="text-zinc-500 font-bold mb-2 uppercase tracking-widest text-sm flex items-center gap-2">
                 <Zap className="w-4 h-4" /> الأخبار
               </h3>
               <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence>
                    {actionFeed.map(feed => (
                      <motion.div key={feed.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`px-4 py-2 rounded-xl font-bold flex flex-col ${feed.type === 'shoot' ? 'bg-red-500/20 text-red-200' : feed.type === 'heal' ? 'bg-green-500/20 text-green-200' : 'bg-blue-500/20 text-blue-200 border-l-4 border-blue-500'}`}>
                        <span className="text-sm">{feed.text}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {mode === 'game_over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8">
              {winner ? (
                 <>
                   <Flag className={`w-40 h-40 mb-6 ${winner.color} drop-shadow-[0_0_50px_currentColor]`} />
                   <h2 className="text-3xl text-white/80 font-bold mb-2">العصابة المنتصرة!</h2>
                   <h1 className={`text-7xl font-black mb-8 ${winner.color}`}>
                     {winner.name}
                   </h1>
                 </>
              ) : (
                 <>
                   <Skull className="w-40 h-40 mb-6 text-zinc-500" />
                   <h1 className="text-7xl font-black text-white mb-8">تم تدمير الجميع!</h1>
                 </>
              )}
              <div className="flex gap-4">
                 <button onClick={() => { setMode('lobby'); setGangs(INITIAL_GANGS); }} className="mt-8 bg-white text-black font-black px-12 py-4 rounded-full hover:scale-105 transition-transform text-xl cursor-pointer">
                   إعادة الحرب
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {mode !== 'lobby' && (
        <div className="w-80 h-full flex flex-col bg-black/60 backdrop-blur-xl rounded-[40px] border border-white/20 overflow-hidden shadow-2xl shrink-0">
          <TwitchChat channelName={channelName} messages={messages} isConnected={isConnected} error={error} />
        </div>
      )}
    </div>
  );
}
