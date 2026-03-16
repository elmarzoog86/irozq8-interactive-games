import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Users, Play, ShieldAlert, Skull, Target, Heart, Crosshair, HelpCircle, SkipForward, RefreshCw, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

interface RouletteGameProps {
  messages: ChatMessage[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

interface Player {
  id: number;
  username: string;
  color: string;
  status: 'alive' | 'eliminated';
  survivedShots: number;
  hasRevived?: boolean;
  hasUsedRevive?: boolean;
}

const PieSlice = ({ startAngle, endAngle, color, label }: { startAngle: number, endAngle: number, color: string, label: string }) => {
  const radius = 100;
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);

  const x1 = radius + radius * Math.cos(startRad);
  const y1 = radius + radius * Math.sin(startRad);
  const x2 = radius + radius * Math.cos(endRad);
  const y2 = radius + radius * Math.sin(endRad);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  if (endAngle - startAngle === 360) {
    return <circle cx={radius} cy={radius} r={radius} fill={color} stroke="#111" strokeWidth="2" opacity="0.8" />;
  }

  const d = [
    `M ${radius} ${radius}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    'Z'
  ].join(' ');

  const middleAngle = startAngle + (endAngle - startAngle) / 2;
  const textRad = (middleAngle - 90) * (Math.PI / 180);
  const textX = radius + (radius * 0.7) * Math.cos(textRad);
  const textY = radius + (radius * 0.7) * Math.sin(textRad);
  
  let rotate = middleAngle;
  if (middleAngle > 90 && middleAngle < 270) {
    rotate += 180;
  }

  return (
    <g>
      <path d={d} fill={color} stroke="#111" strokeWidth="2" opacity="0.8" />
      <text 
        x={textX} 
        y={textY} 
        fill="#fff" 
        fontSize="12" 
        fontWeight="bold" 
        textAnchor="middle" 
        alignmentBaseline="middle" 
        transform={`rotate(${rotate}, ${textX}, ${textY})`}
        className="drop-shadow-md"
      >
        {label}
      </text>
    </g>
  );
};

export const RouletteGame: React.FC<RouletteGameProps> = ({ messages, onLeave, channelName, isConnected, error }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'wheel' | 'spinning' | 'decision' | 'shooting' | 'result' | 'finished'>('lobby');
  const [gameMode, setGameMode] = useState<'shakhsana' | 'no_shakhsana'>('no_shakhsana');
  const [actor, setActor] = useState<Player | null>(null);
  const [target, setTarget] = useState<Player | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [resultMsg, setResultMsg] = useState('');
  const [winner, setWinner] = useState<Player | null>(null);
  const [testMessages, setTestMessages] = useState<ChatMessage[]>([]);
  const [testUsername, setTestUsername] = useState('bot_1');
  const [testMessageText, setTestMessageText] = useState('');

  const processedMsgRef = useRef<Set<string>>(new Set());
  const pastActorsRef = useRef<number[]>([]);

  // Auto-join from chat or handle decision
  useEffect(() => {
    const all = [...messages, ...testMessages].sort((a, b) => a.timestamp - b.timestamp);
    if (all.length === 0) return;

    const latestMessage = all[all.length - 1];
    if (processedMsgRef.current.has(latestMessage.id)) return;
    processedMsgRef.current.add(latestMessage.id);

    const text = latestMessage.message.trim().toLowerCase();

    if (gameState === 'lobby' && (text === '!join' || text === '!انضمام')) {
      setPlayers(prev => {
        if (prev.some(p => p.username === latestMessage.username)) return prev;
        return [...prev, { id: prev.length + 1, username: latestMessage.username, color: latestMessage.color || '#00e5ff', status: 'alive', survivedShots: 0 }];
      });
    }

    if (gameState === 'decision' && actor && latestMessage.username === actor.username) {
      const match = text.match(/\d+/);
      if (match) {
        const num = parseInt(match[0]);
        const selected = players.find(p => p.id === num);
        if (selected && selected.id !== actor.id) {
          handleAction(selected);
        }
      }
    }
  }, [messages, testMessages, gameState, actor, players]);

  // Handle result timer
  useEffect(() => {
    if (gameState === 'result') {
      const t = setTimeout(() => {
        setGameState(prev => {
           if (prev !== 'result') return prev;
           const alive = players.filter(p => p.status === 'alive');
           if (alive.length <= 1) {
              setWinner(alive[0] || null);
              return 'finished';
           }
           return 'wheel';
        });
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [gameState, players]);

  const startGame = () => {
    if (players.length < 2) return;
    setGameState('wheel');
  };

  const spinWheel = () => {
    const alivePlayers = players.filter(p => p.status === 'alive');
    if (alivePlayers.length <= 1) return;

    let winnerIndex = Math.floor(Math.random() * alivePlayers.length);
    let chosenActor = alivePlayers[winnerIndex];

    let maxAttempts = 10;
    while (
      pastActorsRef.current.length >= 2 &&
      pastActorsRef.current[0] === chosenActor.id &&
      pastActorsRef.current[1] === chosenActor.id &&
      maxAttempts > 0 &&
      alivePlayers.length > 2
    ) {
      winnerIndex = Math.floor(Math.random() * alivePlayers.length);
      chosenActor = alivePlayers[winnerIndex];
      maxAttempts--;
    }

    pastActorsRef.current = [chosenActor.id, pastActorsRef.current[0]].filter((x): x is number => x !== undefined);

    setActor(chosenActor);

    const sliceAngle = 360 / alivePlayers.length;
    const targetAngle = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
    const extraSpins = 360 * 5;
    const currentBase = wheelRotation - (wheelRotation % 360);
    const newRotation = currentBase + extraSpins + targetAngle;

    setWheelRotation(newRotation);
    setGameState('spinning');
    
    setTimeout(() => {
      setGameState('decision');
    }, 4500); // 4.5s matches transition duration
  };

  const handleAction = (selectedTarget: Player) => {
    if (!actor) return;
    
    setTarget(selectedTarget);

    if (selectedTarget.status === 'eliminated') {
      if (selectedTarget.hasRevived || actor.hasUsedRevive) {
         // Prevent double revive for the target OR if the actor already revived someone
         return;
      }
      // Revive
      setResultMsg(`🕊️ تم إنعاش ${selectedTarget.username}! عاد إلى اللعبة.`);
      setPlayers(prev => prev.map(p => {
        if (p.id === selectedTarget.id) {
          return { ...p, status: 'alive', survivedShots: 0, hasRevived: true };
        }
        if (p.id === actor.id) {
          return { ...p, hasUsedRevive: true };
        }
        return p;
      }));
      setActor(prev => prev ? { ...prev, hasUsedRevive: true } : prev); // Update current actor state
      setGameState('result');
    } else {
      // Shoot (Russian Roulette) Animation
      setGameState('shooting');

      // Chance gets higher the more shots they survive. If they survived 5 shots, remaining chambers is 1, so 1/1 = 100% chance.
      const remainingChambers = Math.max(1, 6 - selectedTarget.survivedShots);
      const isBullet = Math.random() < (1 / remainingChambers);

      setTimeout(() => {
        if (isBullet) {
           setResultMsg(`💥 بوم! الرصاصة أصابت ${selectedTarget.username} وتم إقصاؤه!`);
           setPlayers(prev => prev.map(p => p.id === selectedTarget.id ? { ...p, status: 'eliminated' } : p));
        } else {
           setResultMsg(`كليك! مسدس فارغ.. ${selectedTarget.username} نجا بصعوبة!`);
           setPlayers(prev => prev.map(p => p.id === selectedTarget.id ? { ...p, survivedShots: p.survivedShots + 1 } : p));
        }
        setGameState('result');
      }, 3500); // Wait 3.5 seconds for dramatic shooting animation
    }
  };

  const addBotPlayer = () => {
    const botNames = ['أحمد', 'محمد', 'سارة', 'فاطمة', 'علي', 'نورة', 'عمر', 'ريم'];
    const randomName = botNames[Math.floor(Math.random() * botNames.length)] + '_' + Math.floor(Math.random() * 1000);
    const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    
    setPlayers(prev => [
      ...prev, 
      { id: prev.length + 1, username: randomName, color: randomColor, status: 'alive', survivedShots: 0 }
    ]);
  };

  const resetGame = () => {
    setPlayers([]);
    setGameState('lobby');
    setActor(null);
    setTarget(null);
    setWinner(null);
    setWheelRotation(0);
  };

  return (
    <div className="flex flex-col h-full bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 p-8 shadow-2xl relative overflow-hidden font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 to-transparent z-0 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Skull className="w-8 h-8 text-brand-cyan" />
            روليت البقاء
          </h2>
          <p className="text-red-400/80 mt-1 text-sm font-bold">
            ديربالك تغدر نفس صاحبنا...
          </p>
        </div>
        <button 
          onClick={onLeave}
          className="text-brand-cyan/70 hover:text-brand-cyan transition-colors text-sm flex items-center gap-2 bg-brand-cyan/5 hover:bg-brand-indigo/10 px-4 py-2 rounded-xl border border-brand-indigo/20 hover:border-brand-cyan/40"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للردهة
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-hidden">
        
        {gameState === 'lobby' && (
          <div className="flex flex-col items-center max-w-2xl w-full">
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setGameMode('no_shakhsana')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  gameMode === 'no_shakhsana'
                    ? 'bg-brand-cyan text-brand-black scale-105 shadow-[0_0_15px_rgba(0, 229, 255,0.4)]'
                    : 'bg-brand-black/50 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                بدون شخصنه (أرقام فقط)
              </button>
              <button
                onClick={() => setGameMode('shakhsana')}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  gameMode === 'shakhsana'
                    ? 'bg-red-500 text-white scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-brand-black/50 text-white/50 border border-white/10 hover:bg-white/10'
                }`}
              >
                تبي تشخصن؟ (تظهر الأسماء)
              </button>
            </div>

            <div className="bg-brand-black/70 border border-brand-cyan/20 rounded-2xl p-8 w-full text-center mb-8 relative">
              {/* Tutorial Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 text-xs text-brand-cyan bg-brand-black/50 border border-brand-cyan/20 px-3 py-1.5 rounded-lg">
                <Skull className="w-4 h-4" />
                <span>كيف تلعب؟ اكتب <span className="font-bold">!join</span> - العجلة تختار شخصاً - يكتب رقم لاعب ليضربه أو يُنعشه!</span>
              </div>
              
              <Users className="w-16 h-16 text-brand-pink/50 mx-auto mb-4 mt-6" />
              <h3 className="text-2xl font-bold text-white mb-2">في انتظار اللاعبين...</h3>
              <p className="text-brand-cyan/70 mb-6">اللاعبون المنضمون: <span className="text-brand-pink font-bold text-xl">{players.length}</span></p>
              
              <div className="flex flex-col gap-2 w-full max-h-64 overflow-y-auto custom-scrollbar p-2 bg-brand-black/80 rounded-xl border border-brand-cyan/10">
                {players.length === 0 ? (
                  <div className="text-zinc-500 text-sm text-center py-4">انتظار انضمام لاعبين...</div>
                ) : (
                  players.map(p => (
                    <div key={p.username} className="flex justify-between items-center p-3 rounded-xl bg-brand-black/70 border border-brand-cyan/20 shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-brand-cyan/5 group-hover:bg-brand-cyan/10 transition-colors" />
                        <span className="font-bold text-lg z-10" style={{ color: p.color }}>{p.username}</span>
                        <div className="w-3 h-3 rounded-full z-10 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: p.color }} />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                  players.length >= 2 
                    ? 'bg-brand-cyan hover:bg-brand-pink text-brand-black shadow-[0_0_20px_rgba(0, 229, 255,0.4)] hover:scale-105' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Play className="w-6 h-6" />
                بدء اللعبة
              </button>
            </div>
          </div>
        )}

        {(gameState === 'wheel' || gameState === 'spinning') && (
           <div className="flex flex-col items-center">
              <div className="relative mb-8 mt-4">
                 {/* Pointer */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
                    <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
                 </div>

                 {/* Wheel container */}
                 <motion.div 
                   className="w-[350px] h-[350px] relative rounded-full shadow-[0_0_60px_rgba(0, 229, 255,0.15)] overflow-hidden border-[6px] border-brand-cyan/80 bg-zinc-900"
                   animate={{ rotate: wheelRotation }}
                   transition={{ duration: gameState === 'spinning' ? 4.5 : 0, ease: [0.2, 0.8, 0.2, 1] }}
                 >
                   <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                     {(() => {
                        const alive = players.filter(p => p.status === 'alive');
                        if (alive.length === 0) return null;
                        const slice = 360 / alive.length;
                        return alive.map((p, i) => (
                          <PieSlice 
                            key={p.id} 
                            startAngle={i * slice} 
                            endAngle={(i + 1) * slice} 
                            color={p.color || '#444'} 
                            label={p.username.substring(0, 10)} 
                          />
                        ));
                     })()}
                   </svg>
                 </motion.div>
                 
                 {/* Center Spin Button / Result text */}
                 <div 
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-24 h-24 bg-brand-black rounded-full border-4 border-brand-cyan flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.9)] cursor-pointer group"
                   onClick={gameState === 'wheel' ? spinWheel : undefined}
                 >
                    {gameState === 'wheel' ? (
                       <span className="font-black text-brand-pink text-2xl group-hover:scale-110 transition-transform">SPIN</span>
                    ) : (
                       <RefreshCw className="w-10 h-10 text-brand-cyan animate-spin" />
                    )}
                 </div>
              </div>
              <h3 className="text-2xl text-white font-bold opacity-80">{gameState === 'wheel' ? 'اضغط SPIN لتدوير العجلة واختيار اللاعب!' : 'جاري اختيار اللاعب الذي سيُطلق النار...'}</h3>
           </div>
        )}

        {gameState === 'decision' && actor && (
           <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="flex flex-col items-center w-full h-full">
              <div className="bg-brand-black/60 border border-brand-cyan/30 rounded-2xl p-6 text-center mb-6 w-full max-w-4xl shadow-[0_0_30px_rgba(0, 229, 255,0.1)]">
                 <h2 className="text-3xl font-bold text-white mb-2">دور اللاعب: <span className="underline decoration-brand-cyan decoration-4" style={{color: actor.color}}>{actor.username}</span></h2>
                 <p className="text-brand-cyan/80 text-lg">يا {actor.username}، اكتب رقم اللاعب في الشات لتصويبه بالمسدس (إقصاء) أو لإنعاشه (إذا كان مقصياً)!</p>
                 
                 <div className="mt-4 flex justify-center">
                   <button onClick={() => setGameState('wheel')} className="flex items-center gap-2 text-sm bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/50 px-4 py-2 rounded-xl transition-colors">
                     <SkipForward className="w-4 h-4" /> تخطي هذا اللاعب إذا لم يرد
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-6xl overflow-y-auto custom-scrollbar p-2 pb-16">
                 {players.map(p => (
                   <div key={p.id} className={`p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all relative overflow-hidden ${p.status === 'alive' ? 'bg-zinc-900 border-zinc-700' : 'bg-red-950/20 border-red-900/30 opacity-70'}`}>
                      
                      
                      <div className="text-3xl font-black bg-white/10 w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner">
                        {p.id}
                      </div>
                      
                      {gameMode === 'shakhsana' && <span className="font-bold text-lg mb-2 truncate w-full" style={{color: p.color}}>{p.username}</span>}
                      
                      {p.status === 'alive' ? (
                        <div className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded mb-2 border border-red-400/20">
                          <Target className="w-4 h-4" /> هدف متاح
                        </div>
                      ) : (p.hasRevived || actor?.hasUsedRevive) ? (
                        <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold bg-zinc-500/10 px-2 py-1 rounded mb-2 border border-zinc-500/20">
                          <Skull className="w-4 h-4" /> لا يمكن إنعاشه مجدداً
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded mb-2 border border-green-400/20">
                          <Heart className="w-4 h-4" /> متاح للإنعاش
                        </div>
                      )}
                      
                      {/* Chambers display */}
                      {p.status === 'alive' && (
                        <div className="flex gap-1 mt-auto bg-brand-black/50 p-2 rounded-lg w-full justify-center border border-zinc-800">
                          {[...Array(6)].map((_, i) => (
                             <div key={i} className={`w-2 h-4 rounded-sm ${i < (6 - p.survivedShots) ? 'bg-zinc-300' : 'bg-red-600/30'}`} />
                          ))}
                        </div>
                      )}
                   </div>
                 ))}
              </div>
           </motion.div>
        )}

        {gameState === 'shooting' && target && (
          <motion.div 
             initial={{ scale: 3, opacity: 0 }} 
             animate={{ scale: 1, opacity: 1 }} 
             transition={{ duration: 0.5, type: 'spring' }}
             className="flex flex-col items-center justify-center text-center bg-brand-black/80 rounded-3xl p-16 border-2 border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.2)] w-full max-w-2xl relative overflow-hidden"
          >
             <div className="absolute inset-0 bg-red-500/5 animate-pulse mix-blend-overlay pointer-events-none" />
             
             <h2 className="text-3xl font-bold text-red-500 mb-2 relative z-10">إطلاق النار على</h2>
             <h3 className="text-6xl font-black text-white mb-12 drop-shadow-lg relative z-10" style={{ color: target.color }}>{target.username}</h3>
             
             <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "linear", repeat: Infinity }}
                  className="absolute"
                >
                  <div className="w-48 h-48 rounded-full border-4 border-dashed border-red-500/30" />
                </motion.div>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                >
                  <Target className="w-32 h-32 text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
                </motion.div>
             </div>
             
             <p className="mt-12 text-2xl text-red-400 font-bold animate-[pulse_0.4s_ease-in-out_infinite] tracking-widest relative z-10">
               تدوير الأسطوانة...
             </p>
          </motion.div>
        )}

        {gameState === 'result' && target && (
          <motion.div initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className="flex flex-col items-center justify-center text-center bg-zinc-900 rounded-3xl p-12 border border-brand-cyan/30 shadow-[0_0_80px_rgba(0, 229, 255,0.15)] w-full max-w-3xl">
             
             {(() => {
                const updatedTarget = players.find(p => p.id === target.id);
                if (!updatedTarget) return null;
                
                if (updatedTarget.status === 'eliminated' && target.status === 'alive') {
                   // Just died
                   return <Skull className="w-40 h-40 text-red-500 mb-8 animate-[pulse_0.5s_infinite] drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]" />
                } else if (resultMsg.includes('إنعاش')) {
                   return <Heart className="w-40 h-40 text-green-500 mb-8 animate-bounce drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]" />
                } else {
                   // Survived a shot
                   return <Crosshair className="w-40 h-40 text-brand-cyan mb-8 animate-pulse drop-shadow-[0_0_30px_rgba(0, 229, 255,0.5)]" />
                }
             })()}

             <h2 className="text-4xl md:text-5xl font-black text-white leading-relaxed tracking-tight" style={{textShadow: '0 4px 20px rgba(0,0,0,0.8)'}}>
               {resultMsg}
             </h2>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center">
            <div className="w-40 h-40 bg-brand-cyan/20 rounded-full flex items-center justify-center mb-8 border-4 border-brand-cyan shadow-[0_0_80px_rgba(0, 229, 255,0.6)]">
              <span className="text-7xl">👑</span>
            </div>
            <h2 className="text-5xl font-black text-white mb-2 drop-shadow-lg">الناجي الأخير!</h2>
            {winner ? (
              <h3 className="text-6xl font-black mb-10 drop-shadow-xl" style={{ color: winner.color }}>
                {winner.username}
              </h3>
            ) : (
              <h3 className="text-4xl font-bold text-zinc-400 mb-10">الجميع خسروا بطريقة ما</h3>
            )}
            
            <button onClick={resetGame} className="bg-brand-pink hover:bg-brand-pink text-brand-black font-bold py-4 px-10 rounded-2xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(0, 229, 255,0.3)] text-xl">
              لعب مرة أخرى
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

