import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Timer, Crosshair, Skull, Heart, Sword, Zap, Flame, Crown, XCircle, Volume2, VolumeX } from 'lucide-react';
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

interface PlayerState {
  hp: number;
  weapon: { name: string; damage: number; emoji: string } | null;
  kills: number;
  isDead: boolean;
  attackCooldowns: Record<string, number>; // maps target username to timestamp
  lastAction: number;
  lastHeal: number;
}

const WEAPONS = [
  { name: 'ملعقة صدئة', damage: 5, emoji: '🥄' },
  { name: 'مضرب بيسبول', damage: 15, emoji: '🏏' },
  { name: 'سيف', damage: 25, emoji: '🗡️' },
  { name: 'قناصة', damage: 40, emoji: '🎯' },
  { name: 'بازوكا', damage: 60, emoji: '🚀' },
];

const DISASTERS = [
  { name: 'عاصفة نيزكية', damage: 30, emoji: '☄️' },
  { name: 'غاز سام', damage: 20, emoji: '☢️' },
  { name: 'هجوم فضائي', damage: 45, emoji: '🛸' },
];

const playSound = (type: 'join' | 'hit' | 'loot' | 'disaster' | 'death' | 'win' | 'click', volume = 0.5) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'join' || type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'death') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(20, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'loot') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'disaster') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.8);
      gainNode.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.0);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.0);
    }
  } catch (e) {}
};

