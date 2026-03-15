const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/components/TrivialPursuitGame.tsx');
let content = fs.readFileSync(targetPath, 'utf-8');

// Update Game State Type
content = content.replace(
  /'stage2_result' \| 'game_over'>/,
  "'stage2_result' | 'stage3_intro' | 'stage3_category_pick' | 'stage3_playing' | 'stage3_result' | 'stage4_intro' | 'stage4_playing' | 'stage4_result' | 'game_over'>"
);

// Add state variables for Stage 3 and Stage 4 right after setStage2Winner
const stateVars = `
  // Stage 3 State
  const [stage3ActivePlayerIndex, setStage3ActivePlayerIndex] = useState(0);
  const [stage3Categories, setStage3Categories] = useState<string[]>([]);
  const [stage3Eliminated, setStage3Eliminated] = useState<string[]>([]);
  const [stage3CurrentCategory, setStage3CurrentCategory] = useState<string | null>(null);
  const [stage3Q, setStage3Q] = useState<{q: string, options: string[], a: number} | null>(null);

  // Stage 4 State
  const [stage4ActivePlayerIndex, setStage4ActivePlayerIndex] = useState(0);
  const [stage4Eliminated, setStage4Eliminated] = useState<string[]>([]);
  const [stage4Guessed, setStage4Guessed] = useState<string[]>([]);
  
  const STAGE4_Q = {
    title: 'عواصم الدول العربية',
    answers: ['الرياض', 'الكويت', 'مقط', 'مسقط', 'ابوظبي', 'أبوظبي', 'الدوحة', 'المنامة', 'بغداد', 'دمشق', 'بيروت', 'عمان', 'القدس', 'صنعاء', 'القاهرة', 'الخرطوم', 'طرابلس', 'تونس', 'الجزائر', 'الرباط', 'مقديشو', 'موروني', 'جيبوتي', 'نواكشوط']
  };
`;
if (!content.includes('const [stage3ActivePlayerIndex')) {
  // Try inserting after stage2Winner
  content = content.replace(
    /const \[stage2Winner, setStage2Winner\] = useState<string \| null>\(null\);/,
    "const [stage2Winner, setStage2Winner] = useState<string | null>(null);\n" + stateVars
  );
}

// Add Transition from Stage 2 to Stage 3 instead of game_over
content = content.replace(
  /if \(stage2QuestionCount \+ 1 >= 10\) \{\n\s*setGameState\('game_over'\);\n\s*\}/g,
  `if (stage2QuestionCount + 1 >= 10) {
                  setGameState('stage3_intro');
                  setTimeout(() => {
                    startStage3Turn(0);
                  }, 5000);
                }`
);

