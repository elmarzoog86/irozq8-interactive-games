const fs = require('fs');
let code = fs.readFileSync('src/components/RussianRouletteChatGame.tsx', 'utf8');

code = code.replace("const [message, setMessage] = useState('');", "const [message, setMessage] = useState('');\\n  const [hasPulledTrigger, setHasPulledTrigger] = useState(false);");

code = code.replace("setTimeLeft(20);\\n    spinCylinder();", "setTimeLeft(20);\\n    setHasPulledTrigger(false);\\n    spinCylinder();");
code = code.replace("setMessage('ЩЩШШ ЩШШШєШ! ШЩѓШЄШЁ !pass @ШШЩ ЩШЄЩШЩЉШ ШЩЩШШШ!');", "setMessage('ЩЩШШ ЩШШШєШ! ШЩѓШЄШ !pass @ШШЩ ЩШЄЩШЩЉШ ШЩЩШШШ!');\\n     setHasPulledTrigger(true);");

const effectToInsert = "  useEffect(() => {\\n    if (mode === 'playing' && !hasPulledTrigger && players.length > 0) {\\n      const timer = setTimeout(() => {\\n        const currentPlayer = players[activePlayerIndex];\\n        if (bullets.includes(currentChamber)) {\\n            eliminatePlayer(currentPlayer, 'ШЄЩЩЩ ШШµШШµШ!');\\n        } else {\\n            setCurrentChamber(c => c + 1);\\n            surviveTurn();\\n        }\\n      }, 3000);\\n      return () => clearTimeout(timer);\\n    }\\n  }, [mode, activePlayerIndex, hasPulledTrigger, players, bullets, currentChamber, eliminatePlayer, surviveTurn]);\\n";
code = code.replace("  useEffect(() => {\\n    if (mode === 'playing') {\\n      timerRef.current = window.setInterval(() => {", effectToInsert + "\\n  useEffect(() => {\\n    if (mode === 'playing') {\\n      timerRef.current = window.setInterval(() => {");

code = code.replace("eliminatePlayer(cp, 'ШЄШШШ ЩЩЉ ШЩШШЩШЩ!');", "eliminatePlayer(cp, hasPulledTrigger ? 'ШЄШШШ ЩЩЉ ШЩШЄЩШЩЉШ!' : 'ШЄШШШ ЩЩЉ ШЩШШЩШЩ!');");

const p1 = code.indexOf("if (mode === 'playing') {");
let open = 0, p2 = -1, found = false;
for (let i = p1; i < code.length; i++) {
  if (code[i] === '{') { open++; found = true; }
  if (code[i] === '}') {
    open--;
    if (found && open === 0) { p2 = i; break; }
  }
}
const repl = "if (mode === 'playing') {\\n         if (players[activePlayerIndex] === uname) {\\n            if (text.startsWith('!pass ')) {\\n               if (hasPulledTrigger) {\\n                  const target = text.replace('!pass ', '').replace('@', '').trim();\\n                  if (target && target !== uname && players.includes(target)) {\\n                     const targetIdx = players.indexOf(target);\\n                     setActivePlayerIndex(targetIdx);\\n                     setTimeLeft(20);\\n                     setHasPulledTrigger(false);\\n                     if (soundEnabled) playSound('lobby_click');\\n                     setMessage(ШЄЩ ШЄЩШЩЉШ ШЩЩШШШ ШЩЩ !);\\n                  }\\n               }\\n            }\\n         }\\n      }";
code = code.substring(0, p1) + repl + code.substring(p2 + 1);

code = code.replace(/<div className="bg-black\/80 border border-red-900\/50 p-4 rounded-2xl">\s*<div className="font-bold text-red-500 mb-1 text-lg">!pull<\/div>[\s\S]*?<\/div>/, "");
code = code.replace(/<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!spin<\/div>[\s\S]*?<\/div>/, "");
code = code.replace(/<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!skip<\/div>[\s\S]*?<\/div>/, "");
code = code.replace(/<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!bet @ШШЩ<\/div>[\s\S]*?<\/div>/, "");
code = code.replace(/<div className="w-full max-w-3xl mt-4 bg-zinc-900\/30 border border-zinc-800 rounded-3xl p-6 z-10 hidden lg:block">[\s\S]*?<\/div>\s*<\/div>/, "");
code = code.replace("const [bets, setBets] = useState<Record<string, string>>({});", "");

fs.writeFileSync('src/components/RussianRouletteChatGame.tsx', code);
console.log('Done');
