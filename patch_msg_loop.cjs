const fs = require('fs');

const file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// The main loop that reads messages
const oldMsgHandler = `        // Stage 2 Answering
        if (gameState === 'stage2_playing' && stage2Q) {
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 4) {
               if (num === stage2Q.a && !stage2Winner) {
                setStage2Winner(username);
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1, s2C: (p.s2C || 0) + 1, s2P: (p.s2P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
                setGameState('stage2_result');
                if (timerRef.current) clearInterval(timerRef.current);

                setTimeout(() => {
                  if (stage2QuestionCount + 1 >= 10) {
                                     setGameState('stage2_leaderboard');
                    setTimeout(() => {
                      setGameState('stage3_intro');
                      setTimeout(() => startStage3Turn(0), 5000);
                    }, 10000);
                  } else {
                    setStage2QuestionCount(prev => prev + 1);
                    startStage2Question();
                  }
                }, 4000);
              }
            }
          }`;

// Check if we already have a stage2Guesses state setter here? We don't.
const newMsgHandler = `        // Stage 2 Answering
        if (gameState === 'stage2_playing' && stage2Q) {
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 4) {
               setStage2Guesses(prev => {
                  if (prev.some(g => g.username === username)) return prev;
                  const updated = [...prev, {username, answer: num}];
                  
                  // Instead of checking winner outside, we just update the guesses. 
                  // If we use stale closure here, \`stage2Winner\` might block us incorrectly.
                  return updated;
               });

               // Wait, \`stage2Winner\` is from closure, so it won't be updated immediately.
               if (num === stage2Q.a && !stage2Winner) {
                setStage2Winner(username);
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1, s2C: (p.s2C || 0) + 1, s2P: (p.s2P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
                setGameState('stage2_result');
                if (timerRef.current) clearInterval(timerRef.current);

                setTimeout(() => {
                  if (stage2QuestionCount + 1 >= 10) {
                                     setGameState('stage2_leaderboard');
                    setTimeout(() => {
                      setGameState('stage3_intro');
                      setTimeout(() => startStage3Turn(0), 5000);
                    }, 10000);
                  } else {
                    setStage2QuestionCount(prev => prev + 1);
                    startStage2Question();
                  }
                }, 4000);
              }
            }
          }`;

content = content.replace(oldMsgHandler, newMsgHandler);

fs.writeFileSync(file, content);
console.log('patched msg loop for stage 2');