// We need a helper to start stage 3 turn
const stage34Helpers = `
  const startStage3Turn = (playerIndex: number) => {
    // Check if we did all players
    if (playerIndex >= players.length) {
      setGameState('stage4_intro');
      setTimeout(() => {
        startStage4(0);
      }, 5000);
      return;
    }
    setStage3ActivePlayerIndex(playerIndex);
    setGameState('stage3_category_pick');
    setStage3Eliminated([]);
    
    // Pick 3 random categories out of our main categories
    const allCats = ['history', 'science', 'sports', 'entertainment'];
    const shuffled = allCats.sort(() => 0.5 - Math.random());
    setStage3Categories(shuffled.slice(0, 3));
    setTimeLeft(15);
  };

  const selectStage3Category = (catId: string) => {
    setStage3CurrentCategory(catId);
    setStage3QuestionCount(0);
    // nextStage3Question safely
    const qList = QUESTIONS[catId];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage3Q(rq);
    setGameState('stage3_playing');
    setTimeLeft(15);
  };

  const nextStage3Question = (catId: string, qIndex: number) => {
    if (qIndex >= 5) {
      // next player's turn
      setGameState('stage3_result');
      setTimeout(() => {
         startStage3Turn(stage3ActivePlayerIndex + 1);
      }, 3000);
      return;
    }
    const qList = QUESTIONS[catId];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage3Q(rq);
    setGameState('stage3_playing');
    setTimeLeft(15);
  };

  const startStage4 = (pIndex: number) => {
    setGameState('stage4_playing');
    setStage4ActivePlayerIndex(pIndex);
    setTimeLeft(15);
  };
  
  const endStage4Turn = (status: 'correct' | 'wrong' | 'timeout', pIndex: number) => {
    setGameState('stage4_result');
    if (status === 'wrong' || status === 'timeout') {
      setStage4Eliminated(prev => [...prev, players[pIndex].username]);
    }
    
    setTimeout(() => {
      // check if 1 player left or all answered
      setPlayers(latestPlayers => {
        setStage4Eliminated(latestEliminated => {
            const stillIn = latestPlayers.filter((p, i) => !latestEliminated.includes(p.username));
            if (stillIn.length <= 1) {
               setGameState('game_over');
               return latestEliminated;
            } else {
               let nextIdx = (pIndex + 1) % latestPlayers.length;
               while (latestEliminated.includes(latestPlayers[nextIdx].username) && stillIn.length > 1) {
                  nextIdx = (nextIdx + 1) % latestPlayers.length;
               }
               startStage4(nextIdx);
               return latestEliminated;
            }
        });
        return latestPlayers;
      });
    }, 4000);
  };
`;
if (!content.includes('startStage3Turn =')) {
  content = content.replace(
    /const startGame = \(\) => \{/,
    stage34Helpers + "\n  const startGame = () => {"
  );
}

// Update Chat Logic for Stage 3 & Stage 4
const stage34ChatLogic = `
        // Stage 3 Category Pick
        if (gameState === 'stage3_category_pick' && players[stage3ActivePlayerIndex]?.username === username) {
             const num = parseInt(text);
             if (!isNaN(num) && num >= 1 && num <= 3) {
                 selectStage3Category(stage3Categories[num - 1]);
             }
        }

        // Stage 3 Answering
        if (gameState === 'stage3_playing' && stage3Q && !stage3Eliminated.includes(username)) {
           const num = parseInt(text);
           if (!isNaN(num) && num >= 1 && num <= 4) {
              if (num !== stage3Q.a) {
                // wrong answer -> eliminated for round
                setStage3Eliminated(prev => [...prev, username]);
                // if active player is eliminated, fast forward turn? 
                // prompt says: "if someone gets the answer wrong they get eliminated for that round"
                // Everyone plays together in phase 3? Wait, prompt says: "every player choses a between 3 categories... when the question appears the players choose... if someone gets answer wrong they get eliminated for that round... when all 5 questions are answered the turn goes for the next player to choose a category..."
                // So all players answer simultaneously.
              } else {
                // point reward could be added
              }
           }
        }

        // Stage 4 Answering
        if (gameState === 'stage4_playing' && players[stage4ActivePlayerIndex]?.username === username) {
           const val = text.trim();
           const isExact = STAGE4_Q.answers.some(a => val.includes(a) || a.includes(val)) && !stage4Guessed.includes(val);
           if (isExact) {
              setStage4Guessed(prev => [...prev, val]);
              endStage4Turn('correct', stage4ActivePlayerIndex);
           } else {
              endStage4Turn('wrong', stage4ActivePlayerIndex);
           }
        }
`;
if (!content.includes("gameState === 'stage3_category_pick'")) {
  content = content.replace(
    /(\/\/ Stage 2 Answering)/,
    stage34ChatLogic + "\n        $1"
  );
}

// Timer logic update for stage3_category_pick / stage3_playing / stage4_playing
if (!content.includes("gameState === 'stage3_playing'")) {
    content = content.replace(
      /if \(gameState === 'turn_start' \|\| gameState === 'answering' \|\| gameState === 'stage2_playing'\) \{/g,
      "if (gameState === 'turn_start' || gameState === 'answering' || gameState === 'stage2_playing' || gameState === 'stage3_category_pick' || gameState === 'stage3_playing' || gameState === 'stage4_playing') {"
    );

    const newTimerConditions = `
              } else if (gameState === 'stage3_category_pick') {
                  selectStage3Category(stage3Categories[0]);
              } else if (gameState === 'stage3_playing') {
                  setStage3QuestionCount(prev => {
                     const next = prev + 1;
                     nextStage3Question(stage3CurrentCategory || 'history', next);
                     return next;
                  });
              } else if (gameState === 'stage4_playing') {
                  endStage4Turn('timeout', stage4ActivePlayerIndex);
              }
`;
    if(!content.includes("gameState === 'stage3_category_pick'")) {
        content = content.replace(
          /} else if \(gameState === 'stage2_playing'\) \{/,
          newTimerConditions + "\n              } else if (gameState === 'stage2_playing') {"
        );
    }
}

// Now adding UI Views for Stage 3 & 4
const stage34UI = `
                            {gameState === 'stage3_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Users className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الثالثة</h2>
                                <p className="text-2xl text-zinc-300">يختار كل لاعب موضوع لـ 5 أسئلة، الإجابة الخاطئة تقصيك للروند القادم!</p>
                              </motion.div>
                            )}
                            
                            {gameState === 'stage3_category_pick' && (
                              <motion.div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] z-50">
                                <h2 className="text-4xl font-black text-white mb-6">دور: <span className="text-brand-gold">{players[stage3ActivePlayerIndex]?.username}</span></h2>
                                <p className="text-zinc-400 mb-8 text-xl">اختر تصنيف عبر كتابة (1 - 3) في الشات</p>
                                <div className="flex gap-6 max-w-2xl mx-auto w-full justify-center">
                                   {stage3Categories.map((catId, i) => {
                                      const cat = CATEGORIES.find(c => c.id === catId);
                                      return (
                                        <div key={catId} className="bg-[#1a1a1a] p-8 rounded-3xl border-2 border-brand-gold/30 text-center flex-1">
                                          <div className="w-16 h-16 mx-auto bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold text-2xl font-bold mb-4">{i+1}</div>
                                          <div className="text-white font-bold text-2xl">{cat?.name}</div>
                                        </div>
                                      );
                                   })}
                                </div>
                              </motion.div>
                            )}

                            {gameState === 'stage3_playing' && stage3Q && (
                               <motion.div className="flex-1 flex flex-col p-8 bg-[#0a0a0a] z-50">
                                 <div className="flex justify-between items-center mb-6">
                                   <div className="bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-xl font-bold">سؤال {stage3QuestionCount + 1}/5 (تصنيف: {CATEGORIES.find(c => c.id === stage3CurrentCategory)?.name})</div>
                                   <div className="text-3xl font-mono text-white flex items-center gap-2"><Timer className="w-8 h-8 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 </div>
                                 <h2 className="text-3xl font-bold text-white text-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">{stage3Q.q}</h2>
                                 <div className="grid grid-cols-2 gap-4">
                                   {stage3Q.options.map((opt, i) => (
                                     <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                       <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-brand-gold">{i + 1}</span>
                                       <span className="text-xl text-white font-bold">{opt}</span>
                                     </div>
                                   ))}
                                 </div>
                                 
                                 {/* Show who is Eliminated */}
                                 {stage3Eliminated.length > 0 && (
                                     <div className="mt-8 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center">
                                        <p className="text-rose-400 font-bold mb-2">تم إقصائهم لهذه الجولة:</p>
                                        <p className="text-white">{stage3Eliminated.join(' - ')}</p>
                                     </div>
                                 )}
                               </motion.div>
                            )}
                            
                            {gameState === 'stage3_result' && (
                              <motion.div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] z-50 text-center">
                                 <Trophy className="w-24 h-24 text-brand-gold mb-6" />
                                 <h2 className="text-4xl text-white font-black mb-4">انتهت الجولة!</h2>
                                 <p className="text-xl text-zinc-400">ينتقل الدور للاعب التالي لاختيار التصنيف...</p>
                              </motion.div>
                            )}

                            {gameState === 'stage4_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Trophy className="w-32 h-32 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الرابعة والأخيرة</h2>
                                <p className="text-2xl text-zinc-300">أجب نصياً! إجابة صحيحة = بقاء، خاطئة/تأخر = خروج للمركز الأخير.</p>
                              </motion.div>
                            )}

                            {gameState === 'stage4_playing' && (
                               <motion.div className="flex-1 flex flex-col p-8 items-center justify-center text-center bg-[#0a0a0a] z-50">
                                 <div className="text-4xl font-mono text-white flex items-center gap-2 mb-8"><Timer className="w-10 h-10 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 <h3 className="text-2xl text-brand-gold mb-2">دور اللاعب:</h3>
                                 <h2 className="text-6xl font-black text-white mb-8 border-b border-brand-gold/30 pb-4">{players[stage4ActivePlayerIndex]?.username}</h2>
                                 
                                 <div className="bg-white/5 border border-brand-gold/20 p-8 rounded-3xl w-full max-w-2xl mb-8">
                                    <p className="text-3xl font-bold text-white mb-4">{STAGE4_Q.title}</p>
                                    <p className="text-zinc-400">اكتب اسم واحد فقط باللغة العربية حصراً.</p>
                                 </div>
                                 
                                 <div className="flex gap-4 mb-4">
                                     <span className="text-rose-400 font-bold">تم إقصاء: ({stage4Eliminated.length})</span>
                                     <span className="text-emerald-400 font-bold">متبقي: ({players.length - stage4Eliminated.length})</span>
                                 </div>
                               </motion.div>
                            )}

                            {gameState === 'stage4_result' && (
                               <motion.div className="flex-1 flex items-center justify-center flex-col text-center p-8 bg-[#0a0a0a] z-50">
                                 <h2 className="text-4xl text-white font-black mb-6">جارٍ معالجة الإجابة...</h2>
                                 {stage4Eliminated.includes(players[stage4ActivePlayerIndex]?.username) ? (
                                    <>
                                        <XCircle className="w-20 h-20 text-rose-500 mb-4" />
                                        <p className="text-rose-400 font-bold text-3xl">تم إقصاء {players[stage4ActivePlayerIndex]?.username}!</p>
                                    </>
                                 ) : (
                                    <>
                                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
                                        <p className="text-emerald-400 font-bold text-3xl">إجابة صحيحة! {players[stage4ActivePlayerIndex]?.username} يبقى في اللعبة.</p>
                                    </>
                                 )}
                               </motion.div>
                            )}
`;

if (!content.includes("gameState === 'stage3_intro'")) {
    content = content.replace(
      /\{gameState === 'stage2_intro' && \(/,
      stage34UI + "\n                            {gameState === 'stage2_intro' && ("
    );
}

// 7. Update Game Over to account for Stage 4 winner
content = content.replace(
  /<p className="text-2xl text-brand-gold mb-8">بطل المرحلة الثانية<\/p>/g,
  '<p className="text-2xl text-brand-gold mb-8">الناجي الأخير والمنتصر باللعبة</p>'
);
content = content.replace(
  /<p className="text-4xl font-black text-white">\{\[\.\.\.players\]\.sort\(\(a,b\) => \(b\.score2 \|\| 0\) - \(a\.score2 \|\| 0\)\)\[0\]\?.username \|\| "لا أحد"\}<\/p>/g,
  '<p className="text-4xl font-black text-white">{players.find(p => !stage4Eliminated.includes(p.username))?.username || [...players].sort((a,b) => (b.score2 || 0) - (a.score2 || 0))[0]?.username || "لا أحد"}</p>'
);

fs.writeFileSync(targetPath, content);
console.log('Stage 3 and Stage 4 injected successfully.');
