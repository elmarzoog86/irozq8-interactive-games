import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Play, Trophy, Dice5, ArrowRight, XCircle, RotateCcw } from 'lucide-react';
import { TwitchChat } from './TwitchChat';

interface Player {
  username: string;
  color: string;
  position: number;
  isFinished: boolean;
  rank: number;
  avatar?: string;
}

interface SnakeOrLadder {
  start: number;
  end: number;
}

const BOARD_SIZE = 100;
const COLS = 10;

// Classic Snakes and Ladders positions - Adjusted for cleaner visualization
const SNAKES: SnakeOrLadder[] = [
  { start: 43, end: 17 },
  { start: 56, end: 8 },
  { start: 50, end: 5 },
  { start: 73, end: 15 },
  { start: 84, end: 58 },
  { start: 98, end: 40 }
];

const LADDERS: SnakeOrLadder[] = [
  { start: 2, end: 23 },
  { start: 8, end: 29 },
  { start: 22, end: 41 },
  { start: 28, end: 75 },
  { start: 71, end: 92 },
  { start: 80, end: 99 }
];

const COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8',
  '#33FFF5', '#F5FF33', '#FF8C33', '#8C33FF', '#33FF8C'
];

interface Props {
  messages: any[];
  onLeave: () => void;
  channelName: string;
  isConnected: boolean;
  error: string | null;
}

