const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

const oldShowQ = `  const showQuestion = () => {
    setGameState('answering');

    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      const category = BOARD_TILES[currentPlayer.position];

      const categoryQuestions = QUESTIONS[category.id];
      const randomQ = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

      setCurrentQuestion({ ...randomQ, categoryId: category.id });
      setTimeLeft(45); 
      return prev;
    });
  };`;

const newShowQ = `  const showQuestion = () => {
    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      const category = BOARD_TILES[currentPlayer.position];

      // If player already has this category token, we disable/skip it for them
      if (currentPlayer.tokens.includes(category.id)) {
        setGameState('result');
        setResultInfo({ status: 'skipped' });
        setTimeout(() => {
          checkWinOrNextTurn();
        }, 3500);
        return prev;
      }

      setGameState('answering');
      const categoryQuestions = QUESTIONS[category.id];
      const randomQ = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

      setCurrentQuestion({ ...randomQ, categoryId: category.id });
      setTimeLeft(45); 
      return prev;
    });
  };`;

if (!content.includes("status: 'skipped' }")) {
   content = content.replace(oldShowQ, newShowQ);
   
   const targetUI = `{resultInfo.status === 'correct' ? (`
   const replacementUI = `{resultInfo.status === 'skipped' ? (
                                  <>
                                    <Sparkles className="w-32 h-32 text-zinc-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(161,161,170,0.5)]" />
                                    <h3 className="text-5xl font-bold text-white mb-4">لديك هذه الميدالية!</h3>
                                    <p className="text-2xl text-zinc-300">تم تخطي سؤال هذا التصنيف (انتقل الدور).</p>
                                  </>
                                ) : resultInfo.status === 'correct' ? (`

   content = content.replace(targetUI, replacementUI);
   fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
   console.log("Patched showQuestion");
} else {
   console.log("Already patched.");
}
