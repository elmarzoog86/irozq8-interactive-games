const fs = require('fs');
let file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const \[resultInfo, setResultInfo\] = useState<\{status: 'correct' \| 'wrong' \| 'timeout', selected\?: number\} \| null>\(null\);/,
  `const [resultInfo, setResultInfo] = useState<{status: 'correct' | 'wrong' | 'timeout' | 'skipped', selected?: number} | null>(null);`
);

content = content.replace(
  /const showQuestion = \(\) => \{\n\s*setGameState\('answering'\);\n\s*setPlayers\(prev => \{\n\s*const currentPlayer = prev\[currentPlayerIndex\];\n\s*const category = BOARD_TILES\[currentPlayer\.position\];\n\s*const categoryQuestions = QUESTIONS\[category.id\];\n\s*const randomQ = categoryQuestions\[Math\.floor\(Math\.random\(\) \* categoryQuestions\.length\)\];\n\s*setCurrentQuestion\(\{ \.\.\.randomQ, categoryId: category.id \}\);\n\s*setTimeLeft\(45\);\n\s*return prev;\n\s*\}\);\n\s*\};/,
  `const showQuestion = () => {
      setPlayers(prev => {
        const currentPlayer = prev[currentPlayerIndex];
        const category = BOARD_TILES[currentPlayer.position];

        if (currentPlayer.tokens.includes(category.id)) {
           setGameState('result');
           setResultInfo({ status: 'skipped' });
           setTimeout(() => {
             checkWinOrNextTurn();
           }, 3000);
           return prev;
        }

        setGameState('answering');
        const categoryQuestions = QUESTIONS[category.id];
        const randomQ = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];

        setCurrentQuestion({ ...randomQ, categoryId: category.id });
        setTimeLeft(45);
        return prev;
      });
    };`
);

fs.writeFileSync(file, content);
console.log('patched resultInfo and showQuestion');
