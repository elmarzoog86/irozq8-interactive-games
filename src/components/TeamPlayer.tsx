import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Swords, CheckCircle2, XCircle, Bomb, Key, Crown } from 'lucide-react';

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
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [answer, setAnswer] = useState('');
  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState('');

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('team_game_state', (newState: GameState) => {
      setState(newState);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomId) {
      socket?.emit('join_team_game', { roomId, name: name.trim() });
      setIsJoined(true);
    }
  };

  const switchTeam = (team: 'gold' | 'black') => {
    if (roomId) {
      socket?.emit('switch_team', { roomId, playerId: socket.id, team, name });
    }
  };

  const submitAction = (action: string, payload: any) => {
    if (roomId) {
      socket?.emit('submit_team_action', { roomId, action, payload });
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-arabic" dir="rtl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-black/40 border border-brand-gold/20 p-8 rounded-[32px] shadow-[0_0_50px_rgba(212,175,55,0.1)] backdrop-blur-xl">
          <h1 className="text-3xl font-black mb-8 text-center text-brand-gold italic glow-gold-text">انضم للعبة الفريق</h1>
          <form onSubmit={joinGame} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-brand-gold/50 mb-2 mr-2">اسمك المستعار</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ادخل اسمك..."
                className="w-full bg-black/40 border-2 border-brand-gold/20 p-4 rounded-2xl outline-none focus:border-brand-gold transition-all text-center font-bold text-xl text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-black py-4 rounded-2xl text-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!state) return <div className="min-h-screen bg-black text-white flex items-center justify-center">جاري التحميل...</div>;

  const myPlayer = state.players.find(p => p.id === socket?.id || p.name === name);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-arabic" dir="rtl">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-brand-gold glow-gold-text">
            {state.gameType === 'teamfeud' ? 'تحدي الفرق' : state.gameType === 'codenames' ? 'لعبة الشفرة' : 'سباق القنبلة'}
          </h2>
          <div className="flex items-center gap-2 bg-black/40 border border-brand-gold/20 px-3 py-1 rounded-full text-xs font-bold text-brand-gold/70">
            {state.gameType === 'teamfeud' && myPlayer?.team && state.data?.leaders?.[myPlayer.team] === myPlayer.id && (
              <Crown className="w-4 h-4 text-brand-gold" />
            )}
            {name}
          </div>
        </div>

        {state.status === 'waiting' && (
          <div className="space-y-6">
            <h3 className="text-center text-xl font-bold text-brand-gold">اختر فريقك</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => switchTeam('gold')}
                className={`p-8 rounded-3xl border-4 transition-all flex flex-col items-center gap-4 ${myPlayer?.team === 'gold' ? 'border-brand-gold bg-brand-gold/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'border-brand-gold/10 bg-black/40 opacity-50 hover:opacity-80'}`}
              >
                <Shield className="w-12 h-12 text-brand-gold" />
                <span className="font-black text-brand-gold">ذهبي</span>
              </button>
              <button 
                onClick={() => switchTeam('black')}
                className={`p-8 rounded-3xl border-4 transition-all flex flex-col items-center gap-4 ${myPlayer?.team === 'black' ? 'border-zinc-400 bg-zinc-800/50 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-zinc-800 bg-black/40 opacity-50 hover:opacity-80'}`}
              >
                <Shield className="w-12 h-12 text-white" />
                <span className="font-black text-white">أسود</span>
              </button>
            </div>
            <p className="text-center text-brand-gold/40 text-sm">انتظر الستريمر لبدء اللعبة...</p>
          </div>
        )}

        {state.status === 'buzzer' && state.gameType === 'teamfeud' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-8 mt-12"
          >
            <h3 className="text-2xl font-black text-brand-gold italic glow-gold-text">مرحلة الزر!</h3>
            
            <div className="text-center">
              {state.data.buzzerTimer > 0 ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-brand-gold/60 text-lg">استعد...</p>
                  <motion.div 
                    key={state.data.buzzerTimer}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black text-brand-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]"
                  >
                    {state.data.buzzerTimer}
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 w-full">
                  {myPlayer?.team && state.data.leaders?.[myPlayer.team] === myPlayer.id ? (
                    <>
                      <p className="text-xl text-brand-gold font-bold animate-pulse">
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
                    <p className="text-xl text-brand-gold font-bold animate-pulse">
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
                <div className={`p-6 rounded-3xl border-4 text-center ${state.data.currentTurn === myPlayer?.team ? 'border-brand-gold bg-brand-gold/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'border-brand-gold/10 opacity-50'}`}>
                  <h3 className="text-xl font-bold text-brand-gold">{state.data.currentTurn === myPlayer?.team ? 'دور فريقك!' : 'دور الفريق الآخر'}</h3>
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
                        className="w-full bg-black/40 border-2 border-brand-gold/20 p-4 rounded-2xl text-center font-bold focus:border-brand-gold outline-none text-white"
                      />
                      <button type="submit" className="w-full bg-brand-gold hover:bg-brand-gold-light text-black py-4 rounded-2xl font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">إرسال</button>
                    </form>
                  ) : (
                    <div className="bg-brand-gold/10 border border-brand-gold/20 p-6 rounded-2xl text-center">
                      <p className="text-brand-gold font-bold">أخبر القائد بإجابتك!</p>
                      <p className="text-sm text-brand-gold/60 mt-2">القائد فقط من يمكنه كتابة الإجابة النهائية</p>
                    </div>
                  )
                )}
              </div>
            )}

            {state.gameType === 'codenames' && (
              <div className="space-y-6">
                {state.data.currentHint && (
                  <div className="bg-brand-gold/20 border-2 border-brand-gold p-4 rounded-2xl text-center shadow-[0_0_15px_rgba(212,175,55,0.3)] animate-pulse">
                    <p className="text-sm text-brand-gold/80 mb-1">تلميح Spymaster الجديد:</p>
                    <p className="text-2xl font-black text-brand-gold">{state.data.currentHint.word} - {state.data.currentHint.count}</p>
                  </div>
                )}

                <div className="flex justify-between items-center bg-black/40 p-4 border border-brand-gold/20 rounded-2xl">
                  <div className={`text-sm font-bold ${state.data.currentTurn === 'gold' ? 'text-brand-gold' : 'text-zinc-500'}`}>الذهبي: {state.data.scores?.gold ?? 9}</div>
                  <div className="text-lg font-black text-white">دور {state.data.currentTurn === 'gold' ? 'الذهبي' : 'الأسود'}</div>
                  <div className={`text-sm font-bold ${state.data.currentTurn === 'black' ? 'text-white' : 'text-zinc-500'}`}>الأسود: {state.data.scores?.black ?? 8}</div>
                </div>

                {state.data.spymasters?.[myPlayer?.team!] === myPlayer?.id && (
                  <div className="bg-brand-gold/10 border border-brand-gold p-4 rounded-xl space-y-4">
                    <div className="text-center">
                      <p className="font-bold text-brand-gold text-lg">أنت قائد الفريق!</p>
                      <p className="text-sm text-brand-gold/70 mt-1">اكتب التلميح (كلمة واحدة) وعدد الكلمات المرتبطة به.</p>
                    </div>
                    {state.data.currentTurn === myPlayer?.team && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (hintWord.trim() && hintCount.trim()) {
                          submitAction('give_hint', { word: hintWord.trim(), count: parseInt(hintCount.trim()) });
                          setHintWord('');
                          setHintCount('');
                        }
                      }} className="flex gap-2">
                        <input 
                          type="text" 
                          value={hintWord}
                          onChange={(e) => setHintWord(e.target.value)}
                          placeholder="التلميح..."
                          className="flex-1 bg-black/60 border border-brand-gold/30 p-3 rounded-xl text-center focus:border-brand-gold outline-none text-white font-bold"
                          required
                        />
                        <input 
                          type="number" 
                          value={hintCount}
                          onChange={(e) => setHintCount(e.target.value)}
                          placeholder="العدد"
                          min="1"
                          max="9"
                          className="w-20 bg-black/60 border border-brand-gold/30 p-3 rounded-xl text-center focus:border-brand-gold outline-none text-white font-bold"
                          required
                        />
                        <button type="submit" className="bg-brand-gold hover:bg-brand-gold-light text-black px-4 rounded-xl font-black transition-all">إرسال</button>
                      </form>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2">
                  {state.data.board.map((card: any, i: number) => {
                    const isSpymaster = myPlayer?.team && state.data.spymasters?.[myPlayer.team] === myPlayer.id;
                    let bgColor = 'bg-black/80';
                    let textColor = 'text-white';
                    let borderColor = 'border-brand-gold/20';

                      if (card.revealed || isSpymaster) {
                        if (card.type === 'gold') { bgColor = 'bg-[#D4AF37]'; textColor = 'text-black'; borderColor = 'border-[#FFE55C]'; }
                        else if (card.type === 'black') { bgColor = 'bg-zinc-800'; textColor = 'text-white'; borderColor = 'border-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.4)]'; }
                        else if (card.type === 'assassin') { bgColor = 'bg-red-950'; textColor = 'text-red-500'; borderColor = 'border-red-600'; }
                        else { bgColor = 'bg-zinc-900'; textColor = 'text-zinc-500'; borderColor = 'border-zinc-800'; }
                      }                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (!card.revealed && state.data.currentTurn === myPlayer?.team && !isSpymaster) {
                            const hasVoted = card.votes?.includes(myPlayer?.id);
                            if (hasVoted) {
                              submitAction('reveal', { index: i });
                            } else {
                              submitAction('vote', { index: i, playerId: myPlayer?.id });
                            }
                          }
                        }}
                        disabled={card.revealed || isSpymaster || state.data.currentTurn !== myPlayer?.team}
                        className={`relative aspect-square sm:h-24 rounded-xl border-b-[4px] transition-all flex items-center justify-center p-1 text-center font-bold text-xs sm:text-base leading-tight shadow-md ${bgColor} ${textColor} ${borderColor} ${card.revealed ? 'opacity-30' : 'hover:scale-105 active:scale-95'}`}
                      >
                        {card.word}
                        {!card.revealed && card.votes?.length > 0 && (
                          <span className="absolute -top-2 -right-2 bg-brand-gold text-black rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center text-xs font-black shadow-lg border border-yellow-200 z-10">
                            {card.votes.length}
                          </span>
                        )}
                        {!card.revealed && card.votes?.includes(myPlayer?.id) && (
                          <span className="absolute bottom-1 left-0 right-0 text-[8px] sm:text-[10px] text-brand-gold font-bold opacity-80 pointer-events-none">تأكيد؟</span>
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
                  <div className="text-6xl font-black font-mono text-brand-gold drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">{state.data.timer}s</div>
                </div>
                {state.data.tasks.map((task: any) => (
                  <div key={task.id} className={`p-6 rounded-2xl border-2 ${task.completed ? 'bg-brand-gold/20 border-brand-gold' : 'bg-black/40 border-brand-gold/20'}`}>
                    <h4 className="font-bold mb-4 text-white">{task.text}</h4>
                    {!task.completed && (
                      task.target ? (
                        <button onClick={() => submitAction('task_progress', { taskId: task.id })} className="w-full bg-brand-gold hover:bg-brand-gold-light text-black py-3 rounded-xl font-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">تفكيك!</button>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="الإجابة..."
                          className="w-full bg-black/40 border border-brand-gold/20 p-3 rounded-xl text-center focus:border-brand-gold outline-none text-white"
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
