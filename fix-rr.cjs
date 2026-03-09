const fs = require('fs');
let code = fs.readFileSync('src/components/RussianRouletteChatGame.tsx', 'utf8');

code = code.replace(/setDeadPlayers\(\[\]\);/g, 'setDeadPlayers([]);\n    setHasPulledTrigger(false);');

code = code.replace(/setCurrentChamber\(0\);\n\s*if \(soundEnabled\) playSound\('spin'\);\n\s*setMessage\([^]*?;\n\s*}/g, match => {
  return match + '\n        setHasPulledTrigger(false);'
});

const effectToInsert = `
  useEffect(() => {
    if (mode === 'playing' && !hasPulledTrigger && players.length > 0) {
      const timer = setTimeout(() => {
        const currentPlayer = players[activePlayerIndex];
        if (bullets.includes(currentChamber)) {
            eliminatePlayer(currentPlayer, 'تلقى رصاصة!');
        } else {
            setCurrentChamber(c => c + 1);
            surviveTurn();
            setHasPulledTrigger(true);
            setTimeLeft(20);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mode, activePlayerIndex, hasPulledTrigger, players, bullets, currentChamber, eliminatePlayer, surviveTurn]);\n\n`;

code = code.replace('useEffect(() => {\n    if (mode === \'playing\') {', effectToInsert + '  useEffect(() => {\n    if (mode === \'playing\') {');

const passLogic = `
             if (text.startsWith('!pass ')) {
                 if (currentChamber > 0 && !bullets.includes(currentChamber - 1)) {
                    // can only pass if you already pulled and survived this round
                    const target = text.replace('!pass ', '').replace('@', '').trim();
                    if (target && target !== uname && players.includes(target)) {
                       const targetIdx = players.indexOf(target);
                       setActivePlayerIndex(targetIdx);
                       setHasPulledTrigger(false);
                       setTimeLeft(20);
                       if (soundEnabled) playSound('lobby_click');
                       setMessage(\`تم تمرير المسدس إلى \${target}! الانتظار لسحب الزناد...\`);
                    }
                 }
             }`;

code = code.replace(/if \(text === '!pull'\) \{[\s\S]*?\} else if \(text\.startsWith\('!pass '\)\) \{[\s\S]*?\n\s*\}\n\s*\}/g, passLogic);

code = code.replace(/if \(text\.startsWith\('!bet '\) && !players\.includes\(uname\) && !deadPlayers\.includes\(uname\)\) \{[\s\S]*?\n\s*\}/g, '');

const uiRegexes = [
  /<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!pull<\/div>[\s\S]*?<\/div>/g,
  /<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!spin<\/div>[\s\S]*?<\/div>/g,
  /<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!skip<\/div>[\s\S]*?<\/div>/g,
  /<div className="bg-black\/80 border border-zinc-800 p-4 rounded-2xl">\s*<div className="font-bold text-white mb-1 text-lg">!bet @اسم<\/div>[\s\S]*?<\/div>/g
];

uiRegexes.forEach(rx => {
  code = code.replace(rx, '');
});

// Remove bets display
code = code.replace(/<div className="mt-6">\s*<h4 className="text-white font-bold mb-2 flex items-center gap-2">\s*<AlertTriangle className="w-5 h-5 text-red-500" \/>\s*الرهانات الحالية\s*<\/h4>[\s\S]*?<\/div>\s*<\/div>/g, '');

fs.writeFileSync('src/components/RussianRouletteChatGame.tsx', code);
console.log('done');