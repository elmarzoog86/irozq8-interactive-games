import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTwitchAuth } from '../contexts/TwitchAuthContext';
import YouTube from 'react-youtube';
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
    
    setTimeLeft(clipLength);
    setIsPlaying(true);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(clipSettings.start, true);
        playerRef.current.playVideo();
    }
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
    } else if (timeLeft === 0 && gameState === 'playing' && isPlaying) {
      setIsPlaying(false);
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }
  }, [gameState, isPlaying, timeLeft]);

  // Volume control
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(volume);
    }
  }, [volume]);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8 relative overflow-hidden font-arabic">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-brand-gold/5 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
          <div className="absolute -bottom-[20%] left-[20%] w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px] animate-pulse delay-2000"></div>
      </div>
      
      {/* Back Button */}
      {onLeave && (
        <div className="absolute top-4 left-4 z-50">
          <div 
            onClick={onLeave}
            className="bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors cursor-pointer "
          >
            <ArrowLeft size={24} />
          </div>
        </div>
      )}

      {/* Hidden Player - Switched to ReactPlayer */}
      {/* Moved to central stage */}

      {gameState === 'setup' && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-black/80  border border-brand-gold/30 p-8 rounded-[40px] max-w-lg w-full text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.1)] z-10">
            <div className="w-20 h-20 bg-brand-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                <Music className="w-10 h-10 text-brand-gold" />
            </div>
            <h1 className="text-4xl font-black mb-4 text-brand-gold glow-gold-text">خمن الموسيقى</h1>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-brand-gold/50 text-sm font-bold">الفريق الأول</label>
                    <input 
                        type="text" 
                        value={teams[0].name}
                        onChange={(e) => setTeams(prev => [{...prev[0], name: e.target.value}, prev[1]])}
                        className="w-full bg-black/70 border border-brand-gold/20 focus:border-brand-gold p-4 rounded-xl text-center text-xl text-white placeholder-brand-gold/20 transition-all outline-none"
                        placeholder="اسم الفريق الأول"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-brand-gold/50 text-sm font-bold">الفريق الثاني</label>
                    <input 
                        type="text" 
                        value={teams[1].name}
                        onChange={(e) => setTeams(prev => [prev[0], {...prev[1], name: e.target.value}])}
                        className="w-full bg-black/70 border border-brand-gold/20 focus:border-brand-gold p-4 rounded-xl text-center text-xl text-white placeholder-brand-gold/20 transition-all outline-none"
                        placeholder="اسم الفريق الثاني"
                    />
                </div>
                <div className="flex items-center justify-center gap-4 bg-black/20 p-4 rounded-xl border border-brand-gold/10">
                    <span className="text-brand-gold/70 font-bold">النقاط للفوز:</span>
                    <input 
                        type="number" 
                        value={pointsToWin}
                        onChange={(e) => setPointsToWin(Number(e.target.value))}
                        className="w-20 bg-black/70 border border-brand-gold/20 p-2 rounded-lg text-center text-white font-bold outline-none focus:border-brand-gold"
                    />
                </div>
            </div>
            
            <button 
                onClick={startGame}
                className="w-full bg-brand-gold hover:bg-brand-gold/80 text-black p-4 rounded-xl font-black text-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95"
            >
                بدء اللعبة
            </button>
        </motion.div>
      )}

      {(gameState === 'playing' || gameState === 'revealed') && currentSong && (
        <div className="w-full max-w-6xl flex flex-col h-full z-10 relative">
            <div className="absolute top-0 left-0 w-1 h-1 overflow-hidden opacity-0 pointer-events-none -z-10">
                <YouTube
                  key={currentSong.id}
                  videoId={currentSong.id}
                  opts={{
                    height: '300',
                    width: '300',
                    playerVars: {
                        autoplay: isPlaying ? 1 : 0,
                        start: clipSettings.start,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3
                    }
                  }}
                  onReady={(e) => {
                    playerRef.current = e.target;
                    e.target.unMute();
                    e.target.setVolume(volume);
                  }}
                  onStateChange={(e) => {
                    if (e.data === 0) setIsPlaying(false); // ended
                  }}
                />
            </div>
            {/* Header / Controls */}
            <div className="flex justify-between items-center bg-black/70 border border-brand-gold/20 p-6 rounded-2xl mb-8  shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                <div className="flex items-center gap-6 w-1/3">
                    <div className="bg-brand-gold/10 p-3 rounded-full">
                        <Volume2 className="text-brand-gold" size={24} />
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume} 
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full accent-brand-gold h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                
                <div className="text-4xl font-black w-1/3 text-center text-brand-gold glow-gold-text tabular-nums">
                    {timeLeft > 0 ? `${timeLeft}s` : 'انتهى الوقت!'}
                </div>

                <div className="w-1/3 flex justify-end gap-3">
                    {gameState === 'playing' && (
                        <>
                              <button 
                                  onClick={() => {
                                      if (!isPlaying) {
                                          setIsPlaying(true);
                                          if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
                                              playerRef.current.seekTo(clipSettings.start, true);
                                              playerRef.current.playVideo();
                                          }
                                      } else {
                                          setIsPlaying(false);
                                          if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
                                              playerRef.current.pauseVideo();
                                          }
                                      }
                                  }} 
                                  className={`px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50' : 'bg-brand-gold text-black hover:bg-brand-gold/80 hover:scale-105'}`}
                              >
                                {isPlaying ? 'إيقاف' : 'تشغيل'}
                                {!isPlaying && <Play size={20} className="fill-current" />}
                            </button>
                            <button onClick={replayMusic} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-4 py-3 rounded-xl font-bold hover:bg-blue-500/30 flex items-center gap-2 transition-all" title="إعادة تشغيل المقطع">
                                <RotateCcw size={20} />
                            </button>
                        </>
                    )}
                    {gameState === 'revealed' ? (
                       <button onClick={() => nextRound()} className="bg-brand-gold text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-brand-gold/80 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                           <SkipForward size={20} className="fill-current" /> جولة تالية
                       </button>
                    ) : (
                       <button onClick={() => setGameState('revealed')} className="bg-zinc-800 text-gray-300 border border-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-zinc-700 hover:text-white transition-all">
                           كشف الإجابة
                       </button>
                    )}
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 grid grid-cols-12 gap-8 items-start">
               {/* Team 1 */}
               <div className={`col-span-3 bg-black/70  p-6 rounded-[30px] border-2 flex flex-col items-center gap-6 transition-all h-[500px] shadow-xl ${blockedTeamId === 1 ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-brand-gold/20'}`}>
                    <h2 className="text-3xl font-black text-white">{teams[0].name}</h2>
                    <div className="text-8xl font-black my-4 text-brand-gold glow-gold-text drop-shadow-2xl">{teams[0].score}</div>
                    
                    <div className="w-full space-y-3 mb-4 flex-1">
                        <h3 className="text-xs text-brand-gold/50 uppercase tracking-[0.2em] text-center mb-4 font-bold">وسائل المساعدة</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => useLifeline(0, 'doublePoints')}
                                disabled={!teams[0].lifelines.doublePoints || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[0].lifelines.doublePoints ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Zap size={18} className={teams[0].lifelines.doublePoints ? "fill-current" : ""} /> x2
                            </button>
                            <button 
                                onClick={() => useLifeline(0, 'block')}
                                disabled={!teams[0].lifelines.block || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[0].lifelines.block ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Shield size={18} className={teams[0].lifelines.block ? "fill-current" : ""} /> حظر
                            </button>
                            <button 
                                onClick={() => useLifeline(0, 'hint')}
                                disabled={!teams[0].lifelines.hint || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[0].lifelines.hint ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Search size={18} /> تلميح
                            </button>
                        </div>
                    </div>

                    <div className="flex w-full gap-3 mt-auto">
                        <button onClick={() => setGameState('revealed')} disabled={gameState !== 'playing'} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95">
                            <X className="mx-auto" size={32} />
                        </button>
                        <button onClick={() => handleCorrect(0)} disabled={roundWinner !== null} className={`flex-1 p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 border ${roundWinner !== null ? 'bg-zinc-900 text-gray-600 border-zinc-800 cursor-not-allowed' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'}`}>
                            <Check className="mx-auto" size={32} />
                        </button>
                    </div>
               </div>

                {/* Center Stage */}
                <div className="col-span-6 flex flex-col items-center justify-center pt-8">
                    <div className="relative w-80 h-80 flex items-center justify-center mb-12 group">
                        {/* Glow Effect */}
                        <div className={`absolute inset-0 bg-brand-gold/20 rounded-full blur-[60px] transition-all duration-1000 ${isPlaying ? 'opacity-50 scale-110' : 'opacity-20 scale-90'}`}></div>
                        
                        {/* Vinyl Record */}
                        <div className={`w-72 h-72 bg-black rounded-full flex items-center justify-center border-4 border-zinc-800 relative z-10 shadow-2xl transition-transform duration-[3s] ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                            {/* Vinyl Grooves */}
                            <div className="absolute inset-2 rounded-full border border-zinc-900/50"></div>
                            <div className="absolute inset-4 rounded-full border border-zinc-900/50"></div>
                            <div className="absolute inset-6 rounded-full border border-zinc-900/50"></div>
                            <div className="absolute inset-8 rounded-full border border-zinc-900/50"></div>
                            
                            {/* Center Label / Player */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-brand-gold rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold via-yellow-600 to-yellow-800 opacity-80"></div>
                                <Music size={40} className="text-black relative z-10" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center w-full min-h-[160px]">
                        {gameState === 'revealed' ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-black/70  rounded-3xl p-8 border border-brand-gold/20 shadow-lg mx-auto max-w-lg">
                                <h3 className="text-brand-gold/60 text-lg mb-2 font-bold uppercase tracking-widest">الأغنية هي</h3>
                                <div className="text-4xl font-black text-white leading-tight mb-4">
                                    {currentSong?.name}
                                </div>
                                {roundWinner && (
                                    <div className="inline-block bg-green-500/10 text-green-400 px-6 py-2 rounded-full font-bold border border-green-500/20 animate-pulse">
                                        +{(isDoublePointsActive ? 2 : 1)} نقطة لـ {roundWinner.name}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                <div className={`text-3xl font-black ${isPlaying ? 'text-brand-gold animate-pulse' : 'text-gray-600'}`}>
                                    {isPlaying ? '...جاري التشغيل' : 'اضغط تشغيل'}
                                </div>
                                <div className="flex flex-col gap-2 items-center">
                                    {isDoublePointsActive && (
                                        <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-lg font-bold border border-indigo-500/20 animate-bounce flex items-center gap-2">
                                            <Zap size={18} className="fill-current" /> جولة نقاط مضاعفة!
                                        </div>
                                    )}
                                    {blockedTeamId && (
                                        <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg font-bold border border-red-500/20 flex items-center gap-2">
                                            <Shield size={18} className="fill-current" /> {teams.find(t => t.id === blockedTeamId)?.name} ممنوع من الإجابة!
                                        </div>
                                    )}
                                    {isHintActive && currentSong && (
                                        <div className="bg-emerald-500/10 text-emerald-400 px-6 py-3 rounded-xl border border-emerald-500/20 font-bold flex items-center gap-3">
                                            <Search size={18} />
                                            <span>
                                                بداية: {(currentSong.name || '').substring(0, 3)}...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

               {/* Team 2 */}
               <div className={`col-span-3 bg-black/70  p-6 rounded-[30px] border-2 flex flex-col items-center gap-6 transition-all h-[500px] shadow-xl ${blockedTeamId === 2 ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-brand-gold/20'}`}>
                    <h2 className="text-3xl font-black text-white">{teams[1].name}</h2>
                    <div className="text-8xl font-black my-4 text-brand-gold glow-gold-text drop-shadow-2xl">{teams[1].score}</div>
                    
                    <div className="w-full space-y-3 mb-4 flex-1">
                        <h3 className="text-xs text-brand-gold/50 uppercase tracking-[0.2em] text-center mb-4 font-bold">وسائل المساعدة</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                onClick={() => useLifeline(1, 'doublePoints')}
                                disabled={!teams[1].lifelines.doublePoints || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[1].lifelines.doublePoints ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 hover:bg-indigo-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Zap size={18} className={teams[1].lifelines.doublePoints ? "fill-current" : ""} /> x2
                            </button>
                            <button 
                                onClick={() => useLifeline(1, 'block')}
                                disabled={!teams[1].lifelines.block || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[1].lifelines.block ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Shield size={18} className={teams[1].lifelines.block ? "fill-current" : ""} /> حظر
                            </button>
                            <button 
                                onClick={() => useLifeline(1, 'hint')}
                                disabled={!teams[1].lifelines.hint || gameState !== 'playing'}
                                className={`w-full p-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all border ${teams[1].lifelines.hint ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30' : 'bg-zinc-900/50 text-gray-600 border-zinc-800 cursor-not-allowed'}`}
                            >
                                <Search size={18} /> تلميح
                            </button>
                        </div>
                    </div>

                    <div className="flex w-full gap-3 mt-auto">
                        <button onClick={() => setGameState('revealed')} disabled={gameState !== 'playing'} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95">
                            <X className="mx-auto" size={32} />
                        </button>
                        <button onClick={() => handleCorrect(1)} disabled={roundWinner !== null} className={`flex-1 p-4 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 border ${roundWinner !== null ? 'bg-zinc-900 text-gray-600 border-zinc-800 cursor-not-allowed' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'}`}>
                            <Check className="mx-auto" size={32} />
                        </button>
                    </div>
               </div>
            </div>
        </div>
      )}

      {gameState === 'end' && (
        <div className="text-center relative z-10">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-brand-gold/20 blur-[100px] rounded-full"></div>
                <Trophy size={120} className="text-brand-gold relative z-10 mx-auto drop-shadow-2xl animate-bounce" />
            </div>
            <h1 className="text-8xl font-black mb-6 text-white drop-shadow-xl">🏆 الفائز!</h1>
            <div className="text-6xl text-brand-gold glow-gold-text mb-12 font-black">
                {teams[0].score > teams[1].score ? teams[0].name : teams[1].name}
            </div>
            <button onClick={() => {
                setGameState('setup');
                setTeams(teams.map(t => ({...t, score: 0, lifelines: {doublePoints: true, block: true, hint: true}})));
            }} className="bg-brand-gold text-black px-12 py-6 rounded-2xl text-2xl font-black hover:bg-green-500 hover:text-white transition-all shadow-[0_0_50px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.4)] hover:scale-105">
                لعبة جديدة
            </button>
        </div>
      )}
    </div>
  );
}
