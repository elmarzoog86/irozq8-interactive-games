import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTwitchAuth } from '../contexts/TwitchAuthContext';
import ReactPlayer from 'react-player';
import { Music, Play, Volume2, SkipForward, Trophy, Users, X, Check, Shield, Zap, Search, ArrowLeft, RotateCcw } from 'lucide-react';


interface Song {
  name: string;
  id?: string;
  url?: string;
  duration?: { seconds: number; timestamp: string } | string;
}

interface Team {
  id: 1 | 2;
  name: string;
  score: number;
  lifelines: {
    doublePoints: boolean;
    block: boolean;
    hint: boolean;
  };
}

interface MusicGuesserGameProps {
  onLeave?: () => void;
}

export function MusicGuesserGame({ onLeave }: MusicGuesserGameProps) {
  const { user } = useTwitchAuth();
  
  // Game State
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'revealed' | 'end'>('setup');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  
  // Round State
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef<any>(null);
  const [roundWinner, setRoundWinner] = useState<Team | null>(null);
  const [clipSettings, setClipSettings] = useState({ start: 0, end: 0 });

  // Teams & Settings
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Team 1', score: 0, lifelines: { doublePoints: true, block: true, hint: true } },
    { id: 2, name: 'Team 2', score: 0, lifelines: { doublePoints: true, block: true, hint: true } }
  ]);
  const [pointsToWin, setPointsToWin] = useState(5);
  const [blockedTeamId, setBlockedTeamId] = useState<number | null>(null);
  const [isDoublePointsActive, setIsDoublePointsActive] = useState(false);
  const [isHintActive, setIsHintActive] = useState(false);
  const [playedSongIds, setPlayedSongIds] = useState<Set<string>>(new Set());

  // Fetch playlist
  useEffect(() => {
    fetch('/api/music/playlist')
      .then(res => res.json())
      .then(data => setSongs(data))
      .catch(err => console.error(err));
  }, []);

  const startGame = () => {
    const validSongs = songs.filter(s => s.id);
    if (validSongs.length === 0) {
        // alert("لا توجد أغاني جاهزة للتشغيل (جاري البحث عن المعرفات...)");
        // Reload playlist just in case
        fetch('/api/music/playlist')
            .then(res => res.json())
            .then(data => {
                setSongs(data);
                const newDataValid = data.filter((s: Song) => s.id);
                if (newDataValid.length > 0) {
                    // alert("تم تحديث القائمة! اضغط بدء اللعبة مرة أخرى.");
                    setCurrentSong(newDataValid[Math.floor(Math.random() * newDataValid.length)]);
                    setGameState('playing');
                    nextRound(data);
                } else {
                    alert("قائمة الأغاني فارغة أو لا يوجد لها معرفات يوتيوب.");
                }
            });
        return;
    }
    setGameState('playing');
    nextRound();
  };

  const parseDuration = (d: any): number => {
    if (typeof d === 'object' && d?.seconds) return d.seconds;
    if (typeof d === 'string') {
        const parts = d.split(':').map(Number);
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 180; // Default 3 mins
  };

  const nextRound = (overrideSongs?: Song[]) => {
    setIsPlaying(false);
    
    // Slight delay to ensure player is torn down before building new one
    setTimeout(() => {
        const songList = overrideSongs || songs;
        const validSongs = songList.filter(s => s.id && !playedSongIds.has(s.id));
        
        if (validSongs.length === 0) {
            if (songList.filter(s => s.id).length === 0) return; 
            setPlayedSongIds(new Set()); 
            const randomSong = songList.filter(s => s.id)[Math.floor(Math.random() * songList.filter(s => s.id).length)];
            setupRoundWithSong(randomSong);
            return;
        }

        const randomSong = validSongs[Math.floor(Math.random() * validSongs.length)];
        setupRoundWithSong(randomSong);
    }, 50);
  };

  const setupRoundWithSong = (song: Song) => {
    if (song.id) {
        setPlayedSongIds(prev => new Set(prev).add(song.id!));
    }
    setCurrentSong(song);
    setGameState('playing');
    setRoundWinner(null);
    setBlockedTeamId(null);
    setIsDoublePointsActive(false);
    setIsHintActive(false);
    setIsPlaying(false); // <--- REQUIRED: Stops auto-play to avoid the browser AbortError blocking it!
    
    // Calculate random start time (15-20s clip)
    const duration = parseDuration(song.duration);
    const maxStart = Math.max(0, duration - 25); 
    const startTime = Math.floor(Math.random() * maxStart);
    const clipLength = Math.floor(Math.random() * 5) + 15; // 15-20s

    setClipSettings({ start: startTime, end: startTime + clipLength });
    setTimeLeft(clipLength);
    // Let the user press Play to avoid autoplay blocks
    setIsPlaying(false);
  };

  const replayMusic = () => {
    if (!currentSong?.id || gameState === 'setup') return;
    
    // Calculate a standard length if not matching clip settings
    const clipLength = clipSettings.end - clipSettings.start || 15;
    
    setIsPlaying(false);
    setTimeLeft(clipLength);

    // Force re-render of player by toggling state after small delay
    setTimeout(() => {
        setIsPlaying(true);
        if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
            playerRef.current.seekTo(clipSettings.start, 'seconds');
        }
    }, 100);
  };

  const handleCorrect = (teamIndex: number) => {
    if (roundWinner) return; // Prevent double points
    const newTeams = [...teams];
    const points = isDoublePointsActive ? 2 : 1;
    newTeams[teamIndex].score += points;
    setTeams(newTeams);
    setRoundWinner(newTeams[teamIndex]);
    setGameState('revealed');

    // Check win condition
    if (newTeams[teamIndex].score >= pointsToWin) {
      setTimeout(() => setGameState('end'), 3000);
    }
  };

  const useLifeline = (teamIndex: number, type: 'doublePoints' | 'block' | 'hint') => {
    if (!teams[teamIndex].lifelines[type]) return;

    const newTeams = [...teams];
    newTeams[teamIndex].lifelines[type] = false;
    setTeams(newTeams);

    if (type === 'doublePoints') setIsDoublePointsActive(true);
    if (type === 'block') setBlockedTeamId(teams[teamIndex].id === 1 ? 2 : 1);
    if (type === 'hint') setIsHintActive(true);
  };

  // Timer
  useEffect(() => {
    if (gameState === 'playing' && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setIsPlaying(false);
    }
  }, [gameState, isPlaying, timeLeft]);

  // Volume control
  useEffect(() => {
    // Note: react-player controls volume through props, we don't strictly need imperative calls
    // unless we use getInternalPlayer(), but handling it via the volume prop usually suffices
  }, [volume]);

  return (
    <div className="min-h-screen w-full bg-zinc-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-arabic">
      
      {/* Back Button */}
      {onLeave && (
        <div className="absolute top-4 left-4 z-50">
          <div 
            onClick={onLeave}
            className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer backdrop-blur-sm"
          >
            <ArrowLeft size={24} />
          </div>
        </div>
      )}

      {/* Hidden Player - Switched to ReactPlayer */}
      {currentSong?.id && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
           <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${currentSong.id}`}
              playing={isPlaying}
              volume={volume / 100}
              width="0"
              height="0"
              config={{
                youtube: {
                   start: clipSettings.start,
                   rel: 0,
                   iv_load_policy: 3
                }
              }}
              onEnded={() => setIsPlaying(false)}
           />
        </div>
      )}

      {gameState === 'setup' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-800 p-8 rounded-2xl max-w-lg w-full text-center space-y-6">
            <h1 className="text-4xl font-bold mb-4">إعدادات اللعبة</h1>
            <div className="space-y-4">
                <input 
                    type="text" 
                    value={teams[0].name}
                    onChange={(e) => setTeams(prev => [{...prev[0], name: e.target.value}, prev[1]])}
                    className="w-full bg-zinc-700 p-3 rounded-xl text-center text-xl placeholder-gray-400"
                    placeholder="اسم الفريق الأول"
                />
                <input 
                    type="text" 
                    value={teams[1].name}
                    onChange={(e) => setTeams(prev => [prev[0], {...prev[1], name: e.target.value}])}
                    className="w-full bg-zinc-700 p-3 rounded-xl text-center text-xl placeholder-gray-400"
                    placeholder="اسم الفريق الثاني"
                />
                <div className="flex items-center justify-center gap-4">
                    <span>النقاط للفوز:</span>
                    <input 
                        type="number" 
                        value={pointsToWin}
                        onChange={(e) => setPointsToWin(Number(e.target.value))}
                        className="w-20 bg-zinc-700 p-2 rounded text-center"
                    />
                </div>
            </div>
            <button 
                onClick={startGame}
                className="w-full bg-purple-600 hover:bg-purple-700 p-4 rounded-xl font-bold text-xl transition-colors"
            >
                بدء اللعبة
            </button>
        </motion.div>
      )}

      {(gameState === 'playing' || gameState === 'revealed') && currentSong && (
        <div className="w-full max-w-6xl flex flex-col h-full z-10 relative">
            {/* Header / Controls */}
            <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-2xl mb-6 backdrop-blur-sm">
                <div className="flex items-center gap-4 w-1/3">
                    <Volume2 />
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                
                <div className="text-2xl font-mono font-bold w-1/3 text-center">
                    {timeLeft > 0 ? `${timeLeft}s` : 'Time\'s Up!'}
                </div>

                <div className="w-1/3 flex justify-end gap-2">
                    {gameState === 'playing' && (
                        <>
                            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-6 py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}>
                                {isPlaying ? 'إيقاف' : 'تشغيل'}
                                {!isPlaying && <Play size={20} />}
                            </button>
                            <button onClick={replayMusic} className="bg-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-blue-500 flex items-center gap-2" title="إعادة تشغيل المقطع">
                                <RotateCcw size={20} />
                            </button>
                        </>
                    )}
                    {gameState === 'revealed' ? (
                       <button onClick={() => nextRound()} className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400">
                           <SkipForward size={20} /> جولة تالية
                       </button>
                    ) : (
                       <button onClick={() => setGameState('revealed')} className="bg-gray-600 px-6 py-2 rounded-lg font-bold hover:bg-gray-500">
                           كشف الإجابة
                       </button>
                    )}
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 grid grid-cols-12 gap-8 items-start">
               {/* Team 1 */}
               <div className={`col-span-3 bg-blue-900/30 p-6 rounded-3xl border-2 ${blockedTeamId === 1 ? 'border-red-500 opacity-50' : 'border-blue-500/30'} flex flex-col items-center gap-4 transition-all`}>
                    <h2 className="text-3xl font-bold text-blue-400">{teams[0].name}</h2>
                    <div className="text-6xl font-mono font-bold my-4">{teams[0].score}</div>
                    
                    <div className="w-full space-y-2 mb-4">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest text-center mb-2">Lifelines</h3>
                        <button 
                            onClick={() => useLifeline(0, 'doublePoints')}
                            disabled={!teams[0].lifelines.doublePoints || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[0].lifelines.doublePoints ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Zap size={16} /> نقاط مضاعفة
                        </button>
                        <button 
                            onClick={() => useLifeline(0, 'block')}
                            disabled={!teams[0].lifelines.block || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[0].lifelines.block ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Shield size={16} /> بلوك
                        </button>
                        <button 
                            onClick={() => useLifeline(0, 'hint')}
                            disabled={!teams[0].lifelines.hint || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[0].lifelines.hint ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Search size={16} /> تلميح
                        </button>
                    </div>

                    <div className="flex w-full gap-2 mt-auto">
                        <button onClick={() => setGameState('revealed')} disabled={gameState !== 'playing'} className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 p-4 rounded-xl cursor-pointer">
                            <X className="mx-auto" size={32} />
                        </button>
                        <button onClick={() => handleCorrect(0)} disabled={roundWinner !== null} className={`flex-1 p-4 rounded-xl cursor-pointer ${roundWinner !== null ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-500/20 hover:bg-green-500/40 text-green-500'}`}>
                            <Check className="mx-auto" size={32} />
                        </button>
                    </div>
               </div>

                {/* Center Stage */}
                <div className="col-span-6 flex flex-col items-center justify-center pt-10">
                    <div className="relative w-64 h-64 flex items-center justify-center mb-8">
                        <div className={`absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 ${isPlaying ? 'animate-pulse' : ''}`}></div>
                        <div className="w-48 h-48 bg-zinc-800 rounded-full flex items-center justify-center border-4 border-white/10 relative z-10 shadow-2xl">
                             <Music size={64} className={isPlaying ? 'animate-bounce' : ''} />
                        </div>
                    </div>
                    
                    <div className="text-center min-h-[120px]">
                        {gameState === 'revealed' ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                                <h3 className="text-gray-400 text-xl mb-2">الأغنية هي</h3>
                                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                                    {currentSong?.name}
                                </div>
                                {roundWinner && (
                                    <div className="mt-4 text-green-400 font-bold text-xl animate-bounce">
                                        نقطة لـ {roundWinner.name}!
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-2xl text-gray-500 animate-pulse">جاري التشغيل...</div>
                                {isDoublePointsActive && <div className="text-yellow-400 font-bold">⚠️ جولة نقاط مضاعفة!</div>}
                                {blockedTeamId && <div className="text-red-400 font-bold">🛑 {teams.find(t => t.id === blockedTeamId)?.name} ممنوع من الإجابة!</div>}
                                {isHintActive && currentSong && (
                                    <div className="bg-zinc-800 p-3 rounded text-sm text-gray-300 border border-gray-700">
                                        تلميح: أسم الفنان يبدأ بـ {(currentSong.name || '').split('-')[0]?.trim().slice(0, 3)}...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

               {/* Team 2 */}
               <div className={`col-span-3 bg-red-900/30 p-6 rounded-3xl border-2 ${blockedTeamId === 2 ? 'border-red-500 opacity-50' : 'border-red-500/30'} flex flex-col items-center gap-4 transition-all`}>
                    <h2 className="text-3xl font-bold text-red-400">{teams[1].name}</h2>
                    <div className="text-6xl font-mono font-bold my-4">{teams[1].score}</div>
                    
                    <div className="w-full space-y-2 mb-4">
                        <h3 className="text-sm text-gray-400 uppercase tracking-widest text-center mb-2">Lifelines</h3>
                        <button 
                            onClick={() => useLifeline(1, 'doublePoints')}
                            disabled={!teams[1].lifelines.doublePoints || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[1].lifelines.doublePoints ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Zap size={16} /> نقاط مضاعفة
                        </button>
                        <button 
                            onClick={() => useLifeline(1, 'block')}
                            disabled={!teams[1].lifelines.block || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[1].lifelines.block ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Shield size={16} /> بلوك
                        </button>
                        <button 
                            onClick={() => useLifeline(1, 'hint')}
                            disabled={!teams[1].lifelines.hint || gameState !== 'playing'}
                            className={`w-full p-2 rounded flex items-center justify-center gap-2 ${teams[1].lifelines.hint ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                        >
                            <Search size={16} /> تلميح
                        </button>
                    </div>

                    <div className="flex w-full gap-2 mt-auto">
                        <button onClick={() => setGameState('revealed')} disabled={gameState !== 'playing'} className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-500 p-4 rounded-xl cursor-pointer">
                            <X className="mx-auto" size={32} />
                        </button>
                        <button onClick={() => handleCorrect(1)} disabled={roundWinner !== null} className={`flex-1 p-4 rounded-xl cursor-pointer ${roundWinner !== null ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-green-500/20 hover:bg-green-500/40 text-green-500'}`}>
                            <Check className="mx-auto" size={32} />
                        </button>
                    </div>
               </div>
            </div>
        </div>
      )}

      {gameState === 'end' && (
        <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">🏆 الفائز!</h1>
            <div className="text-4xl text-yellow-400 mb-8">{teams[0].score > teams[1].score ? teams[0].name : teams[1].name}</div>
            <button onClick={() => {
                setGameState('setup');
                setTeams(teams.map(t => ({...t, score: 0, lifelines: {doublePoints: true, block: true, hint: true}})));
            }} className="bg-purple-600 px-8 py-3 rounded-xl text-xl font-bold">
                لعبة جديدة
            </button>
        </div>
      )}
    </div>
  );
}
