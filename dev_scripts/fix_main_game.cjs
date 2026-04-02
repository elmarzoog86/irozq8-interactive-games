const fs = require('fs');
const path = require('path');
const content = `import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Timer, Lock, Unlock, AlertTriangle, Users, Trophy, Bomb, Banknote, Siren, Crown, DoorClosed, Volume2, VolumeX, HandCoins } from "lucide-react";
import { socket } from '../socket';
import QRCode from 'qrcode.react';

export const BankRobberyGame: React.FC<{ onLeave: () => void }> = ({ onLeave }) => {
  const [roomId] = useState(() => Math.random().toString(36).substring(7).toUpperCase());
  const [gameState, setGameState] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sounds
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
        playSound('success');
      } else {
        playSound('alarm');
      }
    });

    return () => {
      socket.off('br_state_update');
      socket.off('br_heist_result');
    };
  }, [roomId, playSound]);

  const startGame = () => {
    playSound('success');
    socket.emit('br_start_game', roomId);
  };

  const joinUrl = \`\${window.location.protocol}//\${window.location.host}/br/\${roomId}\`;

  if (!gameState) {
    return <div className="text-white text-center p-12">يتم تجهيز البنك...</div>;
  }

  const { status, players, mastermindId, roundHeists, currentTeam, votes, heistVotesCount, heistResults } = gameState;

  const successes = roundHeists.filter((h: boolean) => h === true).length;
  const fails = roundHeists.filter((h: boolean) => h === false).length;

  return (
    <div className="absolute inset-0 bg-neutral-900 overflow-hidden font-sans border-t-4 border-red-600 rounded-lg shadow-2xl" dir="rtl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Banknote className="text-emerald-500 w-10 h-10" />
          <h1 className="text-3xl font-black text-white">سرقة البنك 🏦</h1>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-2 bg-emerald-900/50 border border-emerald-500 rounded-xl text-emerald-400 font-bold text-xl flex gap-2">
            تمت السرقة: {successes}/3
          </div>
          <div className="px-6 py-2 bg-red-900/50 border border-red-500 rounded-xl text-red-400 font-bold text-xl flex gap-2">
            جرس الإنذار: {fails}/3
          </div>
        </div>
        <button onClick={onLeave} className="text-red-500 hover:text-red-400 transition-colors">
          <DoorClosed size={32} />
        </button>
      </div>

      <div className="p-8 h-[calc(100%-100px)] overflow-y-auto w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* === LOBBY === */}
        {status === 'lobby' && (
          <div className="flex flex-col md:flex-row w-full gap-8">
            <div className="flex-1 bg-black/40 p-8 rounded-3xl border-2 border-dashed border-red-500/30 flex flex-col items-center justify-center">
              <h2 className="text-4xl font-bold text-white mb-6 text-center">امسح الكود وادخل كحرامي!</h2>
              <div className="bg-white p-4 rounded-2xl">
                <QRCode value={joinUrl} size={250} level="H" />
              </div>
              <div className="mt-8 bg-red-600 px-8 py-3 rounded-full text-white font-bold text-2xl shadow-[0_0_20px_rgba(220,38,38,0.6)]" dir="ltr">
                {joinUrl.replace('http://', '').replace('https://', '')}
              </div>
              
              {players.length >= 3 && (
                <button
                  onClick={startGame}
                  className="mt-8 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-full font-black text-white text-2xl transition-all shadow-lg active:scale-95"
                >
                  بدء اللعبة!
                </button>
              )}
              {players.length < 3 && (
                <p className="mt-8 text-neutral-400 font-bold text-lg">بانتظار انضمام 3 لاعبين على الأقل...</p>
              )}
            </div>

            <div className="w-1/3 bg-black/40 p-6 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="text-emerald-500" />
                العصابة ({players.length})
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {players.map((p: any) => (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-neutral-800 p-4 rounded-xl font-bold text-xl border border-neutral-700 shadow-sm"
                      key={p.id}
                    >
                      {p.name}
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
                  <div key={p.id} className={\`px-6 py-3 rounded-full text-xl font-bold border-2 \${p.id === mastermindId ? 'bg-amber-600 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-neutral-800 border-neutral-700'}\`}>
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
                 style={{ width: \`\${(Object.keys(votes).length / players.length) * 100}%\` }}
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

      </div>
    </div>
  );
};
`;
fs.writeFileSync(path.resolve(__dirname, '../src/components/BankRobberyGame.tsx'), content);
console.log('BankRobberyGame updated!');
