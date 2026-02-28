import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Trophy, Play, Square, ArrowRight, Skull } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  message: string;
  color?: string;
}

interface Props {
  messages: Message[];
  onLeave: () => void;
}

interface Invader {
  id: string;
  x: number;
  y: number;
  username: string;
  color: string;
  speed: number;
}

interface Bullet {
  id: string;
  x: number;
  y: number;
}

export const ChatInvadersGame: React.FC<Props> = ({ messages, onLeave }) => {
  const [status, setStatus] = useState<'setup' | 'playing' | 'gameover'>('setup');
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const gameState = useRef({
    player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
    invaders: [] as Invader[],
    bullets: [] as Bullet[],
    keys: { left: false, right: false, space: false },
    lastShot: 0,
    score: 0,
    isGameOver: false
  });

  const processedMessageIds = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);

  // Handle new messages -> Spawn invaders
  useEffect(() => {
    if (status !== 'playing') return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage || processedMessageIds.current.has(latestMessage.id)) return;
    processedMessageIds.current.add(latestMessage.id);

    // Spawn new invader
    const x = Math.random() * 700 + 50; // Canvas width 800
    gameState.current.invaders.push({
      id: latestMessage.id,
      x,
      y: -30,
      username: latestMessage.username,
      color: latestMessage.color || '#ef4444',
      speed: Math.random() * 1 + 0.5 // Random speed 0.5 - 1.5
    });
  }, [messages, status]);

  // Game Loop
  useEffect(() => {
    if (status !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameState.current.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') gameState.current.keys.right = true;
      if (e.code === 'Space') gameState.current.keys.space = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') gameState.current.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') gameState.current.keys.right = false;
      if (e.code === 'Space') gameState.current.keys.space = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const update = () => {
      if (gameState.current.isGameOver) return;

      const state = gameState.current;

      // Move player
      if (state.keys.left) state.player.x -= state.player.speed;
      if (state.keys.right) state.player.x += state.player.speed;
      
      // Bounds
      if (state.player.x < 0) state.player.x = 0;
      if (state.player.x > 800 - state.player.width) state.player.x = 800 - state.player.width;

      // Shoot
      if (state.keys.space && Date.now() - state.lastShot > 200) {
        state.bullets.push({
          id: Math.random().toString(),
          x: state.player.x + state.player.width / 2 - 2,
          y: state.player.y
        });
        state.lastShot = Date.now();
      }

      // Move bullets
      for (let i = state.bullets.length - 1; i >= 0; i--) {
        state.bullets[i].y -= 7;
        if (state.bullets[i].y < 0) {
          state.bullets.splice(i, 1);
        }
      }

      // Move invaders & check collisions
      for (let i = state.invaders.length - 1; i >= 0; i--) {
        const invader = state.invaders[i];
        invader.y += invader.speed;

        // Check bullet collision
        let hit = false;
        for (let j = state.bullets.length - 1; j >= 0; j--) {
          const b = state.bullets[j];
          if (b.x > invader.x - 20 && b.x < invader.x + 20 && b.y > invader.y - 20 && b.y < invader.y + 20) {
            state.bullets.splice(j, 1);
            hit = true;
            state.score += 10;
            break;
          }
        }

        if (hit) {
          state.invaders.splice(i, 1);
          continue;
        }

        // Check player collision or bottom reach
        if (invader.y > 600 || (
          invader.y + 20 > state.player.y && 
          invader.x + 20 > state.player.x && 
          invader.x - 20 < state.player.x + state.player.width
        )) {
          state.isGameOver = true;
          setStatus('gameover');
          setScore(state.score);
          break;
        }
      }

      // Draw
      ctx.clearRect(0, 0, 800, 600);

      // Draw Player
      ctx.fillStyle = '#D4AF37'; // brand-gold
      ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      ctx.fillStyle = '#FFD700'; // gold-light
      ctx.fillRect(state.player.x + 10, state.player.y - 10, 20, 10);

      // Draw Bullets
      ctx.fillStyle = '#FFD700';
      state.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, 4, 10);
      });

      // Draw Invaders
      state.invaders.forEach(inv => {
        ctx.fillStyle = inv.color;
        ctx.beginPath();
        ctx.arc(inv.x, inv.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(inv.x - 6, inv.y - 4, 4, 4);
        ctx.fillRect(inv.x + 2, inv.y - 4, 4, 4);

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(inv.username.substring(0, 10), inv.x, inv.y - 20);
      });

      // Draw Score
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${state.score}`, 20, 30);

      if (!state.isGameOver) {
        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    update();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [status]);

  const startGame = () => {
    gameState.current = {
      player: { x: 400, y: 550, width: 40, height: 40, speed: 5 },
      invaders: [],
      bullets: [],
      keys: { left: false, right: false, space: false },
      lastShot: 0,
      score: 0,
      isGameOver: false
    };
    setScore(0);
    setStatus('playing');
    processedMessageIds.current.clear();
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] font-arabic" dir="rtl">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent pointer-events-none" />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-brand-gold/10 bg-black/40 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onLeave}
            className="p-3 bg-brand-gold/5 hover:bg-brand-gold/10 text-brand-gold/70 hover:text-brand-gold rounded-xl transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">غزاة الشات</h2>
            <p className="text-brand-gold/50 text-sm">دافع عن سفينتك من رسائل المتابعين!</p>
          </div>
        </div>
        
        {status === 'playing' && (
          <button
            onClick={() => {
              gameState.current.isGameOver = true;
              setStatus('gameover');
              setScore(gameState.current.score);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-black/40 hover:bg-black/60 text-white rounded-xl font-bold transition-colors border border-brand-gold/20 hover:border-brand-gold/40"
          >
            <Square className="w-5 h-5 fill-current" />
            إنهاء اللعبة
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative">
        {status === 'setup' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-black/40 p-8 rounded-3xl border border-brand-gold/20 text-center"
          >
            <Skull className="w-24 h-24 text-brand-gold mx-auto mb-6 drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]" />
            <h3 className="text-2xl font-bold text-white mb-4">غزاة الشات</h3>
            <p className="text-zinc-400 mb-8">كل رسالة في الشات ستتحول إلى عدو. استخدم الأسهم للحركة و Space لإطلاق النار.</p>
            
            <button
              onClick={startGame}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-gold hover:bg-brand-gold-light text-black rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
            >
              <Play className="w-6 h-6 fill-current" />
              ابدأ اللعب
            </button>
          </motion.div>
        )}

        {status === 'playing' && (
          <div className="relative w-full max-w-[800px] aspect-[4/3] bg-black/80 rounded-2xl overflow-hidden border border-brand-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={600} 
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {status === 'gameover' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Trophy className="w-32 h-32 text-brand-gold mx-auto mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] glow-gold" />
            <h3 className="text-4xl font-bold text-white mb-4">انتهت اللعبة!</h3>
            <p className="text-2xl text-brand-gold font-bold mb-8">النقاط: {score}</p>
            
            <button
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-4 bg-brand-gold hover:bg-brand-gold-light text-black rounded-xl font-bold text-lg transition-colors mx-auto shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              <Play className="w-6 h-6 fill-current" />
              العب مرة أخرى
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
