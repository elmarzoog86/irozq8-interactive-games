const fs = require('fs');

let code = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\s*if \(gameState === 'turn_start' \|\| gameState === 'answering'\) \{\s*timerRef\.current = setInterval[^]*?\}, \[gameState\]\);/;

console.log(regex.test(code));

const newUseEffect = `  useEffect(() => {
    const activeStates = [
      'turn_start', 
      'answering', 
      'stage2_playing', 
      'stage3_playing', 
      'stage4_playing', 
      'stage5_playing', 
      'stage3_category_pick'
    ];
    if (activeStates.includes(gameState)) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (gameState === 'turn_start') {
              handleRoll();
            } else if (gameState === 'answering') {
              handleAnswerResult('timeout');
            } else if (gameState === 'stage2_playing') {
               setGameState('stage2_result');
               setTimeout(() => {
                 setStage2QuestionCount(p => {
                    const next = p + 1;
                    if (next >= 10) {
                       setGameState('stage2_leaderboard');
                       setTimeout(() => {
                         setGameState('stage3_intro');
                         setTimeout(() => startStage3Turn(0), 5000);
                       }, 10000);
                    } else {
                       startStage2Question();
                    }
                    return next;
                 });
               }, 4000);
            } else if (gameState === 'stage3_category_pick') {
               setStage3CurrentCategory(stage3Categories[0]);
               setStage3QuestionCount(0);
               const qList = QUESTIONS[stage3Categories[0]];
               setStage3Q(qList[Math.floor(Math.random() * qList.length)]);
               setGameState('stage3_playing');
               setTimeLeft(15); 
            } else if (gameState === 'stage3_playing') {
               setStage3QuestionCount(p => {
                  const nextIdx = p + 1;
                  if (nextIdx >= 5) {
                    setGameState('stage3_result');
                    setTimeout(() => {
                       startStage3Turn(stage3ActivePlayerIndex + 1);
                    }, 3000);
                  } else {
                    const latestCat = stage3CurrentCategory || 'history';
                    const qList = QUESTIONS[latestCat];
                    setStage3Q(qList[Math.floor(Math.random() * qList.length)]);
                    setGameState('stage3_playing');
                    setTimeLeft(15);
                  }
                  return nextIdx;
               });
            } else if (gameState === 'stage4_playing') {
               endStage4Turn('timeout', stage4ActivePlayerIndex);
            } else if (gameState === 'stage5_playing') {
               setGameState('stage5_result');
               setTimeout(() => {
                 setStage5QuestionCount(p => {
                   const next = p + 1;
                   if (next >= 15) {
                     setGameState('game_over');
                   } else {
                     startStage5Question();
                   }
                   return next;
                 });
               }, 4000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, stage3Categories, stage3CurrentCategory, stage3ActivePlayerIndex, stage4ActivePlayerIndex]);`;

code = code.replace(regex, newUseEffect);

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', code, 'utf8');
console.log('Done!');
