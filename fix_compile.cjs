const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

// 1. Add missing Stage 3 states
if (!content.includes('const [stage3QuestionCount')) {
  // Inject right after stage3CurrentCategory
  content = content.replace(
    /const \[stage3CurrentCategory, setStage3CurrentCategory\] = useState<string \| null>\(null\);/,
    `const [stage3CurrentCategory, setStage3CurrentCategory] = useState<string | null>(null);
  const [stage3QuestionCount, setStage3QuestionCount] = useState(0);`
  );
}

// 2. Add missing startStage2Question function
const startStage2Func = `
  const startStage2Question = () => {
    setGameState('stage2_playing');
    setStage2Winner(null);
    setTimeLeft(15);
    const cats = ['history', 'science', 'sports', 'entertainment'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const qList = QUESTIONS[randomCat];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage2Q(rq);
  };
`;

if (!content.includes('const startStage2Question = () => {')) {
  content = content.replace(
    /const checkTieBreaker =/,
    startStage2Func + "\n  const checkTieBreaker ="
  );
}

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
console.log('Compile issues fixed via AST.');
