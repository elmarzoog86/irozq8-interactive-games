const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'src/components/TrivialPursuitGame.tsx');
let content = fs.readFileSync(targetPath, 'utf-8');

// 1. Types & State
content = content.replace(
  /tokens: string\[\];/g,
  "tokens: string[];\n  score2: number;"
);

content = content.replace(
  /position: 0,/g,
  "position: 0,\n                score2: 0,"
);

// Account for previous failed edits or multiple additions
if (!content.includes("'stage2_intro'")) {
    content = content.replace(
      /useState<'lobby' \| 'turn_start' \| 'rolling' \| 'answering' \| 'result' \| 'game_over'>\('lobby'\);/g,
      "useState<'lobby' | 'turn_start' | 'rolling' | 'answering' | 'result' | 'stage2_intro' | 'stage2_playing' | 'stage2_result' | 'game_over'>('lobby');\n  const [stage2QuestionCount, setStage2QuestionCount] = useState(0);\n  const [stage2Q, setStage2Q] = useState<{q: string, options: string[], a: number} | null>(null);\n  const [stage2Winner, setStage2Winner] = useState<string | null>(null);"
    );
}

// 2. Chat Logic (Answering Stage 2)
const answeringLogic = `
        // Stage 2 Answering
        if (gameState === 'stage2_playing' && stage2Q) {
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 4) {
             if (num === stage2Q.a && !stage2Winner) {
              setStage2Winner(username);
              setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1 } : p));
              setGameState('stage2_result');
              if (timerRef.current) clearInterval(timerRef.current);
              
              setTimeout(() => {
                if (stage2QuestionCount + 1 >= 10) {
                  setGameState('game_over');
                } else {
                  setStage2QuestionCount(prev => prev + 1);
                  startStage2Question();
                }
              }, 4000);
            }
          }
        }
`;

if (!content.includes("gameState === 'stage2_playing' && stage2Q")) {
    content = content.replace(
      /(\/\/ Answering[\s\S]*?if \(gameState === 'answering')/,
      answeringLogic + "\n        $1"
    );
}

// 3. Transition from Stage 1 to Stage 2
if (!content.includes("setGameState('stage2_intro')")) {
    content = content.replace(
      /if \(p\.tokens\.length >= 4\) \{\n\s*setGameState\('game_over'\);\n\s*return prev;\n\s*\}/g,
      `if (p.tokens.length >= 4) {
              setGameState('stage2_intro');
              setTimeout(() => {
                setStage2QuestionCount(0);
                startStage2Question();
              }, 5000);
              return prev;
            }`
    );
}


// 4. Start Stage 2 Question function
const startStage2Func = `
  const startStage2Question = () => {
    setGameState('stage2_playing');
    setStage2Winner(null);
    setTimeLeft(15);
    
    // Pick random question from any category
    const cats = ['history', 'science', 'sports', 'entertainment'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const qList = QUESTIONS[randomCat];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage2Q(rq);
  };
`;

if (!content.includes("startStage2Question()")) {
    content = content.replace(
      /const startGame = \(\) => \{/g,
      startStage2Func + "\n  const startGame = () => {"
    );
}

// 5. Timer logic update for stage2_playing
if (!content.includes("gameState === 'stage2_playing'")) {
    content = content.replace(
      /if \(gameState === 'turn_start' \|\| gameState === 'answering'\) \{/g,
      "if (gameState === 'turn_start' || gameState === 'answering' || gameState === 'stage2_playing') {"
    );

    content = content.replace(
      /\} else if \(gameState === 'answering'\) \{/g,
      "} else if (gameState === 'answering') {\n                handleAnswerResult('timeout');\n              } else if (gameState === 'stage2_playing') {\n                setGameState('stage2_result');\n                setTimeout(() => {\n                  if (stage2QuestionCount + 1 >= 10) {\n                    setGameState('game_over');\n                  } else {\n                    setStage2QuestionCount(prev => prev + 1);\n                    startStage2Question();\n                  }\n                }, 4000);"
    );
}

// 6. UI Rendering for Stage 2
const stage2UI = `
                            {gameState === 'stage2_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Rocket className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الثانية</h2>
                                <p className="text-2xl text-zinc-300">أسئلة السرعة! أسرع لاعب يجيب يكسب النقاط.</p>
                              </motion.div>
                            )}

                            {gameState === 'stage2_playing' && stage2Q && (
                              <motion.div key="s2_q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-8 bg-[#0a0a0a] z-50">
                                 <div className="flex justify-between items-center mb-6">
                                   <div className="bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-xl font-bold">سؤال سريع {stage2QuestionCount + 1}/10</div>
                                   <div className="text-3xl font-mono text-white flex items-center gap-2"><Timer className="w-8 h-8 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 </div>
                                 <h2 className="text-3xl font-bold text-white text-center mb-8 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">{stage2Q.q}</h2>
                                 <div className="grid grid-cols-2 gap-4">
                                   {stage2Q.options.map((opt, i) => (
                                     <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                       <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-brand-gold">{i + 1}</span>
                                       <span className="text-xl text-white font-bold">{opt}</span>
                                     </div>
                                   ))}
                                 </div>
                              </motion.div>
                            )}

                            {gameState === 'stage2_result' && stage2Q && (
                              <motion.div key="s2_res" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                {stage2Winner ? (
                                  <>
                                    <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-6" />
                                    <h2 className="text-4xl font-black text-white mb-2">أسرع إجابة: {stage2Winner}</h2>
                                    <p className="text-2xl text-emerald-400">+1 نقطة</p>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-24 h-24 text-rose-500 mb-6" />
                                    <h2 className="text-4xl font-black text-white mb-2">انتهى الوقت!</h2>
                                    <p className="text-2xl text-rose-400">لم يجب أحد</p>
                                  </>
                                )}
                              </motion.div>
                            )}
`;

if (!content.includes("gameState === 'stage2_intro'")) {
    content = content.replace(
      /\{gameState === 'result' && resultInfo && \(/,
      stage2UI + "\n                            {gameState === 'result' && resultInfo && ("
    );
}

// 7. Update Game Over to show Stage 2 winner
content = content.replace(
  /<p className="text-2xl text-brand-gold mb-8">الفائز جمع الـ 4 ميداليات<\/p>/g,
  '<p className="text-2xl text-brand-gold mb-8">بطل المرحلة الثانية</p>'
);
content = content.replace(
  /<p className="text-4xl font-black text-white">\{players\[currentPlayerIndex\]\?.username\}<\/p>/g,
  '<p className="text-4xl font-black text-white">{[...players].sort((a,b) => (b.score2 || 0) - (a.score2 || 0))[0]?.username || "لا أحد"}</p>'
);

// Print out score near player names in UI
const playerScoreUI = `
                      <div className="flex flex-col">
                        <p className="text-xl font-bold text-white max-w-[120px] truncate" title={p.username}>{p.username}</p>
                        {(p.score2 > 0 || gameState.startsWith('stage2')) && <span className="text-sm font-bold text-brand-gold">{p.score2} pts</span>}
                      </div>
`;
content = content.replace(
  /<p className="text-xl font-bold text-white max-w-\[120px\] truncate" title=\{p\.username\}>\{p\.username\}<\/p>/g,
  playerScoreUI
);


fs.writeFileSync(targetPath, content);
console.log('Stage 2 logic injected successfully.');