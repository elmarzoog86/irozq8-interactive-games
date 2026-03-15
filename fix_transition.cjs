const fs = require('fs');
let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf-8');

content = content.replace(
  /if \(p\.tokens\.length >= 4\) \{\n\s*setGameState\('game_over'\);\n\s*return prev;\n\s*\}/g,
  `if (p.tokens.length >= 4) {
          // Give them a starting point for winning stage 1
          p.score2 = (p.score2 || 0) + 1;
          setGameState('stage2_intro');
          setTimeout(() => {
            setStage2QuestionCount(0);
            startStage2Question();
          }, 5000);
          return prev;
        }`
);

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
console.log('Fixed stage 1 -> stage 2 transition');
