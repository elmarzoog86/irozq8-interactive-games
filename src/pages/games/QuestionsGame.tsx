import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTwitchAuth } from '../../contexts/TwitchAuthContext';
import { TwitchChat } from '../../components/TwitchChat';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Trophy, Play, CheckCircle, XCircle } from 'lucide-react';

interface Player {
  id: string;
  username: string;
  score: number;
  isActive: boolean;
}

export function QuestionsGame() {
  const { user } = useTwitchAuth();
  const navigate = useNavigate();
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'results'>('lobby');
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [timer, setTimer] = useState(15);
  const [streamerAnswer, setStreamerAnswer] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Handle player joining via chat
  // In a real app, this would listen to the TwitchChat component or context
  const handleJoin = (username: string) => {
    if (!players.find(p => p.username === username)) {
      setPlayers(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        username,
        score: 0,
        isActive: true
      }]);
    }
  };

  const startGame = () => {
    if (players.length > 0) {
      setGameState('playing');
      setCurrentQuestion(1);
    } else {
      alert('يرجى الانتظار حتى ينضم اللاعبون!');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      setStreamerAnswer('');
      setIsTimerRunning(false);
    } else {
      setGameState('results');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-80" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-2xl" />
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
            سين جيم
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
              <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mb-8 border border-yellow-500/30 glow-gold">
                <Users className="w-12 h-12 text-yellow-500" />
              </div>
              
              <h2 className="text-4xl font-bold font-arabic mb-4 text-white">
                بانتظار <span className="text-yellow-500 glow-gold-text">اللاعبين...</span>
              </h2>
              <p className="text-zinc-400 font-arabic text-lg mb-8">
                اكتب <span className="text-yellow-500 font-mono bg-yellow-500/10 px-2 py-1 rounded">!join</span> في الشات للمشاركة
              </p>

              <div className="flex items-center gap-6 mb-12">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-zinc-400 font-arabic text-sm">عدد الأسئلة</span>
                  <input 
                    type="number" 
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-center text-white"
                    min="5" max="20"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-zinc-400 font-arabic text-sm">الوقت (ثواني)</span>
                  <input 
                    type="number" 
                    value={timer}
                    onChange={(e) => setTimer(Number(e.target.value))}
                    className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-center text-white"
                    min="5" max="60"
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

          {gameState === 'playing' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <div className="text-zinc-400 font-arabic">
                  السؤال <span className="text-yellow-500 font-bold text-xl">{currentQuestion}</span> من {totalQuestions}
                </div>
                <div className="text-4xl font-mono font-bold text-yellow-500 glow-gold-text">
                  00:{timer.toString().padStart(2, '0')}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Streamer Control Panel */}
                <div className="w-full max-w-2xl bg-black/50 border border-zinc-800 rounded-xl p-8">
                  <h3 className="text-xl font-bold font-arabic text-yellow-500 mb-6 text-right">
                    لوحة تحكم الستريمر
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-zinc-400 font-arabic text-sm mb-2 text-right">
                        الإجابة الصحيحة (مخفية)
                      </label>
                      <input 
                        type="password" 
                        value={streamerAnswer}
                        onChange={(e) => setStreamerAnswer(e.target.value)}
                        placeholder="أدخل الإجابة هنا..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-right font-arabic focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all outline-none"
                      />
                    </div>

                    <div className="flex gap-4 justify-end">
                      <button 
                        onClick={() => setIsTimerRunning(true)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-bold font-arabic transition-colors"
                      >
                        بدأ المؤقت
                      </button>
                      <button 
                        onClick={handleNextQuestion}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold font-arabic transition-colors glow-gold"
                      >
                        السؤال التالي
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gameState === 'results' && (
            <div className="flex-1 bg-zinc-900/50 rounded-2xl border border-yellow-500/20 p-8 flex flex-col items-center justify-center backdrop-blur-sm">
              <Trophy className="w-24 h-24 text-yellow-500 mb-6 glow-gold-text" />
              <h2 className="text-4xl font-bold font-arabic mb-8 text-white">
                النتائج <span className="text-yellow-500 glow-gold-text">النهائية</span>
              </h2>
              
              <div className="w-full max-w-md space-y-4">
                {players.sort((a, b) => b.score - a.score).map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-zinc-400'}`}>
                        #{index + 1}
                      </span>
                      <span className="font-medium text-white">{player.username}</span>
                    </div>
                    <span className="text-yellow-500 font-mono font-bold">{player.score}</span>
                  </div>
                ))}
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
                {players.length}
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
                  <div key={player.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                    <span className="text-yellow-500 font-mono text-sm">{player.score}</span>
                    <span className="text-zinc-200 font-medium">{player.username}</span>
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
