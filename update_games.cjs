const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// remove all current isNew: true
code = code.replace(/,\s*isNew:\s*true/g, '');

// add isNew: true to the specific games
const newGames = ['wordchain', 'roulette', 'chairs', 'typingderby', 'categoryauction', 'missinglink', 'typingroyale'];

for (const game of newGames) {
  const regex = new RegExp(`(id:\\s*'${game}'.*?color:\\s*'[^']+')`, 'gs');
  code = code.replace(regex, `$1,\n      isNew: true`);
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated!');