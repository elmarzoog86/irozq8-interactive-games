import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTwitchAuth } from '../../contexts/TwitchAuthContext';
import { TwitchChat } from '../../components/TwitchChat';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Trophy, Play, CheckCircle, XCircle } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  fruit: string;
  lives: number;
  isActive: boolean;
}

const FRUITS = ['تفاحة', 'برتقالة', 'موزة', 'فراولة', 'عنب', 'بطيخ', 'مانجو', 'خوخ', 'كرز', 'كيوي'];

export function FruitWarGame() {
  const { user } = useTwitchAuth();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'roulette' | 'voting' | 'results'>('lobby');
  const [gameMode, setGameMode] = useState<'roulette' | 'voting'>('roulette');
  const [lives, setLives] = useState(3);
  const [timer, setTimer] = useState(60);

  // Handle player joining via chat
  const handleJoin = (username: string) => {
    if (!players.find(p => p.username === username)) {
      const randomFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
      setPlayers(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        username,
        fruit: randomFruit,
        lives,
        isActive: true
      }]);
    }
  };

  const startGame = () => {
    if (players.length > 0) {
      setGameState(gameMode);
    } else {
      alert('يرجى الانتظار حتى ينضم اللاعبون!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 border-b border-yellow-500/20 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/games')}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-300" />
          </button>
          <h1 className="text-2xl font-bold font-arabic text-yellow-500 glow-gold-text">
            حرب الفواكه
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-zinc-300" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex p-6 gap-6 max-w-[1600px] mx-auto w-full">
        {/* Left Column: Game Area */}
        <div className="flex-1 flex flex-col gap-6">
          {gameState === 'lobby' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col items-center justify-center backdrop-blur-sm">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/30 glow-gold">
                <span className="text-5xl">🍎</span>
              </div>
              
              <h2 className="text-4xl font-bold font-arabic mb-4 text-white">
                بانتظار <span className="text-yellow-500 glow-gold-text">اللاعبين...</span>
              </h2>
              <p className="text-zinc-400 font-arabic text-lg mb-8">
                اكتب <span className="text-yellow-500 font-mono bg-yellow-500/10 px-2 py-1 rounded">!join</span> في الشات للمشاركة
              </p>

              <div className="flex flex-col items-center gap-6 mb-12 w-full max-w-md">
                <div className="flex items-center justify-between w-full bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                  <span className="text-zinc-300 font-arabic font-bold">نمط اللعب</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setGameMode('roulette')}
                      className={`px-4 py-2 rounded-lg font-arabic text-sm transition-colors ${
                        gameMode === 'roulette' ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      الروليت
                    </button>
                    <button 
                      onClick={() => setGameMode('voting')}
                      className={`px-4 py-2 rounded-lg font-arabic text-sm transition-colors ${
                        gameMode === 'voting' ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      التصويت
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
                  <span className="text-zinc-300 font-arabic font-bold">عدد الأرواح</span>
                  <input 
                    type="number" 
                    value={lives}
                    onChange={(e) => setLives(Number(e.target.value))}
                    className="w-20 bg-zinc-900 border border-zinc-600 rounded-lg px-3 py-2 text-center text-white"
                    min="1" max="5"
                  />
                </div>
              </div>

              <button 
                onClick={startGame}
                disabled={players.length === 0}
                className={`bg-yellow-500 hover:bg-yellow-400 text-black px-10 py-4 rounded-full font-bold font-arabic text-xl transition-all flex items-center gap-3 ${
                  players.length === 0 ? 'opacity-50 cursor-not-allowed' : 'glow-gold'
                }`}
              >
                <Play className="w-6 h-6" />
                ابدأ اللعبة
              </button>
            </div>
          )}

          {gameState === 'roulette' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col items-center justify-center backdrop-blur-sm">
              <h2 className="text-3xl font-bold font-arabic mb-8 text-white">
                عجلة <span className="text-yellow-500 glow-gold-text">الروليت</span>
              </h2>
              
              {/* Placeholder for Roulette Wheel */}
              <div className="w-96 h-96 rounded-full border-8 border-yellow-500/30 flex items-center justify-center bg-zinc-800 relative overflow-hidden glow-gold">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,#d4af37_0deg_36deg,#0a0a0a_36deg_72deg,#d4af37_72deg_108deg,#0a0a0a_108deg_144deg,#d4af37_144deg_180deg,#0a0a0a_180deg_216deg,#d4af37_216deg_252deg,#0a0a0a_252deg_288deg,#d4af37_288deg_324deg,#0a0a0a_324deg_360deg)] opacity-20" />
                <span className="text-6xl z-10">🎡</span>
              </div>

              <div className="mt-12 flex gap-4">
                <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-full font-bold font-arabic transition-colors glow-gold">
                  لف العجلة
                </button>
              </div>
            </div>
          )}

          {gameState === 'voting' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold font-arabic text-white">
                  مرحلة <span className="text-yellow-500 glow-gold-text">التصويت</span>
                </h2>
                <div className="text-4xl font-mono font-bold text-yellow-500 glow-gold-text">
                  00:{timer.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto p-2 custom-scrollbar">
                {players.filter(p => p.isActive).map(player => (
                  <div key={player.id} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 flex flex-col items-center gap-3 relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-2 right-2 flex gap-1">
                      {Array.from({ length: player.lives }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
                      ))}
                    </div>
                    <span className="text-4xl mt-2">🍎</span>
                    <span className="font-bold font-arabic text-yellow-500">{player.fruit}</span>
                    <span className="font-medium text-zinc-300 text-sm">{player.username}</span>
                    <div className="w-full bg-zinc-900 rounded-full h-2 mt-2 overflow-hidden">
                      <div className="bg-yellow-500 h-full w-1/3" />
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">12 صوت</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gameState === 'results' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col items-center justify-center backdrop-blur-sm">
              <Trophy className="w-24 h-24 text-yellow-500 mb-6 glow-gold-text" />
              <h2 className="text-4xl font-bold font-arabic mb-8 text-white">
                الفائز <span className="text-yellow-500 glow-gold-text">النهائي</span>
              </h2>
              
              <div className="text-center">
                <span className="text-6xl mb-4 block">👑</span>
                <span className="text-3xl font-bold text-white block mb-2">PlayerOne</span>
                <span className="text-xl text-yellow-500 font-arabic">بطل حرب الفواكه!</span>
              </div>

              <button 
                onClick={() => setGameState('lobby')}
                className="mt-12 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-full font-bold font-arabic transition-colors"
              >
                العودة للوبي
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Chat & Players */}
        <div className="w-96 flex flex-col gap-6">
          {/* Active Players */}
          <div className="bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-6 backdrop-blur-sm flex flex-col h-1/3">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold font-mono">
                {players.filter(p => p.isActive).length}
              </span>
              <h3 className="font-bold font-arabic text-white">اللاعبين النشطين</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {players.length === 0 ? (
                <div className="text-center text-zinc-500 font-arabic text-sm mt-8">
                  لا يوجد لاعبين حتى الآن
                </div>
              ) : (
                players.map(player => (
                  <div key={player.id} className={`flex items-center justify-between bg-zinc-800/50 rounded-lg p-3 border ${player.isActive ? 'border-zinc-700/50' : 'border-red-500/30 opacity-50'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍎</span>
                      <span className="text-zinc-200 font-medium text-sm">{player.username}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: player.lives }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Twitch Chat */}
          <div className="flex-1 min-h-0">
            {user ? (
              <TwitchChat channelName={user.login} messages={[]} isConnected={true} error={null} />
            ) : (
              <div className="h-full bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center justify-center p-6 text-center">
                <p className="text-zinc-500 font-arabic">
                  يرجى تسجيل الدخول لعرض الشات
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
