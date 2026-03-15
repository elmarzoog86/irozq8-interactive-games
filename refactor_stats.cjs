const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

// 1. Types
content = content.replace(
  /score2: number;/g,
  `score2: number;
  s1C?: number; s1W?: number; s1P?: number;
  s2C?: number; s2W?: number; s2P?: number;
  s3C?: number; s3W?: number; s3P?: number;
  s4C?: number; s4W?: number; s4P?: number;
  s5C?: number; s5W?: number; s5P?: number;
  totalPoints?: number;`
);

// 2. States
content = content.replace(
  /\| 'stage4_result' \| 'game_over'>/,
  `| 'stage4_result' | 'stage1_leaderboard' | 'stage2_leaderboard' | 'stage3_leaderboard' | 'stage4_leaderboard' | 'stage5_intro' | 'stage5_playing' | 'stage5_result' | 'game_over'>`
);

// Stage 5 State
if (!content.includes('const [stage5QuestionCount')) {
  content = content.replace(
    /const \[stage2Winner, setStage2Winner\] = useState<string \| null>\(null\);/,
    `const [stage2Winner, setStage2Winner] = useState<string | null>(null);
  const [stage5QuestionCount, setStage5QuestionCount] = useState(0);
  const [stage5Q, setStage5Q] = useState<{q: string, options: string[], a: number} | null>(null);
  const [stage5Winner, setStage5Winner] = useState<string | null>(null);`
  );
}

// 3. Stage 1 Tracking
content = content.replace(
  /if \(status === 'correct' && currentQuestion\) \{\n\s*setPlayers\(prev => \{\n\s*const newPlayers = \[\.\.\.prev\];\n\s*const p = newPlayers\[currentPlayerIndex\];/,
  `if (status === 'correct' && currentQuestion) {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const p = newPlayers[currentPlayerIndex];
        p.s1C = (p.s1C || 0) + 1;`
);

content = content.replace(
  /p\.tokens\.push\(currentQuestion\.categoryId\);\n\s*\}\n\s*return newPlayers;\n\s*\}\);\n\s*\}/,
  `p.tokens.push(currentQuestion.categoryId);
        }
        return newPlayers;
      });
    } else if (status === 'wrong' || status === 'timeout') {
      setPlayers(prev => {
        const newPlayers = [...prev];
        if (newPlayers[currentPlayerIndex]) {
           newPlayers[currentPlayerIndex].s1W = (newPlayers[currentPlayerIndex].s1W || 0) + 1;
        }
        return newPlayers;
      });
    }`
);

// Stage 1 Transition (Winner + Leaderboard)
content = content.replace(
  /if \(p\.tokens\.length >= 4\) \{\n\s*\/\/ Give them a starting point for winning stage 1\n\s*p\.score2 = \(p\.score2 \|\| 0\) \+ 1;\n\s*setGameState\('stage2_intro'\);\n\s*setTimeout\(\(\) => \{\n\s*setStage2QuestionCount\(0\);\n\s*startStage2Question\(\);\n\s*\}, 5000\);\n\s*return prev;\n\s*\}/g,
  `if (p.tokens.length >= 4) {
        // Winner gets 1 point
        p.s1P = (p.s1P || 0) + 1;
        p.totalPoints = (p.totalPoints || 0) + 1;
        setGameState('stage1_leaderboard');
        setTimeout(() => {
          setGameState('stage2_intro');
          setTimeout(() => {
            setStage2QuestionCount(0);
            startStage2Question();
          }, 5000);
        }, 10000);
        return prev;
      }`
);

// Fallback for transition
content = content.replace(
  /if \(p\.tokens\.length >= 4\) \{\n\s*setGameState\('game_over'\);\n\s*return prev;\n\s*\}/g,
  `if (p.tokens.length >= 4) {
        p.s1P = (p.s1P || 0) + 1;
        p.totalPoints = (p.totalPoints || 0) + 1;
        setGameState('stage1_leaderboard');
        setTimeout(() => {
          setGameState('stage2_intro');
          setTimeout(() => {
            setStage2QuestionCount(0);
            startStage2Question();
          }, 5000);
        }, 10000);
        return prev;
      }`
);

// 4. Stage 2 Tracking & Transition
content = content.replace(
  /setPlayers\(prev => prev\.map\(p => p\.username === username \? \{ \.\.\.p, score2: \(p\.score2 \|\| 0\) \+ 1 \} : p\)\);/,
  `setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1, s2C: (p.s2C || 0) + 1, s2P: (p.s2P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));`
);

content = content.replace(
  /setGameState\('stage3_intro'\);\n\s*setTimeout\(\(\) => \{\n\s*startStage3Turn\(0\);\n\s*\}, 5000\);\n\s*\}/,
  `                 setGameState('stage2_leaderboard');
                  setTimeout(() => {
                    setGameState('stage3_intro');
                    setTimeout(() => startStage3Turn(0), 5000);
                  }, 10000);
                }`
);