export function ChatRoyaleGame({ messages = [], onLeave, channelName, isConnected, error }: GameProps) {
  const [mode, setMode] = useState<Mode>('lobby');
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [actionFeed, setActionFeed] = useState<{id: string, text: string, type: 'kill'|'loot'|'disaster'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timer, setTimer] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);
  const lootRef = useRef<boolean>(false);

  const addLog = useCallback((text: string, type: 'kill'|'loot'|'disaster') => {
    setActionFeed(p => [{id: Math.random().toString(), text, type}, ...p].slice(0, 10));
  }, []);

  const startGame = () => {
    if (Object.keys(players).length < 2) {
       addLog('نحتاج لاعبين على الأقل للبدء!', 'disaster');
       return;
    }
    if (soundEnabled) playSound('click');
    setMode('playing');
    setTimer(0);
    processedMessageIds.current.clear();
  };

  useEffect(() => {
    if (mode === 'playing') {
      intervalRef.current = window.setInterval(() => {
        setTimer(t => {
          const nt = t + 1;

          if (nt > 0 && nt % 40 === 0 && !lootRef.current) {
             lootRef.current = true;
             addLog(`🎁 صندوق غنائم نزل في الساحة! اكتب !grab لأخذه!`, 'loot');
          }

          // Safe Zone damage every 5 seconds
          if (nt > 0 && nt % 5 === 0) {
             setPlayers(prev => {
                let changed = false;
                const next = { ...prev };
                const now = Date.now();
                Object.keys(next).forEach(uname => {
                   if (!next[uname].isDead && now - next[uname].lastAction > 20000) {
                      next[uname].hp -= 5;
                      changed = true;
                      if (next[uname].hp <= 0) {
                         next[uname].hp = 0;
                         next[uname].isDead = true;
                         addLog(`💀 ${uname} مات بسبب منطقة الخطر! (خمول)`, 'kill');
                      }
                   }
                });
                if (changed && nt % 15 === 0) addLog(`🌩️ منطقة الخطر تضيق! أصحاب الخمول يتلقون ضرراً!`, 'disaster');
                return changed ? next : prev;
             });
          }

          // Disaster every 30 seconds
          if (nt > 0 && nt % 30 === 0) {
             const disaster = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
             if (soundEnabled) playSound('disaster');
             addLog(`⚠️ كارثة! ${disaster.name} تضرب الساحة! (-${disaster.damage} HP)`, 'disaster');
             
             setPlayers(prev => {
                const next = { ...prev };
                Object.keys(next).forEach(uname => {
                   if (!next[uname].isDead) {
                     next[uname].hp -= disaster.damage;
                     if (next[uname].hp <= 0) {
                        next[uname].hp = 0;
                        next[uname].isDead = true;
                        addLog(`💀 ${uname} مات بسبب الكارثة!`, 'kill');
                     }
                   }
                });
                return next;
             });
          }
          return nt;
        });
      }, 1000);
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) window.clearInterval(intervalRef.current); };
  }, [mode, addLog, soundEnabled]);

  // Win condition check
  useEffect(() => {
    if (mode === 'playing') {
       const alive = Object.entries(players).filter(([u, p]) => !p.isDead).map(([u]) => u);
       if (alive.length === 1 || alive.length === 0) {
          setWinner(alive[0] || 'لا أحد');
          setMode('game_over');
          if (soundEnabled) playSound('win');
       }
    }
  }, [players, mode, soundEnabled]);

  useEffect(() => {
    if (mode === 'game_over') return;

    const newMsgs = messages.filter(m => !processedMessageIds.current.has(m.id));
    if (newMsgs.length === 0) return;

    newMsgs.forEach(m => processedMessageIds.current.add(m.id));

    setPlayers(prev => {
      let current = { ...prev };
      
      newMsgs.forEach(msg => {
        const text = msg.message.trim().toLowerCase();
        const uname = msg.username;
        
        if (mode === 'lobby' && text === '!join') {
          if (!current[uname]) {
            current[uname] = { hp: 100, weapon: null, kills: 0, isDead: false, attackCooldowns: {}, lastAction: Date.now(), lastHeal: 0 };
            if (soundEnabled) playSound('join');
          }
        } else if (mode === 'playing') {
          const p = current[uname];
          if (!p || p.isDead) return;

          if (text === '!grab' && lootRef.current) {
             lootRef.current = false;
             const w = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
             current[uname] = { ...p, weapon: w, attackCooldowns: {}, lastAction: Date.now() };
             addLog(`🎒 ${uname} التقط الغنائم: ${w.name} ${w.emoji}! (تم تصفير وقت الانتظار)`, 'loot');
             if (soundEnabled) playSound('loot');
             return;
          }

          if (text === '!heal') {
             const now = Date.now();
             if (now - (p.lastHeal || 0) < 30000) {
                 return; // 30s cooldown
             }
             current[uname] = { ...p, hp: Math.min(100, p.hp + 25), lastHeal: now, lastAction: now };
             addLog(`💊 ${uname} عالج نفسه! (+25 HP)`, 'loot');
             if (soundEnabled) playSound('loot');
             return;
          }

          if (text === '!loot') {
             current[uname].lastAction = Date.now();
             if (Math.random() > 0.3 || !p.weapon) {
                const w = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
                current[uname] = { ...p, weapon: w };
                addLog(`🎒 ${uname} وجد ${w.name} ${w.emoji}`, 'loot');
                if (soundEnabled) playSound('loot');
             }
          } else if (text.startsWith('!attack ')) {
             const target = text.replace('!attack ', '').replace('@', '').trim();
             if (target && target !== uname && current[target] && !current[target].isDead) {
                const now = Date.now();
                const lastAttack = current[uname].attackCooldowns[target] || 0;
                
                if (now - lastAttack < 15000) {
                   // still in cooldown
                   return;
                }

                // Miss chance
                if (Math.random() < 0.25) { // 25% miss chance
                   current[uname].attackCooldowns[target] = now;
                   addLog(`💨 أخطأ ${uname} هدفه ${target}! (متاح بعد 15ث)`, 'loot');
                   return;
                }

                const dmgBase = p.weapon ? p.weapon.damage : 2;
                const dmgMod = dmgBase + Math.floor(Math.random() * 10) - 5;
                let finalDmg = Math.max(1, dmgMod);
                
                let isCrit = false;
                if (Math.random() < 0.1) { // 10% critical
                   finalDmg *= 3;
                   isCrit = true;
                }
                
                current[target].hp -= finalDmg;
                current[uname].attackCooldowns[target] = now; // Set cooldown even if successful
                current[uname].lastAction = now;

                if (soundEnabled) playSound('hit');

                if (isCrit) {
                   addLog(`💥 ضربة حرجة! ${uname} ضرب ${target} بقوة مرعبة! (-${finalDmg})`, 'kill');
                }
                
                if (current[target].hp <= 0) {
                   current[target].hp = 0;
                   current[target].isDead = true;
                   current[uname].kills += 1;
                   addLog(`⚔️ ${uname} قتل ${target}! (${p.weapon?.emoji || '👊'})`, 'kill');
                   if (soundEnabled) playSound('death');
                }
             }
          }
        }
      });
      return current;
    });
  }, [messages, mode, soundEnabled, addLog]);

  const alivePlayers = Object.entries(players).filter(([_, p]) => !p.isDead);
  const deadPlayers = Object.entries(players).filter(([_, p]) => p.isDead);

  return (
    <div className="flex w-full h-full gap-8 bg-black/50 overflow-hidden font-arabic" dir="rtl">
      <div className="flex-1 rounded-[40px] border border-orange-500/20 bg-black/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
        
        <AnimatePresence>
          {mode === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-black/90 to-black overflow-y-auto">
              <Skull className="w-24 h-24 text-orange-500 mb-6 drop-shadow-[0_0_30px_rgba(249,115,22,0.5)]" />
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">المعركة <span className="text-orange-500">الملكية</span></h1>
              <p className="text-orange-200/60 text-xl font-medium mb-8 max-w-3xl text-center">
                مرحباً بك في ساحة المعركة! الهدف هو أن تكون آخر من يبقى حياً. البقاء للأقوى!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mb-8 w-full">
                <div className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">!join</div>
                   <div className="text-white/80 text-sm">للانضمام إلى اللعبة (100 نقطة صحة).</div>
                </div>
                <div className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">!loot</div>
                   <div className="text-white/80 text-sm">للبحث عن أسلحة أفضل من يديك.</div>
                </div>
                <div className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">!attack @اسم</div>
                   <div className="text-white/80 text-sm">لمهاجمة لاعب آخر. (15 ثانية انتظار). يمكن أن تفوت الهدف بنسبة 25٪ وضربة حرجة بنسبة 10٪.</div>
                </div>
                <div className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">!heal</div>
                   <div className="text-white/80 text-sm">لتعافي 25 نقطة صحة. (30 ثانية انتظار).</div>
                </div>
                <div className="bg-black/50 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">!grab</div>
                   <div className="text-white/80 text-sm">لالتقاط الإمدادات العشوائية عند ظهورها (تُصفر الانتظار).</div>
                </div>
                <div className="bg-orange-900/30 border border-orange-500/30 p-4 rounded-2xl">
                   <div className="font-bold text-orange-400 mb-1 text-lg">تنبيهات هامة</div>
                   <div className="text-white/80 text-sm">هناك كوارث تصيب الجميع كل 30 ثانية. والجلوس بدون حركة لـ 20 ثانية يسبب ضرر المنطقة الخضراء!</div>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-6">
                اللاعبون المنضمون: <span className="text-orange-500">{Object.keys(players).length}</span>
              </div>

              <div className="flex gap-4 z-30 relative">
                 <button onClick={startGame} className="bg-orange-600 hover:bg-orange-500 text-white font-black px-12 py-4 rounded-full text-2xl transition-all shadow-[0_0_40px_rgba(234,88,12,0.4)] cursor-pointer hover:scale-105">
                   بدء المعركة الطاحنة
                 </button>
              </div>

              <div className="absolute top-8 left-8 flex items-center gap-4">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-white/50 hover:text-orange-500 transition-colors p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
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
          <div className="p-6 flex justify-between items-center z-10 border-b border-orange-500/10 bg-black/40">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/30">
                <Crosshair className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">ساحة المعركة</h2>
                <div className="text-orange-500/70 font-bold text-sm">الأحياء: {alivePlayers.length} / الأموات: {deadPlayers.length}</div>
              </div>
            </div>
            
            <div className={`flex items-center gap-3 px-6 py-2 rounded-xl border-2 ${timer > 0 && timer % 30 < 5 ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' : 'bg-black/50 border-orange-500/30 text-orange-500'}`}>
              <Timer className="w-5 h-5" />
              <span className="text-2xl font-mono font-black">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="p-3 bg-black/50 rounded-xl border border-white/10 text-white/50 hover:text-orange-400 cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button onClick={onLeave} className="p-3 bg-black/50 rounded-xl border border-white/10 text-white/50 hover:text-red-400 cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
            </div>
          </div>
        )}

        {mode === 'playing' && (
          <div className="flex-1 flex gap-6 p-6 overflow-hidden z-10">
            {/* Grid of Players */}
            <div className="flex-1 bg-black/30 rounded-3xl border border-white/5 p-6 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <AnimatePresence>
                     {Object.entries(players).sort((a,b) => b[1].hp - a[1].hp).map(([uname, p]) => (
                        <motion.div layout key={uname} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: p.isDead ? 0.4 : 1, scale: 1, filter: p.isDead ? 'grayscale(1)' : 'grayscale(0)' }} className={`p-4 rounded-2xl border ${p.isDead ? 'bg-black/80 border-red-900/50' : 'bg-black/60 border-orange-500/20'} relative overflow-hidden`}>
                           {p.hp <= 30 && !p.isDead && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                           <div className="flex justify-between items-start mb-2 relative z-10">
                              <span className="font-bold text-lg text-white truncate max-w-[70%]">{uname}</span>
                              <span className="text-2xl">{p.isDead ? '💀' : (p.weapon?.emoji || '👊')}</span>
                           </div>
                           <div className="flex items-center gap-2 mb-2 relative z-10">
                              <Heart className={`w-4 h-4 ${p.isDead ? 'text-zinc-600' : 'text-red-500'}`} />
                              <div className="flex-1 h-3 bg-black rounded-full overflow-hidden border border-white/10">
                                 <motion.div className={`h-full ${p.hp > 50 ? 'bg-green-500' : p.hp > 20 ? 'bg-orange-500' : 'bg-red-500'}`} animate={{ width: `${Math.max(0, p.hp)}%` }} />
                              </div>
                              <span className="text-xs font-mono font-bold w-8 text-right text-white/70">{Math.floor(p.hp)}</span>
                           </div>
                           <div className="text-xs font-bold text-orange-500/50 relative z-10">
                              تصفيات: {p.kills} | {p.weapon ? p.weapon.name : 'بدون سلاح'}
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            </div>

            {/* Kill Feed */}
            <div className="w-80 bg-black/40 border border-orange-500/10 rounded-3xl p-4 flex flex-col shadow-xl">
               <h3 className="text-zinc-500 font-bold mb-4 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                 <Zap className="w-4 h-4" /> سجل الأحداث
               </h3>
               <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
                  <AnimatePresence>
                    {actionFeed.map(feed => (
                      <motion.div key={feed.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`px-4 py-3 rounded-xl font-bold flex flex-col ${feed.type === 'kill' ? 'bg-red-500/20 text-red-200 border-l-4 border-l-red-500' : feed.type === 'loot' ? 'bg-blue-500/20 text-blue-200' : 'bg-orange-500/20 text-orange-200 border-l-4 border-l-orange-500'}`}>
                        <span className="text-sm leading-tight">{feed.text}</span>
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
              <Crown className="w-40 h-40 text-brand-gold mb-6 drop-shadow-[0_0_50px_rgba(212,175,55,1)]" />
              <h2 className="text-3xl text-brand-gold/80 font-bold mb-2">الفائز الأخير</h2>
              <h1 className="text-7xl font-black text-white mb-8 bg-gradient-to-br from-brand-gold via-yellow-200 to-orange-500 text-transparent bg-clip-text">
                {winner}
              </h1>
              <div className="flex gap-4">
                 <button onClick={() => { setMode('lobby'); setPlayers({}); }} className="mt-8 bg-brand-gold text-black font-black px-12 py-4 rounded-full hover:scale-105 transition-transform text-xl shadow-[0_0_30px_rgba(212,175,55,0.4)] cursor-pointer">
                   إعادة المباراة
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {mode !== 'lobby' && (
        <div className="w-80 h-full flex flex-col bg-black/60 backdrop-blur-xl rounded-[40px] border border-orange-500/20 overflow-hidden shadow-2xl shrink-0">
          <TwitchChat channelName={channelName} messages={messages} isConnected={isConnected} error={error} />
        </div>
      )}
    </div>
  );
}
