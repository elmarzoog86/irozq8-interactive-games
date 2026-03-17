const fs = require('fs');

const file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /setStage2QuestionCount\(p => \{[\s\n]*const next = p \+ 1;[\s\n]*if \(next >= 10\) \{[\s\n]*setGameState\('stage2_leaderboard'\);[\s\n]*setTimeout\(\(\) => \{[\s\n]*setGameState\('stage3_intro'\);[\s\n]*setTimeout\(\(\) => startStage3Turn\(0\), 5000\);[\s\n]*\}, 10000\);[\s\n]*\} else \{[\s\n]*startStage2Question\(\);[\s\n]*\}[\s\n]*return next;[\s\n]*\}\);/g;

content = content.replace(regex, `setStage2QuestionCount(p => p + 1);
                   const currentCount = stage2QuestionCount;
                   if (currentCount + 1 >= 10) {
                      setGameState('stage2_leaderboard');
                      setTimeout(() => {
                         setGameState('stage3_intro');
                         setTimeout(() => startStage3Turn(0), 5000);
                      }, 10000);
                   } else {
                      startStage2Question();
                   }`);

fs.writeFileSync(file, content);
console.log('patched stage2 timeout');