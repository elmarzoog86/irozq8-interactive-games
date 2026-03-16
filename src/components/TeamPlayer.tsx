import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Swords, CheckCircle2, XCircle, Bomb, Key, Crown, MessageSquare, Eye } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  team: 'gold' | 'black' | null;
}

interface GameState {
  players: Player[];
  status: 'waiting' | 'buzzer' | 'playing' | 'results';
  gameType: 'teamfeud' | 'codenames' | 'bombrelay';
  data: any;
}

export const TeamPlayer: React.FC = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<GameState | null>(null);
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const handleGameState = (newState: GameState) => {
      setState(newState);
    };
    
    socket.on('team_game_state', handleGameState);

    return () => {
      socket.off('team_game_state', handleGameState);
    };
  }, []);

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId) {
      socket.emit('join_team_game', { roomId, name: name.trim() });
      setIsJoined(true);
    }
  };

  const switchTeam = (team: 'gold' | 'black') => {
    if (roomId) {
      socket.emit('switch_team', { roomId, playerId: socket.id, team, name });
    }
  };

  const submitAction = (action: string, payload: any) => {
    if (roomId) {
      socket.emit('submit_team_action', { roomId, action, payload: { ...payload, playerName: name } });
    }
  };

  if (!isJoined) {
    return (
      <div className="h-screen w-full bg-brand-black text-white flex items-center justify-center p-6 font-arabic" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-brand-black/70 border border-brand-cyan/20 p-8 rounded-[32px] shadow-[0_0_50px_rgba(0, 229, 255,0.1)] ">
          <h1 className="text-3xl font-black mb-8 text-center text-brand-cyan italic glow-cyan-text">انضم للعبة الفريق</h1>
          <form onSubmit={joinGame} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-cyan/50 mb-2 mr-2">اسمك المستعار</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ادخل اسمك..."
                className="w-full bg-brand-black/70 border-2 border-brand-cyan/20 p-4 rounded-2xl outline-none focus:border-brand-cyan transition-all text-center font-bold text-xl text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(0, 229, 255,0.3)]">
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!state) return <div className="h-screen w-full bg-brand-black text-white flex items-center justify-center">جاري التحميل...</div>;

  const myPlayer = state.players.find(p => p.id === socket?.id || p.name === name);

  return (
    <div className="h-screen w-full bg-brand-black text-white p-6 font-arabic" dir="rtl">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-brand-cyan glow-cyan-text">
            {state.gameType === 'teamfeud' ? 'تحدي الفرق' : state.gameType === 'codenames' ? 'لعبة الشفرة' : 'سباق القنبلة'}
          </h2>
          <div className="flex items-center gap-2 bg-brand-black/70 border border-brand-cyan/20 px-3 py-1 rounded-full text-xs font-bold text-brand-cyan/70">
            {state.gameType === 'teamfeud' && myPlayer?.team && state.data?.leaders?.[myPlayer.team] === myPlayer.id && (
              <Crown className="w-4 h-4 text-brand-cyan" />
            )}
            {name}
          </div>
        </div>

        {state.status === 'waiting' && (
          <div className="space-y-6">
            <h3 className="text-center text-xl font-bold text-brand-cyan">اختر فريقك</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => switchTeam('gold')}
                className={`p-8 rounded-3xl border-4 transition-all flex flex-col items-center gap-4 ${myPlayer?.team === 'gold' ? 'border-brand-cyan bg-brand-cyan/20 shadow-[0_0_20px_rgba(0, 229, 255,0.3)]' : 'border-brand-cyan/10 bg-brand-black/70 opacity-50 hover:opacity-80'}`}
              >
                <Shield className="w-12 h-12 text-brand-cyan" />
                <span className="font-black text-brand-cyan">ذهبي</span>
              </button>
              <button 
                onClick={() => switchTeam('black')}
                className={`p-8 rounded-3xl border-4 transition-all flex flex-col items-center gap-4 ${myPlayer?.team === 'black' ? 'border-zinc-400 bg-zinc-800/80 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-zinc-800 bg-brand-black/70 opacity-50 hover:opacity-80'}`}
              >
                <Shield className="w-12 h-12 text-white" />
                <span className="font-black text-white">أسود</span>
              </button>
            </div>
            <p className="text-center text-brand-cyan/40 text-sm">انتظر الستريمر لبدء اللعبة...</p>
          </div>
        )}

        {state.status === 'buzzer' && state.gameType === 'teamfeud' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-8 mt-12"
          >
            <h3 className="text-2xl font-black text-brand-cyan italic glow-cyan-text">مرحلة الزر!</h3>
            
            <div className="text-center">
              {state.data.buzzerTimer > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-brand-cyan/60 text-lg">استعد...</p>
                  <motion.div 
                    key={state.data.buzzerTimer}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-brand-cyan drop-shadow-[0_0_30px_rgba(0, 229, 255,0.8)]"
                  >
                    {state.data.buzzerTimer}
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 w-full">
                  {myPlayer?.team && state.data.leaders?.[myPlayer.team] === myPlayer.id ? (
                    <>
                      <p className="text-xl text-brand-cyan font-bold animate-pulse">
                        اضغط الزر الآن!!
                      </p>
                      {state.data.buzzerActive && (
                        <button 
                          onClick={() => submitAction('buzz', { team: myPlayer.team })}
                          className={`w-64 h-64 rounded-full border-8 font-black text-4xl shadow-[0_0_50px_rgba(255,0,0,0.6)] active:scale-95 transition-all
                            ${myPlayer.team === 'gold' 
                              ? 'bg-red-600 hover:bg-red-500 border-red-800 text-white' 
                              : 'bg-red-600 hover:bg-red-500 border-red-800 text-white'}`}
                        >
                          زر!
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xl text-brand-cyan font-bold animate-pulse">
                      شجع قائد فريقك ليضغط الزر!
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {state.status === 'playing' && (
          <div className="space-y-8">
            {state.gameType === 'teamfeud' && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border-4 text-center ${state.data.currentTurn === myPlayer?.team ? 'border-brand-cyan bg-brand-cyan/10 shadow-[0_0_20px_rgba(0, 229, 255,0.2)]' : 'border-brand-cyan/10 opacity-50'}`}>
                  <h3 className="text-xl font-bold text-brand-cyan">{state.data.currentTurn === myPlayer?.team ? 'دور فريقك!' : 'دور الفريق الآخر'}</h3>
                  <p className="text-3xl font-black mt-2 text-white">{state.data.question}</p>
                </div>

                {state.data.currentTurn === myPlayer?.team && (
                  state.data.leaders?.[myPlayer.team] === myPlayer.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); submitAction('guess', { guess: answer }); setAnswer(''); }} className="space-y-4">
                      <input 
                        type="text" 
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="أنت القائد! اكتب إجابة فريقك..."
                        className="w-full bg-brand-black/70 border-2 border-brand-cyan/20 p-4 rounded-2xl text-center font-bold focus:border-brand-cyan outline-none text-white"
                      />
                      <button type="submit" className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black py-4 rounded-2xl font-black shadow-[0_0_15px_rgba(0, 229, 255,0.3)]">إرسال</button>
                    </form>
                  ) : (
                    <div className="bg-brand-cyan/10 border border-brand-cyan/20 p-6 rounded-2xl text-center">
                      <p className="text-brand-cyan font-bold">أخبر القائد بإجابتك!</p>
                      <p className="text-sm text-brand-cyan/60 mt-2">القائد فقط من يمكنه كتابة الإجابة النهائية</p>
                    </div>
                  )
                )}
              </div>
            )}

            {state.gameType === 'codenames' && (
              <div className="space-y-6">
                {state.data.currentHint && (
                  <div className="bg-brand-cyan/20 border-2 border-brand-cyan p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(0, 229, 255,0.3)] animate-pulse">
                    <p className="text-sm text-brand-cyan/80 mb-1">تلميح Spymaster الجديد:</p>
                    <p className="text-2xl font-black text-brand-cyan mb-2">{state.data.currentHint.word} - {state.data.currentHint.count}</p>
                    {state.data.guessesLeft !== undefined && (
                      <p className="text-xs font-bold text-white bg-brand-black/50 inline-block px-3 py-1 rounded-full">الخيارات المتبقية: {state.data.guessesLeft}</p>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center bg-brand-black/70 p-4 border border-brand-cyan/20 rounded-2xl">
                  <div className={`text-sm font-bold ${state.data.currentTurn === 'gold' ? 'text-brand-cyan' : 'text-zinc-500'}`}>الذهبي: {state.data.scores?.gold ?? 9}</div>
                  <div className="text-lg font-black text-white">دور {state.data.currentTurn === 'gold' ? 'الذهبي' : 'الأسود'}</div>
                  <div className={`text-sm font-bold ${state.data.currentTurn === 'black' ? 'text-white' : 'text-zinc-500'}`}>الأسود: {state.data.scores?.black ?? 8}</div>
                </div>

                {state.data.currentTurn === myPlayer?.team && state.data.currentHint && state.data.guessesLeft !== undefined && state.data.guessesLeft > 0 && !(myPlayer?.team && state.data.spymasters?.[myPlayer.team] === myPlayer.name) && (
                  <button
                    onClick={() => submitAction('pass_turn', { team: myPlayer?.team, playerName: myPlayer?.name })}
                    className="w-full bg-red-900/50 hover:bg-red-800 transition-colors border-2 border-red-500/50 text-white font-bold p-3 rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                  >
                    إنهاء الدور الآن
                  </button>
                )}

                {/* Floating button for History */}
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="fixed bottom-20 left-4 z-40 flex justify-center items-center gap-2 p-3 rounded-full bg-brand-black/80 border-2 border-brand-cyan text-brand-cyan text-sm font-bold shadow-[0_0_20px_rgba(0, 229, 255,0.3)] hover:bg-brand-cyan/20 backdrop-blur-sm transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden sm:inline">سجل الحركات</span>
                </button>

                <AnimatePresence>
                  {showHistory && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-brand-black/60 z-40 backdrop-blur-sm"
                        onClick={() => setShowHistory(false)}
                      />
                      <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0a0a0a] border-l border-brand-cyan/30 p-5 z-50 overflow-y-auto shadow-2xl flex flex-col gap-4"
                      >
                        <div className="flex items-center justify-between border-b border-brand-cyan/20 pb-4">
                          <h3 className="text-xl font-bold text-brand-cyan flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            سجل الحركات
                          </h3>
                          <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-white transition-colors">
                            <XCircle className="w-6 h-6" />
                          </button>
                        </div>
                        
                        {state.data.history && state.data.history.length > 0 ? (
                          <div className="space-y-3">
                            {state.data.history.map((entry: any, idx: number) => (
                              <div key={idx} className={`p-3 rounded-xl flex flex-col gap-2 border ${entry.team === 'gold' ? 'bg-brand-cyan/5 border-brand-cyan/20 text-brand-cyan' : 'bg-zinc-800/50 border-zinc-700 text-zinc-300'}`}>
                                <div className="flex justify-between items-center text-[10px] opacity-70">
                                  <span>{entry.team === 'gold' ? 'الفريق الذهبي' : 'الفريق الأسود'}</span>
                                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {entry.type === 'hint' ? (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Key className="w-4 h-4 shrink-0" />
                                    <span>{entry.playerName ? `تلميح من ${entry.playerName}:` : 'تلميح:'} <strong className="text-base text-white">«{entry.word}» ({entry.count})</strong></span>
                                  </div>
                                ) : entry.type === 'pass' ? (
                                  <div className="flex items-center gap-2 text-sm text-red-400">
                                    <XCircle className="w-4 h-4 shrink-0" />
                                    <span>إنهاء الدور ({entry.playerName || 'لاعب'})</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Eye className="w-4 h-4 shrink-0" />
                                    <span>{entry.playerName || 'لاعب'} اختار: <strong className="text-white">{entry.cardWord}</strong></span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-zinc-500 mt-10 text-sm">
                            لا توجد حركات مسجلة بعد
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {state.data.spymasters?.[myPlayer?.team!] === myPlayer?.name && (
                  <div className="bg-brand-cyan/10 border border-brand-cyan p-4 rounded-xl space-y-4">
                    <div className="text-center">
                      <p className="font-bold text-brand-cyan text-lg">أنت قائد الفريق!</p>
                      <p className="text-sm text-brand-cyan/70 mt-1">اكتب التلميح (كلمة واحدة) وعدد الكلمات المرتبطة به.</p>
                    </div>

                    <form 
                      className="flex gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (hintWord.trim() && hintCount) {
                          submitAction('give_hint', { word: hintWord.trim(), count: parseInt(hintCount) });
                          setHintWord('');
                          setHintCount('');
                        }
                      }}
                    >
                      <input
                        type="text"
                        value={hintWord}
                        onChange={(e) => setHintWord(e.target.value)}
                        placeholder="التلميح..."
                        className="flex-1 bg-brand-black/80 border border-brand-cyan/30 p-3 rounded-xl text-center focus:border-brand-cyan outline-none text-white font-bold"
                        required
                      />
                      <input
                        type="number"
                        value={hintCount}
                        onChange={(e) => setHintCount(e.target.value)}
                        placeholder="العدد"
                        min="1"
                        max="9"
                        className="w-20 bg-brand-black/80 border border-brand-cyan/30 p-3 rounded-xl text-center focus:border-brand-cyan outline-none text-white font-bold"
                        required
                      />
                      <button type="submit" className="bg-brand-cyan hover:bg-brand-pink text-brand-black px-4 rounded-xl font-black transition-all">إرسال</button>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {state.data.board.map((card: any, i: number) => {
                    const isSpymaster = myPlayer?.team && state.data.spymasters?.[myPlayer.team] === myPlayer.name;
                    let bgColor = 'bg-brand-black/80';
                    let textColor = 'text-white';
                    let borderColor = 'border-brand-cyan/20';

                    if (card.revealed || isSpymaster) {
                      if (card.type === 'gold') { bgColor = 'bg-[#00e5ff]'; textColor = 'text-brand-black'; borderColor = 'border-[#FFE55C]'; }
                      else if (card.type === 'black') { bgColor = 'bg-zinc-800'; textColor = 'text-white'; borderColor = 'border-brand-cyan shadow-[0_0_10px_rgba(0, 229, 255,0.4)]'; }
                      else if (card.type === 'assassin') { bgColor = 'bg-red-950'; textColor = 'text-red-500'; borderColor = 'border-red-600'; }
                      else { bgColor = 'bg-zinc-900'; textColor = 'text-zinc-500'; borderColor = 'border-zinc-800'; }
                    }                    return (
                      <button
                        key={i}
                        onClick={() => {
                            if (!card.revealed && state.data.currentTurn === myPlayer?.team && !isSpymaster) {
                              const hasVoted = card.votes?.includes(myPlayer?.name);
                              if (hasVoted) {
                                submitAction('reveal', { index: i, playerName: myPlayer?.name });
                              } else {
                                submitAction('vote', { index: i, playerName: myPlayer?.name });
                              }
                            }
                        }}
                        disabled={card.revealed || isSpymaster || state.data.currentTurn !== myPlayer?.team}
                        className={`relative aspect-square sm:h-24 rounded-xl border-b-[4px] transition-all flex items-center justify-center p-1 text-center font-bold text-xs sm:text-base leading-tight shadow-md ${bgColor} ${textColor} ${borderColor} ${card.revealed ? 'opacity-30' : 'hover:scale-105 active:scale-95'}`}
                      >
                        {card.word}
                        {!card.revealed && card.votes?.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-brand-cyan text-brand-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-xs font-black shadow-lg border border-yellow-200 z-10">
                            {card.votes.length}
                          </span>
                        )}
                        {!card.revealed && card.votes?.includes(myPlayer?.name) && (
                          <span className="absolute bottom-1 left-0 right-0 text-[8px] sm:text-[10px] text-brand-cyan font-bold opacity-80 pointer-events-none">تأكيد؟</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {state.gameType === 'bombrelay' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-black font-mono text-brand-cyan drop-shadow-[0_0_10px_rgba(0, 229, 255,0.5)]">{state.data.timer}s</div>
                </div>
                {state.data.tasks.map((task: any) => (
                  <div key={task.id} className={`p-6 rounded-2xl border-2 ${task.completed ? 'bg-brand-cyan/20 border-brand-cyan' : 'bg-brand-black/70 border-brand-cyan/20'}`}>
                    <h4 className="font-bold mb-4 text-white">{task.text}</h4>
                    {!task.completed && (
                      task.target ? (
                        <button onClick={() => submitAction('task_progress', { taskId: task.id })} className="w-full bg-brand-cyan hover:bg-brand-pink text-brand-black py-3 rounded-xl font-black shadow-[0_0_15px_rgba(0, 229, 255,0.3)]">تفكيك!</button>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="الإجابة..."
                          className="w-full bg-brand-black/70 border border-brand-cyan/20 p-3 rounded-xl text-center focus:border-brand-cyan outline-none text-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              submitAction('task_progress', { taskId: task.id, answer: (e.target as HTMLInputElement).value });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