export const SnakesAndLaddersGame: React.FC<Props> = ({ messages, onLeave, channelName, isConnected, error }) => {
  const [phase, setPhase] = useState<'lobby' | 'playing' | 'game_over'>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winners, setWinners] = useState<Player[]>([]);
  const [lastMoveMessage, setLastMoveMessage] = useState('');
  const [autoPlay, setAutoPlay] = useState(false);

  const processedMessageIds = useRef<Set<string>>(new Set());
  const turnTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playersRef = useRef(players);

  useEffect(() => { playersRef.current = players; }, [players]);

  // Handle Join in Lobby
  useEffect(() => {
    if (phase === 'lobby') {
      messages.forEach(msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          if (text === '!join' || text === 'join' || text === 'join!') {
            setPlayers(prev => {
              if (prev.find(p => p.username === msg.username)) return prev;
              return [...prev, {
                username: msg.username,
                color: msg.color || COLORS[prev.length % COLORS.length],
                position: 0, // Start just off board (0), 1 is first square
                isFinished: false,
                rank: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`
              }];
            });
          }
        }
      });
    }
  }, [messages, phase]);

  // Handle !roll in Game
  useEffect(() => {
    if (phase === 'playing' && players.length > 0) {
      const activePlayer = players[currentPlayerIndex];

      // If Auto Play is enabled, roll automatically
      if (autoPlay && !isRolling) {
         if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
         turnTimeoutRef.current = setTimeout(() => {
             handleRoll(activePlayer.username, true);
         }, 1500); // 1.5s delay
         return;
      }

      // Auto-turn timer if player is slow (15s) - Only if NOT auto play
      if (!turnTimeoutRef.current && !autoPlay) {
        turnTimeoutRef.current = setTimeout(() => {
          handleRoll(activePlayer.username, true);
        }, 15000);
      }

      messages.forEach(msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          if (msg.username.toLowerCase() === activePlayer.username.toLowerCase() && (text === '!roll' || text === 'roll' || text === 'roll!')) {
            if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
            turnTimeoutRef.current = null;
            handleRoll(activePlayer.username);
          }
        }
      });
    }
  }, [messages, phase, players, currentPlayerIndex, autoPlay, isRolling]);

  const updatePlayerPosition = (index: number, pos: number) => {
    setPlayers(prev => {
      const newP = [...prev];
      if (newP[index]) {
        newP[index] = { ...newP[index], position: pos };
      }
      return newP;
    });
  };

  const endTurn = () => {
    const currentPlayers = playersRef.current;
    let nextIndex = (currentPlayerIndex + 1) % currentPlayers.length;
    let loops = 0;

    // Find next active player
    while (currentPlayers[nextIndex] && currentPlayers[nextIndex].isFinished && loops < currentPlayers.length) {
      nextIndex = (nextIndex + 1) % currentPlayers.length;
      loops++;
    }

    if (loops === currentPlayers.length || currentPlayers.filter(p => !p.isFinished).length === 0) {
      setPhase('game_over');
    } else {
      setCurrentPlayerIndex(nextIndex);
      if (turnTimeoutRef.current) clearTimeout(turnTimeoutRef.current);
      turnTimeoutRef.current = null;
    }
    // Only verify turn is over here
    setIsRolling(false);
  };

  const handleWin = async (username: string, index: number) => {
    setLastMoveMessage(`${username} وصل للنهاية! 🎉`);
    
    // Update Winners
    setWinners(w => {
       if (w.some(p => p.username === username)) return w;
       const winner = { ...playersRef.current[index], position: 100, isFinished: true, rank: w.length + 1 };
       return [...w, winner];
    });
    
    // Update Player Status
    setPlayers(prev => {
        const newP = [...prev];
        if (newP[index]) {
            newP[index] = { ...newP[index], position: 100, isFinished: true };
        }
        return newP;
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    endTurn();
  };

  const performMoveSequence = async (username: string) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    const currentPlayers = playersRef.current;
    const playerIndex = currentPlayers.findIndex(p => p.username === username);
    
    if (playerIndex === -1) {
      setIsRolling(false);
      return;
    }

    let currentPlayer = { ...currentPlayers[playerIndex] };
    let currentPos = currentPlayer.position;

    // Step-by-step movement
    for (let i = 0; i < roll; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        currentPos++;
        
        if (currentPos >= 100) {
           currentPos = 100;
           updatePlayerPosition(playerIndex, 100);
           break;
        }
        updatePlayerPosition(playerIndex, currentPos);
    }
    
    // Check Win
    if (currentPos === 100) {
        handleWin(username, playerIndex);
        return;
    }

    // Check Snake/Ladder
    const snake = SNAKES.find(s => s.start === currentPos);
    const ladder = LADDERS.find(l => l.start === currentPos);

    if (snake) {
        setLastMoveMessage(`🐍 ${username} لدغه ثعبان!`);
        await new Promise(resolve => setTimeout(resolve, 800));
        updatePlayerPosition(playerIndex, snake.end);
        setLastMoveMessage(`${username} نزل من ${snake.start} إلى ${snake.end}`);
    } else if (ladder) {
        setLastMoveMessage(`🪜 ${username} صعد سلم!`);
        await new Promise(resolve => setTimeout(resolve, 800));
        updatePlayerPosition(playerIndex, ladder.end);
        setLastMoveMessage(`${username} صعد من ${ladder.start} إلى ${ladder.end}`);
    } else {
        setLastMoveMessage(`${username} تحرك ${roll} خطوات إلى ${currentPos}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    endTurn();
  };

  const handleRoll = async (username: string, isAuto = false) => {
    if (isRolling) return;
    setIsRolling(true);
    setLastMoveMessage(isAuto ? `تأخر ${username}! تم الرمي تلقائياً...` : `${username} يرمي النرد...`);

    // Dice animation
    let rolls = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 10) {
        clearInterval(interval);
        performMoveSequence(username);
      }
    }, 100);
  };

  const startGame = () => {
    if (players.length < 2) return;
    setPhase('playing');
    setCurrentPlayerIndex(0);
    setWinners([]);
    // Reset positions to 0 (off board)
    setPlayers(prev => prev.map(p => ({ ...p, position: 0, isFinished: false, rank: 0 }))); 
  };

  const resetGame = () => {
    setPhase('lobby');
    setPlayers([]);
    setWinners([]);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
  };

  // Calculate board coordinates (returns 0-100% for x and y of center)
  const getCoordinates = (position: number) => {
    if (position < 1) position = 1;
    if (position > 100) position = 100;

    const row = Math.floor((position - 1) / 10); // 0 at bottom, 9 at top
    
    // My rendering logic:
    // visual row 0 is top. visual row 9 is bottom.
    // logical board: row 0 is 1-10.
    
    // Let's stick to logical rows (0-9) where 0 is 1-10.
    const logicalRow = Math.floor((position - 1) / 10);
    const isEvenRow = logicalRow % 2 === 0;
    
    // Standard Boustrophedon
    // Row 0 (1-10): Left to Right. Col 0 -> 9.
    // Row 1 (11-20): Right to Left. Col 0 is 20, Col 9 is 11.
    
    let col = (position - 1) % 10;
    if (!isEvenRow) {
      col = 9 - col;
    }
    
    // Convert to Percentage
    // RTL Adjustment: SVG x=0 is Left. Board Column 0 is Right.
    // So we need to invert the X axis calculation.
    return {
      x: (9 - col) * 10 + 5, // Inverted for RTL board layout
      y: (9 - logicalRow) * 10 + 5
    };
  };

// Custom Bezier Path Generator for Wavy Snakes
const getWavyPath = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    // Calculate vector from start to end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Number of full waves
    // Each wave is 2 Q curves (out and back)
    const waveLength = 15; // Percentage units
    const numWaves = Math.max(2, Math.floor(dist / waveLength)); 
    
    let path = `M ${start.x} ${start.y}`;
    
    // Perpendicular vector for amplitude (normalized)
    let nx = -dy / dist;
    let ny = dx / dist;
    
    const amplitude = 5; // How wide the snake wiggles

    for (let i = 0; i < numWaves; i++) {
        // We want to go from Current Point to Next Point on the line
        // But curve out to the side
        
        // Point on the line at end of this wave segment
        const t = (i + 1) / numWaves;
        const nextX = start.x + dx * t;
        const nextY = start.y + dy * t;
        
        // Point on the line at START of this wave segment
        const prevT = i / numWaves;
        const prevX = start.x + dx * prevT;
        const prevY = start.y + dy * prevT;
        
        // Midpoint on the line
        const midX = (prevX + nextX) / 2;
        const midY = (prevY + nextY) / 2;
        
        // Control point is OUT from the midpoint
        // Alternate sides
        const side = (i % 2 === 0 ? 1 : -1);
        const cpX = midX + nx * amplitude * side;
        const cpY = midY + ny * amplitude * side;
        
        // Draw Q curve to next point, using control point
        path += ` Q ${cpX} ${cpY} ${nextX} ${nextY}`;
    }
    
    return path;
};

  // Render Grid
  const renderBoard = () => {
    const cells = [];
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        const effectiveRow = 9 - row; // 0 at bottom, 9 at top
        let number;
        if (effectiveRow % 2 === 0) {
             // Even rows (0: 1-10, 2: 21-30, etc.)
             // Due to dir="rtl", pushing 1, 2, 3 places 1 on the far Right.
             number = effectiveRow * 10 + col + 1;
        } else {
             // Odd rows (1: 11-20, 3: 31-40, etc.)
             // Due to dir="rtl", pushing 20, 19, 18 places 20 on the far Right.
             number = effectiveRow * 10 + (10 - col);
        }

        cells.push(
          <div key={number} className="relative flex items-center justify-center">

             {/* Render Players */}
             <div className="flex flex-wrap items-center justify-center gap-1 z-10 relative">
               {players.filter(p => !p.isFinished && p.position === number).map(p => (
                   <motion.div
                   layoutId={`player-${p.username}`}
                   layout
                   transition={{ 
                       type: "spring", 
                       stiffness: 300, 
                       damping: 30,
                       mass: 1 
                   }}
                   key={p.username}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   className="w-8 h-8 lg:w-12 lg:h-12 rounded-full border-[3px] border-white shadow-[0_4px_8px_rgba(0,0,0,0.4)] overflow-hidden relative z-50 transform hover:scale-110 transition-transform"
                   style={{ backgroundColor: p.color }}
                   title={p.username}
                 >
                   <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                 </motion.div>
               ))}
               {/* Start Position Players handled separately or mapped to 1 */}
               {number === 1 && players.filter(p => p.position === 0).map(p => (
                 <motion.div
                   layoutId={`player-${p.username}`}
                   layout
                   key={p.username}
                   className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 border-white shadow-xl overflow-hidden opacity-50 relative z-20"
                   style={{ backgroundColor: p.color }}
                   title={p.username}
                 >
                   <img src={p.avatar} alt={p.username} className="w-full h-full object-cover" />
                 </motion.div>
               ))}
             </div>
            </div>
          );
        }
      }
      return cells;
    };

    return (
      <div className="flex h-full w-full max-w-[1600px] mx-auto gap-6 p-6 font-arabic" dir="rtl">
        {/* Main Board Area */}
        <div className="flex-1 bg-black/80  rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col relative">
           {/* Header */}
           <div className="h-20 border-b border-brand-gold/10 flex items-center justify-between px-8 bg-black/20">
              <div className="flex items-center gap-4">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter">
                   سلالم <span className="text-brand-gold">وثعابين</span>
                 </h2>
                 {phase === 'playing' && (
                   <div className="bg-brand-gold/10 px-6 py-2 rounded-xl border border-brand-gold/30 text-brand-gold font-bold animate-[pulse_2s_infinite] shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                      🎲 الدور على: <span className="text-white text-lg">{players[currentPlayerIndex]?.username}</span>
                   </div>
                 )}
              </div>
              <div className="flex gap-3">
                  <button onClick={onLeave} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                     <ArrowRight className="w-6 h-6 text-white/50 hover:text-white" />
                  </button>
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 p-2 lg:p-4 flex flex-col lg:flex-row gap-6 overflow-hidden">
              {/* Controls & Status - First in DOM (Right side in RTL) */}
              <div className="w-full lg:w-80 flex flex-col gap-4 z-20 h-full overflow-y-auto custom-scrollbar pb-2 min-w-[300px]">
                 {phase === 'lobby' && (
                    <div className="flex flex-col items-center justify-center text-center bg-black/70 p-6 rounded-3xl border border-white/5  shadow-xl">
                       <Dice5 className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                       <h3 className="text-2xl font-bold text-white mb-2">في انتظار اللاعبين...</h3>
                       <p className="text-zinc-400 mb-8">اكتب <span className="text-brand-gold font-bold bg-brand-gold/10 px-2 rounded">!join</span> للانضمام</p>
                       <div className="flex flex-col gap-3 w-full max-w-xs">
                           <button 
                             onClick={startGame} 
                             disabled={players.length < 2}
                             className="bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-8 py-4 rounded-xl text-xl transition-all shadow-lg w-full"
                           >
                             بدء اللعبة
                           </button>
                           <button
                                onClick={() => {
                                    const testUser = `TestPlayer${players.length + 1}`;
                                    setPlayers(prev => [...prev, {
                                        username: testUser,
                                        color: COLORS[prev.length % COLORS.length],
                                        position: 0,
                                        isFinished: false,
                                        rank: 0,
                                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${testUser}`
                                    }]);
                                }}
                                className="bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-bold px-4 py-2 rounded-xl text-sm transition-all"
                            >
                                + إضافة لاعب اختبار
                            </button>
                       </div>
                    </div>
                 )}

                 {phase === 'playing' && (
                    <div className="flex flex-col gap-4 h-full">
                       <div className="bg-black/70 rounded-3xl p-6 border border-brand-gold/20 text-center relative overflow-hidden  shadow-xl flex-shrink-0">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                             <Dice5 className="w-32 h-32" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-zinc-400 mb-4">النرد</h3>
                          <div className="flex items-center justify-center h-24 mb-4">
                             <AnimatePresence mode="wait">
                                {diceValue ? (
                                   <motion.div 
                                      key={diceValue}
                                      initial={{ scale: 0.5, rotate: 180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                   >
                                      <span className="text-5xl font-black text-black">{diceValue}</span>
                                   </motion.div>
                                ) : (
                                   <div className="w-20 h-20 border-4 border-dashed border-zinc-700 rounded-2xl flex items-center justify-center text-zinc-700 text-3xl font-bold opacity-50">
                                      ?
                                   </div>
                                )}
                             </AnimatePresence>
                          </div>
                          <p className="text-brand-gold font-bold text-base animate-pulse mb-4 min-h-[1.5rem]">{lastMoveMessage}</p>
                          
                          <button 
                             disabled={isRolling}
                             onClick={() => handleRoll(players[currentPlayerIndex].username)}
                             className="bg-brand-gold/10 hover:bg-brand-gold/20 border border-brand-gold/50 text-brand-gold px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full hover:shadow-[0_0_15px_rgba(255,215,0,0.1)] mb-4"
                           >
                             🎲 ارمي النرد
                           </button>

                           {/* Auto Play Toggle */}
                            <div className="flex items-center justify-between bg-black/70 p-3 rounded-xl border border-white/10">
                                <span className="text-zinc-400 font-bold text-sm">اللعب التلقائي</span>
                                <button 
                                    onClick={() => setAutoPlay(!autoPlay)}
                                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${autoPlay ? 'bg-brand-gold' : 'bg-zinc-700'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${autoPlay ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                       </div>

                       {/* Leaderboard */}
                       <div className="flex-1 bg-black/70 rounded-3xl p-4 border border-white/5 overflow-hidden flex flex-col  shadow-xl min-h-0">
                          <h3 className="font-bold text-zinc-400 mb-4 px-2">الترتيب</h3>
                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                             {[...players].sort((a,b) => b.position - a.position).map((p, i) => (
                                <div key={p.username} className={`p-3 rounded-xl flex items-center gap-3 ${p.username === players[currentPlayerIndex]?.username ? 'bg-brand-gold/20 border border-brand-gold/30' : 'bg-black/70 border border-white/5'}`}>
                                   <div className="flex flex-col items-center min-w-[20px]">
                                       <span className="font-bold text-zinc-500 text-xs">#{i+1}</span>
                                   </div>
                                   <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden flex-shrink-0" style={{ backgroundColor: p.color }}>
                                      <img src={p.avatar} alt="av" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-center mb-1">
                                         <span className="font-bold text-white text-xs truncate max-w-[80px]">{p.username}</span>
                                         <span className="font-bold text-brand-gold text-xs">{p.position}</span>
                                      </div>
                                      <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                                         <div className="h-full bg-brand-gold transition-all duration-500" style={{ width: `${p.position}%` }} />
                                      </div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {phase === 'game_over' && (
                    <div className="flex-1 bg-black/70 rounded-3xl p-6 border border-brand-gold/30 flex flex-col items-center justify-center text-center  shadow-xl">
                       <Trophy className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                       <h3 className="text-4xl font-black text-white mb-2">الفائز!</h3>
                       <div className="text-2xl font-bold text-brand-gold mb-8">{winners[0]?.username}</div>
                       <button onClick={resetGame} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-colors">
                          <RotateCcw className="w-5 h-5" /> لعبة جديدة
                       </button>
                    </div>
                 )}
              </div>

              {/* Board */}
              <div className="flex-1 flex flex-col items-center justify-center min-w-0 h-full p-4">
                  <div className="relative aspect-square w-full max-h-[85vh] rounded-2xl border-[4px] border-[#4A3728] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-10 grid-rows-10 transform bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/snakes-board.png')" }}>
                       {/* Grid Cells */}
                       {renderBoard()}
                    </div>
                </div>
             </div>
          </div>

          {/* Twitch Chat Sidebar */}
          <div className="w-[400px] flex flex-col gap-4">
           <div className="flex-1 min-h-0 bg-black/80  rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
           <TwitchChat 
             channelName={channelName} 
             messages={messages} 
             isConnected={isConnected} 
             error={error} 
           />
         </div>
         
         {/* Debug/Manual Controls */}
         <div className="bg-black/80  rounded-[20px] border border-brand-gold/20 p-4 shadow-xl">
            <h4 className="text-brand-gold font-bold mb-2 text-sm">تحكم يدوي (للتجربة)</h4>
            <div className="flex gap-2 mb-2">
               <button 
                 onClick={() => {
                    const name = `Player${players.length + 1}`;
                    setPlayers(prev => [...prev, {
                      username: name,
                      color: COLORS[prev.length % COLORS.length],
                      position: 0,
                      isFinished: false,
                      rank: 0,
                      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
                    }]);
                 }}
                 className="flex-1 bg-brand-gold/20 hover:bg-brand-gold/40 text-brand-gold py-2 rounded-lg text-xs font-bold transition-all border border-brand-gold/30"
               >
                 + إضافة لاعب
               </button>
               <button 
                 onClick={() => {
                    if (phase === 'playing' && players.length > 0) {
                       const activePlayer = players[currentPlayerIndex];
                       handleRoll(activePlayer.username);
                    }
                 }}
                 disabled={phase !== 'playing' || isRolling}
                 className="flex-1 bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black py-2 rounded-lg text-xs font-bold transition-all"
               >
                 🎲 رمي النرد
               </button>
            </div>
            <div className="text-[10px] text-zinc-500 text-center">
               يمكنك أيضاً كتابة <span className="text-brand-gold">!join</span> أو <span className="text-brand-gold">join</span> في الشات
            </div>
         </div>
        </div>
    </div>
  );
};