// 5. Stage 3 Tracking
content = content.replace(
  /setStage3Eliminated\(prev => \[\.\.\.prev, username\]\);/,
  `setStage3Eliminated(prev => [...prev, username]);
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, s3W: (p.s3W || 0) + 1 } : p));`
);
content = content.replace(
  /\} else \{\n\s*\/\/ point reward could be added\n\s*\}/,
  `} else {
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, s3C: (p.s3C || 0) + 1, s3P: (p.s3P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
              }`
);

content = content.replace(
  /setGameState\('stage4_intro'\);\n\s*setTimeout\(\(\) => \{\n\s*startStage4\(0\);\n\s*\}, 5000\);\n\s*return;\n\s*\}/,
  `      setGameState('stage3_leaderboard');
      setTimeout(() => {
        setGameState('stage4_intro');
        setTimeout(() => startStage4(0), 5000);
      }, 10000);
      return;
    }`
);

// 6. Stage 4 Tracking & Transition
content = content.replace(
  /setStage4Eliminated\(prev => \[\.\.\.prev, players\[pIndex\]\.username\]\);\n\s*\}/,
  `setStage4Eliminated(prev => [...prev, players[pIndex].username]);
      setPlayers(prev => prev.map(p => p.username === players[pIndex].username ? { ...p, s4W: (p.s4W || 0) + 1 } : p));
    } else {
      setPlayers(prev => prev.map(p => p.username === players[pIndex].username ? { ...p, s4C: (p.s4C || 0) + 1, s4P: (p.s4P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
    }`
);

