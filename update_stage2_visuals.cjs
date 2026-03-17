const fs = require('fs');

const file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add stage2Guesses state if doesn't exist
if (!content.includes('const [stage2Guesses')) {
  content = content.replace(
    `const [stage2Winner, setStage2Winner] = useState<string | null>(null);`,
    `const [stage2Winner, setStage2Winner] = useState<string | null>(null);\n    const [stage2Guesses, setStage2Guesses] = useState<{username: string, answer: number}[]>([]);`
  );
}

// 2. Fix \`startStage2Question\` to reset guesses
if (!content.includes('setStage2Guesses([])')) {
  content = content.replace(
    `setStage2Winner(null);`,
    `setStage2Winner(null);\n      setStage2Guesses([]);`
  );
}

// Replacing all the stage2_playing UI visual
let stage2PlayingUI = `                            {gameState === 'stage2_playing' && stage2Q && (
                                <motion.div key="s2_q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-row p-8 bg-[#0a0a0a] z-50">
                                   
                                   {/* Main Question Area */}
                                   <div className="flex-1 flex flex-col pr-8">
                                     <div className="flex justify-between items-center mb-6">
                                       <div className="bg-brand-pink/20 text-brand-cyan px-4 py-2 rounded-xl font-bold">سؤال سريع {stage2QuestionCount + 1}/10</div>
                                       <div className="text-4xl font-mono text-white flex items-center gap-2"><Timer className="w-10 h-10 text-brand-red animate-pulse" /> {timeLeft}</div>
                                     </div>
                                     <h2 className="text-4xl font-bold text-white text-center mb-10 leading-relaxed bg-white/5 p-8 rounded-3xl border border-white/10">{stage2Q.q}</h2>
                                     
                                     <div className="grid grid-cols-2 gap-6 relative">
                                       {stage2Q.options.map((opt, i) => (
                                         <div key={i} className="bg-[#1a1a1a] border-2 border-brand-indigo/30 rounded-2xl p-6 flex flex-col items-start gap-4 relative overflow-hidden h-40">
                                           <div className="flex items-center gap-4 w-full">
                                             <span className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-black text-brand-pink shrink-0">{i + 1}</span>
                                             <span className="text-2xl text-white font-bold">{opt}</span>
                                           </div>
                                           {/* Show who guessed this option */}
                                           <div className="flex flex-wrap gap-2 mt-auto">
                                              {stage2Guesses.filter(g => g.answer === i + 1).map((g, idx) => {
                                                 const p = players.find(x => x.username === g.username);
                                                 return (
                                                    <div key={idx} className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
                                                       <img src={p?.avatar || \`https://ui-avatars.com/api/?name=\${g.username}&background=random\`} alt="" className="w-6 h-6 rounded-full" />
                                                       <span className="text-white text-sm font-bold">{g.username}</span>
                                                    </div>
                                                 );
                                              })}
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   </div>

                                   {/* Stage 2 Leaderboard Sidebar */}
                                   <div className="w-80 bg-black/40 border-r border-white/10 rounded-2xl p-6 flex flex-col shrink-0">
                                     <div className="flex items-center gap-3 mb-6">
                                        <Trophy className="w-6 h-6 text-brand-cyan" />
                                        <h3 className="text-xl font-bold text-white">ترتيب اللاعبين</h3>
                                     </div>
                                     <div className="flex-1 overflow-y-auto space-y-4">
                                        {[...players].sort((a,b) => (b.score2 || 0) - (a.score2 || 0)).map((p, i) => (
                                           <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                              <div className="flex items-center gap-3">
                                                 <img src={p.avatar || \`https://ui-avatars.com/api/?name=\${p.username}&background=random\`} alt="" className="w-10 h-10 rounded-full" />
                                                 <div className="flex flex-col">
                                                   <span className="text-white font-bold truncate max-w-[100px]">{p.username}</span>
                                                 </div>
                                              </div>
                                              <div className="font-black text-2xl text-brand-pink tabular-nums">
                                                 {p.score2 || 0}
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                   </div>
                                </motion.div>
                              )}`;
                              
// Find existing stage2_playing block
const stage2PlayingRegex = /\{gameState === 'stage2_playing' && stage2Q && \([\s\S]*?<\/motion\.div>\s*\)\}/;
content = content.replace(stage2PlayingRegex, stage2PlayingUI);


fs.writeFileSync(file, content);
console.log('patched');