const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

const renderLogic = `
  const renderLeaderboard = (stageNum: number, title: string) => {
   const sorted = [...players].sort((a,b) => (b.totalPoints || 0) - (a.totalPoints || 0));
   return (
       <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-1 p-8 bg-[#0a0a0a] z-50 flex flex-col items-center w-full h-full absolute inset-0">
         <Trophy className="w-16 h-16 text-brand-gold mb-4 mt-12" />
         <h2 className="text-4xl font-black text-white mb-8">{title}</h2>
         <div className="w-full max-w-3xl flex flex-col gap-3">
            <div className="flex text-zinc-400 font-bold px-4 mb-2">
               <div className="flex-1 text-right">اللاعب</div>
               <div className="w-24 text-center text-green-400">صح</div>
               <div className="w-24 text-center text-red-400">خطأ</div>
               <div className="w-24 text-center text-brand-gold">نقاط الجولة</div>
               <div className="w-32 text-center text-white text-xl">المجموع</div>
            </div>
            {sorted.map((p, i) => {
               const stgC = p[\`s\${stageNum}C\` as keyof Player] || 0;
               const stgW = p[\`s\${stageNum}W\` as keyof Player] || 0;
               const stgP = p[\`s\${stageNum}P\` as keyof Player] || 0;
               return (
                 <div key={p.username} className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex-1 font-bold text-white text-xl flex items-center gap-3 justify-start">
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
    content = content.replace(/return \(\n\s*<div className="flex-1 flex flex-col/, renderLogic + "\n  return (\n      <div className=\"flex-1 flex flex-col");
}

const UI_BLOCK = `
        {gameState === 'stage1_leaderboard' && renderLeaderboard(1, "لوحة الشرف - الجولة الأولى")}
        {gameState === 'stage2_leaderboard' && renderLeaderboard(2, "لوحة الشرف - الجولة الثانية")}
        {gameState === 'stage3_leaderboard' && renderLeaderboard(3, "لوحة الشرف - الجولة الثالثة")}
        {gameState === 'stage4_leaderboard' && renderLeaderboard(4, "لوحة الشرف - الجولة الرابعة")}
`;

if (!content.includes("gameState === 'stage1_leaderboard'")) {
    content = content.replace(/\{gameState === 'game_over' && \(/, UI_BLOCK + "\n        {gameState === 'game_over' && (");
}

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
console.log('Done injecting leaderboard UI.');