const stage5Logic = `
  const checkTieBreaker = (currentPlayers: Player[]) => {
      const maxScore = Math.max(...currentPlayers.map(p => p.totalPoints || 0));
      const leaders = currentPlayers.filter(p => (p.totalPoints || 0) === maxScore);
      
      if (leaders.length > 1) {
         setGameState('stage5_intro');
         setTimeout(() => {
            setStage5QuestionCount(0);
            startStage5Question();
         }, 5000);
      } else {
         setGameState('game_over');
      }
  };

  const startStage5Question = () => {
    setGameState('stage5_playing');
    setStage5Winner(null);
    setTimeLeft(15);
    const cats = ['history', 'science', 'sports', 'entertainment'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const qList = QUESTIONS[randomCat];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage5Q(rq);
  };
`;
if (!content.includes('checkTieBreaker')) {
    content = content.replace(
      /const startGame = \(\) => \{/,
      stage5Logic + "\n  const startGame = () => {"
    );
}

content = content.replace(
  /if \(stillIn\.length <= 1\) \{\n\s*setGameState\('game_over'\);\n\s*return latestEliminated;\n\s*\}/,
  `if (stillIn.length <= 1) {
               if (stillIn.length === 1) {
                  latestPlayers = latestPlayers.map(p => p.username === stillIn[0].username ? { ...p, s4P: (p.s4P || 0) + 5, totalPoints: (p.totalPoints || 0) + 5 } : p);
               }
               setGameState('stage4_leaderboard');
               setTimeout(() => {
                   checkTieBreaker(latestPlayers);
               }, 10000);
               return latestEliminated;
            }`
);

// 7. Stage 5 Chat Logic & Timers
const stage5Chat = `
        // Stage 5 Answering
        if (gameState === 'stage5_playing' && stage5Q) {
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 4) {
             if (num === stage5Q.a && !stage5Winner) {
              setStage5Winner(username);
              setPlayers(prev => prev.map(p => p.username === username ? { ...p, s5C: (p.s5C || 0) + 1, s5P: (p.s5P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
              setGameState('stage5_result');
              if (timerRef.current) clearInterval(timerRef.current);
              
              setTimeout(() => {
                if (stage5QuestionCount + 1 >= 15) {
                  setGameState('game_over');
                } else {
                  setStage5QuestionCount(prev => prev + 1);
                  startStage5Question();
                }
              }, 4000);
            }
          }
        }
`;
if (!content.includes('gameState === \\\'stage5_playing\\\'')) {
   content = content.replace(/(\/\/ Stage 4 Answering)/, stage5Chat + "\n        $1");
}

content = content.replace(
  /if \(gameState === 'turn_start' \|\| gameState === 'answering' \|\| gameState === 'stage2_playing' \|\| gameState === 'stage3_category_pick' \|\| gameState === 'stage3_playing' \|\| gameState === 'stage4_playing'\) \{/,
  `if (gameState === 'turn_start' || gameState === 'answering' || gameState === 'stage2_playing' || gameState === 'stage3_category_pick' || gameState === 'stage3_playing' || gameState === 'stage4_playing' || gameState === 'stage5_playing') {`
);

content = content.replace(
  /\} else if \(gameState === 'stage4_playing'\) \{\n\s*endStage4Turn\('timeout', stage4ActivePlayerIndex\);\n\s*\}/,
  `} else if (gameState === 'stage4_playing') {
                  endStage4Turn('timeout', stage4ActivePlayerIndex);
              } else if (gameState === 'stage5_playing') {
                  setGameState('stage5_result');
                  setTimeout(() => {
                     if (stage5QuestionCount + 1 >= 15) {
                        setGameState('game_over');
                     } else {
                        setStage5QuestionCount(prev => prev + 1);
                        startStage5Question();
                     }
                  }, 4000);
              }`
);

// 8. Renderer injection for leaderboards and stage 5
const renderLogic = `
  const renderLeaderboard = (stageNum: number, title: string) => {
   const sorted = [...players].sort((a,b) => (b.totalPoints || 0) - (a.totalPoints || 0));
   return (
       <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-1 p-8 bg-[#0a0a0a] z-50 flex flex-col items-center">
         <Trophy className="w-16 h-16 text-brand-gold mb-4" />
         <h2 className="text-4xl font-black text-white mb-8">{title}</h2>
         <div className="w-full max-w-3xl flex flex-col gap-3">
            <div className="flex text-zinc-400 font-bold px-4 mb-2">
               <div className="flex-1">اللاعب</div>
               <div className="w-24 text-center text-green-400">صح (الجولة)</div>
               <div className="w-24 text-center text-red-400">خطأ (الجولة)</div>
               <div className="w-24 text-center text-brand-gold">نقاط الجولة</div>
               <div className="w-32 text-center text-white text-xl">المجموع</div>
            </div>
            {sorted.map((p, i) => {
               const stgC = p[\`s\${stageNum}C\` as keyof Player] || 0;
               const stgW = p[\`s\${stageNum}W\` as keyof Player] || 0;
               const stgP = p[\`s\${stageNum}P\` as keyof Player] || 0;
               return (
                 <div key={p.username} className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex-1 font-bold text-white text-xl flex items-center gap-3">
                       <span className="text-brand-gold w-6">{i+1}.</span> {p.username}
                    </div>
                    <div className="w-24 text-center text-green-400 font-bold">{stgC}</div>
                    <div className="w-24 text-center text-red-400 font-bold">{stgW}</div>
                    <div className="w-24 text-center text-brand-gold font-bold">+{stgP}</div>
                    <div className="w-32 text-center text-white font-black text-2xl bg-white/10 rounded-xl py-1">{p.totalPoints || 0}</div>
                 </div>
               )
            })}
         </div>
       </motion.div>
   );
  };
`;
if (!content.includes('renderLeaderboard')) {
    content = content.replace(/return \(\n\s*<div className="flex h-screen/, renderLogic + "\n  return (\n    <div className=\"flex h-screen");
}

const UI_BLOCK = `
        {gameState === 'stage1_leaderboard' && renderLeaderboard(1, "لوحة الشرف - الجولة الأولى")}
        {gameState === 'stage2_leaderboard' && renderLeaderboard(2, "لوحة الشرف - الجولة الثانية")}
        {gameState === 'stage3_leaderboard' && renderLeaderboard(3, "لوحة الشرف - الجولة الثالثة")}
        {gameState === 'stage4_leaderboard' && renderLeaderboard(4, "لوحة الشرف - الجولة الرابعة")}
        
        {gameState === 'stage5_intro' && (
          <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} className="flex flex-col items-center gap-6">
            <Swords className="w-32 h-32 text-brand-gold" />
            <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">الجولة الخامسة - كسر التعادل</div>
            <div className="text-3xl font-bold text-red-500">سؤال سرعة جديد - الأسرع يربح نقاط!</div>
            <div className="text-2xl text-teal-400 mt-4">(15 سؤال)</div>
          </motion.div>
        )}
        
        {gameState === 'stage5_playing' && stage5Q && (
          <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="flex flex-col items-center">
            <div className="text-xl font-bold text-brand-gold animate-pulse mb-4">اكتب رقم الإجابة في الشات!</div>
            <div className="mb-8 p-8 bg-zinc-800/80 border-2 border-brand-gold/50 rounded-3xl shadow-2xl w-full max-w-4xl text-center">
              <div className="text-4xl text-white font-black mb-8 leading-tight">{stage5Q.q}</div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {stage5Q.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-4 bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-full border border-teal-500 bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl font-black">
                      {i + 1}
                    </div>
                    <div className="flex-1 text-right text-gray-200 text-xl font-bold">{opt}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full flex justify-center">
               <div className="text-8xl font-black text-brand-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.8)] tabular-nums">{timeLeft}</div>
            </div>
          </motion.div>
        )}

        {gameState === 'stage5_result' && stage5Q && (
           <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity:1, scale:1}} className="flex flex-col items-center">
            <div className="text-4xl text-teal-400 font-black mb-4">الجواب الصحيح: {stage5Q.options[stage5Q.a - 1]}</div>
            {stage5Winner ? (
              <div className="text-5xl text-brand-gold font-black mt-8">الفائز: {stage5Winner} 🎉</div>
            ) : (
              <div className="text-5xl text-red-500 font-black mt-8">انتهى الوقت! لا يوجد فائز :(</div>
            )}
          </motion.div>
        )}
`;

content = content.replace(/\{gameState === 'game_over' && \(/, UI_BLOCK + "\n        {gameState === 'game_over' && (");

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
console.log('Done replacing via AST.');
