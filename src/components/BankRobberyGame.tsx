import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Timer, Lock, Unlock, AlertTriangle, Users, Trophy, Crosshair, Bomb, Banknote, XCircle, HandCoins, Activity, Siren, DoorClosed, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage } from '../types';
import { TwitchChat } from './TwitchChat';

interface BankRobberyProps {
  messages?: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

type Mode = 'lobby' | 'coop' | 'pvp' | 'game_over';

interface PlayerState {
  money: number;
  jailTime: number;
  escaped: boolean;
  shields: number;
  contribs: number;
}

// Simple Web Audio API Synthesizer for high-tier game sounds
const playSound = (type: 'alarm' | 'success' | 'fail' | 'hit' | 'cash' | 'click', volumeLevel = 0.5) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'alarm') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(volumeLevel * 0.3, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volumeLevel * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'cash') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.setValueAtTime(1600, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(volumeLevel * 0.4, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(volumeLevel * 0.4, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(volumeLevel * 0.4, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(volumeLevel * 0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    // Ignore if audio context fails
  }
};

export function BankRobberyGame({ messages = [], onLeave, channelName, isConnected, error }: BankRobberyProps) {
  const [mode, setMode] = useState<Mode>('lobby');
  const [gameType, setGameType] = useState<'coop'|'pvp'>('coop');
  const [timeLeft, setTimer] = useState(180);
  const [vaultHP, setVaultHP] = useState(1000000);
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const [actionFeed, setActionFeed] = useState<{id: string, text: string, type: 'good'|'bad'|'neutral'}[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const processedMessageIds = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);

  const isAlarmPhase = gameType === 'pvp' && timeLeft <= 30 && timeLeft > 0;

  useEffect(() => {
    if (isAlarmPhase && soundEnabled && timeLeft % 2 === 0) {
      playSound('alarm');
    }
  }, [timeLeft, isAlarmPhase, soundEnabled]);

  const startGame = (selectedMode: 'coop'|'pvp') => {
    if (soundEnabled) playSound('click');
    setGameType(selectedMode);
    setMode(selectedMode);
    setTimer(selectedMode === 'coop' ? 180 : 180);
    setVaultHP(1000000);
    setPlayers({});
    setActionFeed([]);
    processedMessageIds.current.clear();
  };

  const addLog = useCallback((text: string, type: 'good'|'bad'|'neutral') => {
    setActionFeed(p => [{id: Math.random().toString(), text, type}, ...p].slice(0, 8));
  }, []);

  useEffect(() => {
    if (mode === 'lobby' || mode === 'game_over') {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setTimer(p => {
        if (p <= 1) {
          window.clearInterval(timerRef.current!);
          setMode('game_over');
          if (soundEnabled) playSound('success');
          return 0;
        }
        return p - 1;
      });

      setPlayers(prev => {
        let changed = false;
        const next = { ...prev };
        Object.keys(next).forEach(username => {
          if (next[username].jailTime > 0) {
            changed = true;
            next[username] = { ...next[username], jailTime: next[username].jailTime - 1 };
            if (next[username].jailTime === 0) {
              addLog(`${username} خرج من السجن!`, 'neutral');
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [mode, addLog, soundEnabled]);

  // Handle messages concurrently avoiding stale state
  useEffect(() => {
    if (mode === 'lobby' || mode === 'game_over') return;

    const newMessages = messages.filter(msg => !processedMessageIds.current.has(msg.id));
    if (newMessages.length === 0) return;

    newMessages.forEach(msg => processedMessageIds.current.add(msg.id));

    setPlayers(prevPlayers => {
      let currentPlayers = { ...prevPlayers };
      let vaultDamage = 0;
      
      newMessages.forEach(msg => {
        const text = msg.message.trim().toLowerCase();
        const username = msg.username;
        const pState = currentPlayers[username] || { money: 0, jailTime: 0, escaped: false, shields: 0, contribs: 0 };
        
        if (pState.escaped) return;
        if (pState.jailTime > 0) return;

        if (gameType === 'coop') {
          let dmg = 0;
          if (text === '!hack') dmg = 5000 + Math.floor(Math.random() * 5000);
          else if (text === '!drill') dmg = 8000 + Math.floor(Math.random() * 8000);
          else if (text === '!cut') dmg = 10000 + Math.floor(Math.random() * 2000);

          if (dmg > 0) {
            vaultDamage += dmg;
            currentPlayers[username] = { ...pState, contribs: pState.contribs + dmg };
            if (soundEnabled && Math.random() > 0.7) playSound('hit');
          }
        }
        else if (gameType === 'pvp') {
          if (text === '!escape' && isAlarmPhase) {
            currentPlayers[username] = { ...pState, escaped: true };
            addLog(`وفر ${username} للهروب بـ $${pState.money}! `, 'good');
            if (soundEnabled) playSound('success');
          }
          else if (text === '!rob' && !isAlarmPhase) {
            const risk = Math.random();
            if (risk < 0.15) {
               const lost = Math.floor(pState.money * 0.5);
               currentPlayers[username] = { ...pState, money: pState.money - lost, jailTime: 15 };
               addLog(` ألقت الشرطة القبض على ${username}! خسر $${lost}`, 'bad');
               if (soundEnabled) playSound('fail');
            } else {
               const gain = Math.floor(Math.random() * 3000) + 1000;
               currentPlayers[username] = { ...pState, money: pState.money + gain };
               if (soundEnabled && Math.random() > 0.8) playSound('cash');
            }
          }
          else if (text.startsWith('!steal ') && !isAlarmPhase) {
            const target = text.replace('!steal ', '').replace('@', '').trim();
            if (target && target !== username && currentPlayers[target] && !currentPlayers[target].escaped) {
               const tState = currentPlayers[target];
               if (tState.shields > 0) {
                 currentPlayers[target] = { ...tState, shields: 0 };
                 currentPlayers[username] = { ...pState, jailTime: 10 };
                 addLog(` درع ${target} صد هجوم ${username}! (${username} في السجن)`, 'neutral');
                 if (soundEnabled) playSound('hit');
               } else {
                 const risk = Math.random();
                 if (risk < 0.3) {
                   currentPlayers[username] = { ...pState, jailTime: 10 };
                   addLog(` فشل ${username} في سرقة ${target} ودخل السجن!`, 'bad');
                   if (soundEnabled) playSound('fail');
                 } else {
                   const stolen = Math.floor(tState.money * 0.25);
                   if (stolen > 0) {
                     currentPlayers[target] = { ...tState, money: tState.money - stolen };
                     currentPlayers[username] = { ...pState, money: pState.money + stolen };
                     addLog(` سرق ${username} $${stolen} من ${target}!`, 'neutral');
                     if (soundEnabled) playSound('cash');
                   }
                 }
               }
            }
          }
          else if (text === '!defend' && !isAlarmPhase) {
            currentPlayers[username] = { ...pState, shields: 1 };
          }
        }
      });
      
      if (vaultDamage > 0) {
        setVaultHP(hp => {
          const nhp = Math.max(0, hp - vaultDamage);
          if (nhp === 0 && hp > 0) {
            setMode('game_over');
            if (soundEnabled) playSound('success');
          }
          return nhp;
        });
      }

      return currentPlayers;
    });

  }, [messages, mode, gameType, isAlarmPhase, addLog, soundEnabled]);

  const topPlayers = Object.entries(players)
    .map(([username, s]) => ({ username, ...s }))
    .sort((a, b) => gameType === 'coop' ? b.contribs - a.contribs : b.money - a.money)
    .slice(0, 10);

  return (
    <div className="flex w-full h-full gap-8 bg-black/50 overflow-hidden font-arabic" dir="rtl">
      <div className="flex-1 rounded-[40px] border border-brand-gold/20 bg-black/80 backdrop-blur-xl flex flex-col relative overflow-hidden">
        
        <AnimatePresence>
          {mode === 'lobby' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-black/80 to-black">
              <div className="w-32 h-32 mb-6 bg-brand-gold/10 rounded-3xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
                <Banknote className="w-16 h-16 text-brand-gold" />
              </div>
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">سرقة <span className="text-brand-gold">البنوك</span></h1>
              <p className="text-brand-gold/60 text-xl font-medium mb-12 max-w-2xl text-center">
                اختار نوع العملية: هل ستتعاونون لاختراق الخزنة الكبرى أم تتصارعون لسرقة بعضكم البعض قبل وصول الشرطة
              </p>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
                <button onClick={() => startGame('coop')} className="group flex flex-col items-center p-8 rounded-[40px] bg-gradient-to-b from-blue-900/40 to-black border-2 border-blue-500/20 hover:border-blue-400 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all cursor-pointer">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">المهمة التعاونية</h2>
                  <p className="text-blue-200/50 text-center font-medium">كسر الخزنة معا باستخدام !hack و !drill</p>
                </button>
                <button onClick={() => startGame('pvp')} className="group flex flex-col items-center p-8 rounded-[40px] bg-gradient-to-b from-red-900/40 to-black border-2 border-red-500/20 hover:border-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.3)] transition-all cursor-pointer">
                  <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Crosshair className="w-10 h-10 text-red-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">صراع اللصوص</h2>
                  <p className="text-red-200/50 text-center font-medium">اسرق البنك أو اصدقائك باستخدام !rob و !steal</p>
                </button>
              </div>

              <div className="absolute top-8 right-8 flex items-center gap-4">
                <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-white/50 hover:text-brand-gold transition-colors p-3 bg-white/5 rounded-xl border border-white/10 hover:border-brand-gold/30">
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
                <button onClick={onLeave} className="text-white/50 hover:text-white flex items-center gap-2 font-bold px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                  <XCircle className="w-5 h-5" /> إلغاء
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {mode !== 'lobby' && (
          <div className="p-8 pb-4 flex justify-between items-center z-10 border-b border-brand-gold/10 bg-black/40">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30">
                {gameType === 'coop' ? <Lock className="w-8 h-8 text-blue-400" /> : <AlertTriangle className="w-8 h-8 text-red-500" />}
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {gameType === 'coop' ? 'اختراق الخزنة' : 'صراع اللصوص (PvP)'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Activity className="w-4 h-4 text-brand-gold/50" />
                  <span className="text-brand-gold/70 font-semibold text-lg">
                    {mode === 'game_over' ? 'انتهت العملية' : 'جاري التنفيذ...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-8">
              <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${isAlarmPhase || timeLeft < 10 ? 'bg-red-500/20 border-red-500 animate-pulse text-red-400' : 'bg-black/50 border-brand-gold/30 text-brand-gold'}`}>
                <Timer className="w-6 h-6" />
                <span className="text-3xl font-mono font-black font-numeric">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className="text-white/50 hover:text-brand-gold transition-colors p-3 bg-black/50 rounded-xl border border-white/10 hover:border-brand-gold/30 cursor-pointer">
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>
              <button onClick={onLeave} className="text-white/50 hover:text-red-400 transition-colors p-3 bg-black/50 rounded-xl border border-white/10 hover:border-red-500/30 cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {mode !== 'lobby' && (
          <div className="flex-1 flex gap-6 p-8 overflow-hidden z-10">
            <div className="flex-1 flex flex-col items-center justify-center relative bg-black/30 rounded-3xl border border-white/5 p-8 overflow-hidden shadow-inner">
              
              {isAlarmPhase && (
                <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-0">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent animate-ping" />
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600 border border-red-400 text-white font-black px-12 py-3 rounded-full flex items-center gap-4 shadow-[0_0_30px_rgba(220,38,38,0.8)] z-10">
                    <Siren className="w-8 h-8 animate-spin" />
                    الشرطة في الطريق! اكتب !escape للهروب!
                    <Siren className="w-8 h-8 animate-spin" />
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                {gameType === 'coop' ? (
                  <>
                    <div className="relative mb-12">
                      <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 ${vaultHP <= 0 ? 'bg-green-500/20 border-green-500' : 'bg-black border-brand-gold shadow-[0_0_80px_rgba(212,175,55,0.4)]'}`}>
                        {vaultHP <= 0 ? <Unlock className="w-32 h-32 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,1)]" /> : <DoorClosed className="w-32 h-32 text-brand-gold drop-shadow-[0_0_15px_rgba(212,175,55,1)]" />}
                      </div>
                    </div>
                    <div className="w-full max-w-2xl text-center">
                      <div className="flex justify-between text-brand-gold mb-2 font-bold text-xl font-numeric">
                        <span>HP</span>
                        <span>{Math.floor(vaultHP).toLocaleString()} / 1,000,000</span>
                      </div>
                      <div className="h-8 bg-black/80 rounded-full border border-brand-gold/30 p-1 overflow-hidden shadow-inner flex">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-green-500 rounded-full"
                          initial={{ width: '100%' }}
                          animate={{ width: `${Math.max(0, (vaultHP / 1000000) * 100)}%` }}
                          transition={{ type: "spring" }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative mb-12">
                      <div className="w-64 h-64 rounded-full bg-brand-gold/5 border-4 border-brand-gold/50 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(212,175,55,0.2)]">
                         <HandCoins className="w-24 h-24 text-brand-gold mb-4" />
                         <span className="text-4xl font-black text-brand-gold font-numeric">$$$</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {gameType === 'pvp' && (
                <div className="w-full max-w-2xl mt-12 bg-black/60 border border-white/10 rounded-3xl p-6 relative z-10 h-64 overflow-hidden">
                  <h3 className="text-zinc-500 font-bold mb-4 uppercase tracking-widest text-sm">سجل العمليات</h3>
                  <div className="flex flex-col gap-3">
                    <AnimatePresence>
                      {actionFeed.map(feed => (
                        <motion.div 
                          key={feed.id} 
                          initial={{ opacity: 0, x: -20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`px-4 py-3 rounded-xl font-bold flex items-center gap-3 ${
                            feed.type === 'good' ? 'bg-green-500/20 text-green-300' :
                            feed.type === 'bad' ? 'bg-red-500/20 text-red-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          <span className="text-lg">{feed.text}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            <div className="w-[400px] bg-black/40 border border-brand-gold/10 rounded-3xl p-6 flex flex-col shadow-xl z-10">
              <div className="flex items-center gap-3 mb-6 bg-brand-gold/10 p-4 rounded-2xl border border-brand-gold/20">
                <Trophy className="w-6 h-6 text-brand-gold" />
                <h3 className="text-xl font-black text-brand-gold tracking-wider">
                  {gameType === 'coop' ? 'أفضل المخترقين' : 'أغنى اللصوص'}
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                <AnimatePresence>
                  {topPlayers.map((p, i) => {
                    const isJailed = p.jailTime > 0;
                    const isEscaped = p.escaped;
                    return (
                      <motion.div
                        key={p.username}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-xl flex items-center justify-between border transition-colors ${
                          i === 0 ? 'bg-brand-gold/20 border-brand-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]' :
                          isEscaped ? 'bg-green-900/30 border-green-500/30 opacity-70' :
                          isJailed ? 'bg-red-900/30 border-red-500/30 opacity-70' :
                          'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                            i === 0 ? 'bg-brand-gold text-black' : 'bg-black/50 text-white/50'
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex flex-col">
                            <span className={`font-bold ${i === 0 ? 'text-brand-gold' : 'text-white'}`}>
                              {p.username} {p.shields > 0 && <Shield className="w-3 h-3 inline text-blue-400 ml-1" />}
                            </span>
                            {isJailed && <span className="text-xs text-red-500 font-bold">في السجن ({p.jailTime}ث)</span>}
                            {isEscaped && <span className="text-xs text-green-400 font-bold">هرب بأمان</span>}
                          </div>
                        </div>
                        <span className={`font-black text-lg font-numeric ${
                          i === 0 ? 'text-brand-gold' : isEscaped ? 'text-green-400' : isJailed ? 'text-red-400' : 'text-brand-gold/80'
                        }`}>
                          ${gameType === 'coop' ? p.contribs.toLocaleString() : p.money.toLocaleString()}
                        </span>
                      </motion.div>
                    );
                  })}
                  {topPlayers.length === 0 && (
                    <div className="text-center text-white/30 py-8 font-medium">لا يوجد أي نشاط حتى الآن...</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {mode === 'game_over' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8">
              <div className="mb-8">
                {gameType === 'coop' ? (
                   vaultHP <= 0 ? <Trophy className="w-40 h-40 text-brand-gold drop-shadow-[0_0_50px_rgba(212,175,55,1)]" /> : <Lock className="w-40 h-40 text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,1)]" />
                ) : (
                   <Banknote className="w-40 h-40 text-green-500 drop-shadow-[0_0_50px_rgba(34,197,94,1)]" />
                )}
              </div>
              <h2 className="text-5xl font-black text-white mb-4">
                {gameType === 'coop' ? (vaultHP <= 0 ? 'تم اختراق الخزنة بنجاح!' : 'فشلت المهمة!') : 'انتهت العملية!'}
              </h2>
              <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mt-8">
                <h3 className="text-2xl font-bold text-center mb-6 text-brand-gold">النتائج النهائية</h3>
                <div className="space-y-3">
                  {topPlayers.slice(0, 5).map((p, i) => (
                    <div key={p.username} className="flex justify-between items-center bg-black/50 p-4 rounded-xl border border-brand-gold/20">
                      <span className="font-bold text-white text-lg">#{i+1} {p.username} {(gameType === 'pvp' && !p.escaped) && '(مقبوض عليه!)'}</span>
                      <span className="font-black text-brand-gold text-xl font-numeric">
                        ${gameType === 'coop' ? p.contribs.toLocaleString() : (p.escaped ? p.money.toLocaleString() : Math.floor(p.money/2).toLocaleString())}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setMode('lobby')} className="mt-10 bg-brand-gold text-black font-black px-12 py-4 rounded-full hover:scale-105 transition-transform text-xl shadow-[0_0_30px_rgba(212,175,55,0.4)] cursor-pointer">
                العودة للقائمة
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {mode !== 'lobby' && (
        <div className="w-80 h-full flex flex-col bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl shrink-0">
          <TwitchChat
            channelName={channelName}
            messages={messages}
            isConnected={isConnected}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
