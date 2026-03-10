const fs = require('fs');
const path = require('path');

const games = [
  'BankRobberyGame.tsx',
  'BombRelayGame.tsx',
  'ChairsGame.tsx',
  'ChatRoyaleGame.tsx',
  'CodeNamesGame.tsx',
  'FruitWar.tsx',
  'HowManyGame.tsx',
  'SnakesAndLaddersGame.tsx',
  'TeamFeudGame.tsx',
  'TurfWarsGame.tsx',
  'TriviaGame.tsx'
];

games.forEach(game => {
    const p = path.join('src', 'components', game);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Fix the double wrapping!
    // We want to replace `<div className="w-[500px]...` that ONLY wraps `{showChat && ...}`
    // Or just look for the pattern: <div className="w-\[500px\] flex flex-col gap-4">\s*\{showChat && \(\s*<div className="w-\[500px\] flex flex-col gap-4 shrink-0 transition-all duration-300">[\s\S]+?<\/div>\s*\)\}\s*<\/div>
    
    // Simpler: find `w-[500px]` that immediately wraps `{showChat &&` and unwrap it!
    const doubleWrapRegex = /<div className="w-\[500px\][^"]*">\s*(\{showChat &&\s*\([\s\S]+?<\/div>\s*\)\})\s*<\/div>/;
    
    let match;
    while ((match = content.match(doubleWrapRegex)) !== null) {
        content = content.replace(match[0], match[1]);
    }
    
    // Same for `<div className="w-80...> {showChat && ... } </div>`
    const doubleWrap80 = /<div className="w-80[^>]*">\s*(\{showChat &&\s*\([\s\S]+?<\/div>\s*\)\})\s*<\/div>/;
    while ((match = content.match(doubleWrap80)) !== null) {
        content = content.replace(match[0], match[1]);
    }

    fs.writeFileSync(p, content, 'utf8');
});
console.log('done removing double wrappers');
