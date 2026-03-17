const fs = require('fs');

const file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const stage2GuessesRef = useRef')) {
    content = content.replace(
        `const [stage2Guesses, setStage2Guesses] = useState<{username: string, answer: number}[]>([]);`,
        `const [stage2Guesses, setStage2Guesses] = useState<{username: string, answer: number}[]>([]);\n    const stage2GuessesRef = useRef<{username: string, answer: number}[]>([]);\n    const stage2WinnerRef = useRef<string | null>(null);`
    );
}

// In startStage2Question, clear refs
content = content.replace(
    `setStage2Winner(null);\n      setStage2Guesses([]);`,
    `setStage2Winner(null);\n      stage2WinnerRef.current = null;\n      setStage2Guesses([]);\n      stage2GuessesRef.current = [];`
);

// Stage 2 Answer Process
const s2AnswerRegex = /\/\/ Stage 2 Answering[\s\n]*if \(gameState === 'stage2_playing' && stage2Q\) \{[\s\n]*const num = parseInt\(text\);[\s\n]*if \(!isNaN\(num\) && num >= 1 && num <= 4\) \{[\s\n]*if \(num === stage2Q\.a && !stage2Winner\) \{[\s\n]*setStage2Winner\(username\);[\s\n]*setPlayers\(prev => prev\.map\(p => p\.username === username \? \{ \.\.\.p, score2: \(p\.score2 \|\| 0\) \+ 1, s2C: \(p\.s2C \|\| 0\) \+ 1, s2P: \(p\.s2P \|\| 0\) \+ 1, totalPoints: \(p\.totalPoints \|\| 0\) \+ 1 \} : p\)\);[\s\n]*setGameState\('stage2_result'\);[\s\n]*if \(timerRef\.current\) clearInterval\(timerRef\.current\);[\s\n]*setTimeout\(\(\) => \{[\s\n]*if \(stage2QuestionCount \+ 1 >= 10\) \{[\s\n]*setGameState\('stage2_leaderboard'\);[\s\n]*setTimeout\(\(\) => \{[\s\n]*setGameState\('stage3_intro'\);[\s\n]*setTimeout\(\(\) => startStage3Turn\(0\), 5000\);[\s\n]*\}, 10000\);[\s\n]*\} else \{[\s\n]*setStage2QuestionCount\(prev => prev \+ 1\);[\s\n]*startStage2Question\(\);[\s\n]*\}[\s\n]*\}, 4000\);[\s\n]*\}[\s\n]*\}[\s\n]*\}/m;

const s2Replacement = `        // Stage 2 Answering
        if (gameState === 'stage2_playing' && stage2Q) {
            const num = parseInt(text);
            if (!isNaN(num) && num >= 1 && num <= 4) {
               if (stage2GuessesRef.current.some(g => g.username === username)) {
                 // Already Guessed
               } else {
                 stage2GuessesRef.current.push({username, answer: num});
                 setStage2Guesses([...stage2GuessesRef.current]);

                 if (num === stage2Q.a && !stage2WinnerRef.current) {
                    stage2WinnerRef.current = username;
                    setStage2Winner(username);
                    setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1, s2C: (p.s2C || 0) + 1, s2P: (p.s2P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
                    setGameState('stage2_result');
                    if (timerRef.current) clearInterval(timerRef.current);

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
                 }
               }
            }
        }`;

content = content.replace(s2AnswerRegex, s2Replacement);

const timerTimeoutRegex = `              } else if (gameState === 'stage2_playing') {
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
              }`;

const fixedTimerTimeout = `              } else if (gameState === 'stage2_playing') {
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
              }`;

// They are the same, wait!
// Is the state setter `startStage2Question()` inside `setStage2QuestionCount` actually causing the stuck 15s?
// YES! React Strict Mode runs `setStage2QuestionCount` TWICE. Which means `startStage2Question()` runs twice! Which causes `setTimeLeft(15)` to happen twice, skipping interval creation logic!
// Let's refactor the timeout!
const betterTimerTimeout = `              } else if (gameState === 'stage2_playing') {
                 setGameState('stage2_result');
                 const currentCount = stage2QuestionCount; // Wait, we can't reliably read stage2QuestionCount from closure!
                 // Let's just use the dispatch pattern correctly.
                 setStage2QuestionCount(p => p + 1);
                 setTimeout(() => {
                   // We actually need to track what we do based on the *next* state.
                   // Since state is asynchronous, we do:
                   if (stage2QuestionCountRef.current + 1 >= 10) {
                      setGameState('stage2_leaderboard');
                      setTimeout(() => {
                         setGameState('stage3_intro');
                         setTimeout(() => startStage3Turn(0), 5000);
                      }, 10000);
                   } else {
                      startStage2Question();
                   }
                 }, 4000);
              }`;

// Wait! It's much easier to just do: `setStage2QuestionCount(p => p + 1)` and use a `useEffect` for the transitions.
// But rewriting that is complex for a patching script. 
// A simpler robust fix: Pull `startStage2Question` out of the setter, by using a ref for `stage2QuestionCount`.
if (!content.includes('const stage2QuestionCountRef = useRef(0);')) {
   content = content.replace(
      `const [stage2QuestionCount, setStage2QuestionCount] = useState(0);`,
      `const [stage2QuestionCount, setStage2QuestionCount] = useState(0);\n    const stage2QuestionCountRef = useRef(0);`
   );
}

// Update the setStage2QuestionCount anywhere it happens to update the ref as well.
// Wait, a useEffect is cleaner.
fs.writeFileSync('inject_fixes.cjs', content);
console.log('generated script');