import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Timer, Lock, Unlock, AlertTriangle, Users, Trophy, Bomb, Banknote, Siren, Crown, DoorClosed, Volume2, VolumeX, HandCoins } from "lucide-react";
import { socket } from '../socket';
import { QRCodeSVG } from 'qrcode.react';

  export const BankRobberyGame: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
    const [roomId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
    const [gameState, setGameState] = useState<any>(null);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [heistAlert, setHeistAlert] = useState<'success' | 'alarm' | null>(null);  // Sounds
  const playSound = useCallback((type: 'alarm' | 'success' | 'fail' | 'click') => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      switch(type) {
        case 'alarm':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(400, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
          osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.6);
          gain.gain.setValueAtTime(0.5, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
          osc.start(); osc.stop(ctx.currentTime + 1);
          break;
        case 'success':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start(); osc.stop(ctx.currentTime + 0.5);
          break;
        case 'fail':
          osc.type = 'square';
          osc.frequency.setValueAtTime(300, ctx.currentTime);
          osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.5);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
          osc.start(); osc.stop(ctx.currentTime + 0.5);
          break;
      }
    } catch(e) {}
  }, [soundEnabled]);

  useEffect(() => {
    socket.emit('br_host_lobby', { roomId });

    socket.on('br_state_update', (state) => {
      setGameState(state);
    });

      socket.on('br_heist_result', ({ alarms, success, totalSuccess, totalFails }) => {
        if (success) {
          setHeistAlert('success');
          playSound('success'); // Fallback/additional synth
        } else {
          setHeistAlert('alarm');
          const siren = new Audio('/policesiren.mp3');
          if (soundEnabled) siren.play().catch(e => console.error(e));
        }

        setTimeout(() => {
          setHeistAlert(null);
        }, 5000);
      });    return () => {
      socket.off('br_state_update');
      socket.off('br_heist_result');
    };
  }, [roomId, playSound]);

  const startGame = () => {
    playSound('success');
    socket.emit('br_start_game', roomId);
  };

  const joinUrl = `${window.location.protocol}//${window.location.host}/br/${roomId}`;

  if (!gameState) {
    return <div className="text-white text-center p-12">يتم تجهيز البنك...</div>;
  }

  const { status, players, mastermindId, roundHeists, currentTeam, votes, heistVotesCount, heistResults } = gameState;

  const successes = roundHeists.filter((h: boolean) => h === true).length;
  const fails = roundHeists.filter((h: boolean) => h === false).length;

  return (
    <div className="absolute inset-0 bg-brand-black/90 overflow-hidden font-sans border-t-4 border-brand-cyan/50 rounded-2xl shadow-[0_0_50px_rgba(0,229,255,0.15)] flex flex-col" dir="rtl">
      
      {/* Background elements to match the site themes */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <div className="flex justify-between items-center p-6 bg-brand-black/60 border-b border-brand-cyan/20 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Banknote className="text-brand-pink w-10 h-10 drop-shadow-[0_0_10px_rgba(255,0,128,0.5)]" />
          <h1 className="text-3xl font-black text-brand-pink tracking-wider glow-cyan-text">شرطي حرامي</h1>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 bg-brand-cyan/10 border border-brand-cyan/50 rounded-xl text-brand-cyan font-bold text-xl flex gap-2 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            تمت السرقة: {successes}/3
          </div>
          <div className="px-6 py-2 bg-brand-pink/10 border border-brand-pink/50 rounded-xl text-brand-pink font-bold text-xl flex gap-2 shadow-[0_0_15px_rgba(255,0,128,0.2)]">
            جرس الإنذار: {fails}/3
          </div>
        </div>
        <button onClick={onLeave} className="text-brand-pink/70 hover:text-brand-pink transition-colors bg-brand-pink/5 hover:bg-brand-pink/20 p-3 rounded-xl border border-brand-pink/20 hover:border-brand-pink/50">
          <DoorClosed size={32} />
        </button>
      </div>

      <div className="p-8 h-[calc(100%-100px)] overflow-y-auto w-full max-w-6xl mx-auto flex flex-col items-center relative z-10 custom-scrollbar">

        {/* === LOBBY === */}
        {status === 'lobby' && (
          <div className="flex flex-col md:flex-row w-full gap-8 h-full">
            <div className="flex-1 bg-brand-black/60 p-8 rounded-[40px] border border-brand-cyan/30 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.1)] relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent pointer-events-none" />
              <h2 className="text-4xl font-black text-white mb-6 text-center tracking-tight">امسح الكود وادخل كحرامي!</h2>
              
              <div className="bg-white p-4 rounded-3xl border-4 border-brand-cyan shadow-[0_0_30px_rgba(0,229,255,0.3)] transform transition-transform hover:scale-105">
                <QRCodeSVG value={joinUrl} size={280} level="H" />
              </div>
              
              <div className="mt-8 bg-brand-black/80 px-8 py-4 rounded-2xl text-brand-cyan font-bold text-2xl border border-brand-cyan/40 shadow-[0_0_20px_rgba(0,229,255,0.2)] flex items-center gap-3" dir="ltr">
                <span className="text-brand-cyan/50 text-xl font-mono relative">
                   <div className="w-3 h-3 bg-brand-pink rounded-full absolute -left-6 top-2 animate-ping" />
                   <div className="w-3 h-3 bg-brand-pink rounded-full absolute -left-6 top-2" />
                </span>
                <span className="font-mono text-white">{joinUrl.replace('http://', '').replace('https://', '')}</span>
              </div>

              {players.length >= 3 && (
                <button
                  onClick={startGame}
                  className="mt-10 px-16 py-5 bg-brand-cyan hover:bg-brand-pink text-brand-black font-black text-2xl rounded-2xl transition-all duration-300 shadow-[0_10px_20px_rgba(0,229,255,0.3)] hover:shadow-[0_10px_20px_rgba(255,0,128,0.3)] hover:scale-105 active:scale-95"
                >
                  بدء اللعبة!
                </button>
              )}
              {players.length < 3 && (
                <p className="mt-8 text-neutral-400 font-bold text-lg">بانتظار انضمام 3 لاعبين على الأقل...</p>
              )}

              <div className="mt-8 bg-brand-black/40 border border-brand-cyan/20 p-5 rounded-3xl w-full max-w-xl shadow-inner">
                <h3 className="text-xl font-bold text-brand-pink mb-2 flex items-center justify-center gap-2">
                  <Shield className="w-6 h-6" />
                  طريقة اللعب
                </h3>
                <p className="text-brand-cyan/80 text-lg leading-relaxed text-center font-medium">
                  لعبة خداع وتصويت! امسح الكود لتصبح جزءاً من العصابة. إذا كنت <span className="text-emerald-400 font-bold">لصاً</span>، حاول سرقة الخزنات وتجنب جرس الإنذار. أما إذا كنت <span className="text-blue-400 font-bold">شرطياً متخفياً</span>، فحاول تمرير الإنذارات وإفشال المهمة دون أن تثير الشبهات!
                </p>
              </div>
            </div>

            <div className="w-1/3 bg-brand-black/60 p-6 rounded-[40px] border border-brand-cyan/20 shadow-[0_0_20px_rgba(0,229,255,0.05)] relative overflow-hidden backdrop-blur-sm flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-cyan/5 to-transparent pointer-events-none" />
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
                <Users className="text-brand-cyan w-8 h-8" />
                العصابة ({players.length})
              </h3>
              <div className="space-y-3 relative z-10 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence>
                  {players.map((p: any) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, x: -20 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      className="bg-brand-black/80 p-4 rounded-2xl font-bold text-xl border border-brand-cyan/30 shadow-md text-white flex items-center justify-between group hover:border-brand-cyan transition-colors"
                      key={p.id}
                    >
                      <span>{p.name}</span>
                      <div className="w-2 h-2 rounded-full bg-brand-cyan/50 group-hover:bg-brand-cyan shadow-[0_0_5px_rgba(0,229,255,0.5)]" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* === ROLE REVEAL === */}
        {status === 'role_reveal' && (
          <div className="text-center w-full flex flex-col items-center justify-center h-full">
            <Lock className="w-32 h-32 text-amber-500 mx-auto mb-8 animate-pulse" />
            <h2 className="text-6xl font-black text-white mb-6">جارٍ توزيع المهام...</h2>
            <p className="text-3xl text-neutral-400">انظروا إلى هواتفكم! لا تدعوا أحداً يرى شاشتكم السرية.</p>
          </div>
        )}

        {/* === PLANNING === */}
        {status === 'planning' && (
          <div className="w-full text-center">
             <Crown className="w-24 h-24 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
             <h2 className="text-5xl font-black text-white mb-4">الزعيم يخطط للسرقة...</h2>
             <p className="text-3xl text-amber-400 font-bold mb-12">
               ({players.find((p:any) => p.id === mastermindId)?.name || 'الزعيم'}) يقوم باختيار فريقه عبر هاتفه!
             </p>

             <div className="flex flex-wrap justify-center gap-4 mt-8">
               {players.map((p:any) => (
                  <div key={p.id} className={`px-6 py-3 rounded-full text-xl font-bold border-2 ${p.id === mastermindId ? 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-neutral-800 border-neutral-700'}`}>
                    {p.name} {p.id === mastermindId && '👑'}
                  </div>
               ))}
             </div>
          </div>
        )}

        {/* === VOTING === */}
        {status === 'voting' && (
           <div className="w-full text-center">
             <h2 className="text-5xl font-black text-white mb-8">التصويت على الفريق!</h2>
             <div className="flex justify-center gap-4 mb-12">
                {currentTeam.map((id:string) => (
                   <div key={id} className="bg-amber-600 px-8 py-4 rounded-xl font-bold text-3xl shadow-lg border-2 border-amber-300 transform rotate-1">
                     {players.find((p:any) => p.id === id)?.name}
                   </div>
                ))}
             </div>
             <p className="text-3xl text-blue-400 font-bold mb-8">
               صوتوا بهواتفكم! هل توافقون على إرسالهم للخزنة؟
             </p>
             
             <div className="w-full max-w-2xl bg-neutral-800 rounded-full h-8 overflow-hidden mx-auto border-2 border-neutral-700 relative">
               <div 
                 className="absolute top-0 right-0 bottom-0 bg-blue-500 transition-all duration-1000 ease-out"
                 style={{ width: `${(Object.keys(votes).length / players.length) * 100}%` }}
               />
             </div>
             <p className="mt-4 text-2xl font-bold text-neutral-400">صَوَّت {Object.keys(votes).length} من {players.length}</p>
           </div>
        )}

        {/* === HEIST === */}
        {status === 'heist' && (
           <div className="w-full text-center flex flex-col items-center">
             <div className="relative">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], rotate: [-2, 2, -2] }} 
                 transition={{ repeat: Infinity, duration: 1.5 }}
               >
                 <Lock className="w-48 h-48 text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]" />
               </motion.div>
             </div>
             <h2 className="text-6xl font-black text-white mt-12 mb-6 tracking-wide">الخزنة تـفـتـح...</h2>
             <p className="text-3xl text-red-400 font-bold">
               الفريق يتخذ قراره الآن! الشرطة فقط يمكنهم دَق الإنذار 🚨
             </p>

             <p className="mt-12 text-3xl font-bold text-emerald-400">
               قرر {heistVotesCount} من {currentTeam.length} أعضاء
             </p>
           </div>
        )}

         {/* === ASSASSINATION === */}
         {status === 'assassination' && (
           <div className="w-full text-center flex flex-col items-center">
             <Siren className="w-32 h-32 text-purple-600 mb-8 animate-spin" />
             <h2 className="text-5xl font-black text-red-500 mb-6 uppercase tracking-widest">تـوَقَّـفـوا !</h2>
             <div className="bg-red-900/40 p-8 rounded-3xl border-2 border-red-500 max-w-3xl">
               <h3 className="text-3xl font-bold text-white mb-4">العصابة سرقت 3 خزنات، ولكن...</h3>
               <p className="text-2xl text-purple-300 leading-relaxed font-bold">
                 الشرطة لديهم فرصة أخيرة لسرقة الفوز! لديهم 60 ثانية للنقاش...<br/><br/>
                 ابحثوا عن "العرّاب" واغتالوه فوراً من هواتفكم!
               </p>
             </div>
           </div>
        )}

        {/* === GAME OVER === */}
        {(status === 'cops_won' || status === 'cops_won_assassination' || status === 'robbers_won') && (
           <div className="w-full text-center pt-12">
             {status === 'robbers_won' ? (
                <>
                  <Banknote className="w-32 h-32 text-emerald-500 mx-auto mb-6" />
                  <h2 className="text-6xl font-black text-emerald-400 mb-4">العصابة تفوز! 💵</h2>
                  <p className="text-2xl text-emerald-200">العراب خدعكم ونجحتم بسرقة البنك بالكامل!</p>
                </>
             ) : (
                <>
                  <Shield className="w-32 h-32 text-blue-500 mx-auto mb-6" />
                  <h2 className="text-6xl font-black text-blue-400 mb-4">الشرطة تفوز! 👮‍♂️</h2>
                  {status === 'cops_won_assassination' && <p className="text-2xl text-red-300 mb-4">نجحوا باغتيال العرّاب في اللحظة الأخيرة!</p>}
                   <p className="text-xl text-neutral-400">الخونة كانوا يعملون بذكاء.</p>
                </>
             )}
             
             <button 
               onClick={startGame}
               className="mt-12 bg-white text-black px-12 py-4 rounded-full font-black text-2xl hover:bg-neutral-200"
             >
               لعب جولة أخرى
             </button>
           </div>
        )}

        {/* --- DYNAMIC ALERTS OVERLAY --- */}
        <AnimatePresence>
          {heistAlert === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-emerald-900/30 backdrop-blur-[2px]"
            >
              <video 
                src="/moneysplash.mp4" 
                autoPlay 
                muted 
                className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-90"
              />
              <motion.div 
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="relative z-10 bg-emerald-600/90 border-4 border-emerald-400 p-12 rounded-[50px] shadow-[0_0_100px_rgba(16,185,129,0.8)] text-center transform -rotate-2"
              >
                <Banknote className="w-32 h-32 text-white mx-auto mb-6 drop-shadow-lg" />
                <h2 className="text-8xl font-black text-white drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">تمت السرقة بنجاح! 💸</h2>
              </motion.div>
            </motion.div>
          )}

          {heistAlert === 'alarm' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-red-900/40 backdrop-blur-[2px]"
            >
              <div className="absolute inset-0 bg-red-600/30 animate-[pulse_0.5s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-blue-600/20 animate-[pulse_0.6s_ease-in-out_infinite_alternate-reverse]" />
              
              <motion.div 
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="relative z-10 bg-red-700/90 border-4 border-white p-12 rounded-[50px] shadow-[0_0_100px_rgba(239,68,68,1)] text-center transform rotate-2"
              >
                <Siren className="w-32 h-32 text-white mx-auto mb-6 animate-spin drop-shadow-lg" />
                <h2 className="text-8xl font-black text-white drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]">إنذار الشرطة! 🚨</h2>
                <p className="text-4xl text-red-200 font-bold mt-4">فشلت السرقة وتم القبض عليكم!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
