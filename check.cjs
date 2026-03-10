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

    // Fix the double wrapping for any w- class !
    const doubleWrapRegex = /<div className="w-[^"]*">\s*(\{showChat &&\s*\([\s\S]+?<\/div>\s*\)\})\s*(?:{.*?}\s*)?<\/div>/;
    
    let match;
    while ((match = content.match(doubleWrapRegex)) !== null) {
        // Wait, if it has sibling like `Debug/Manual Controls` inside the w-[400px], 
        // removing the div might break things! Let's check SnakesAndLadders:
        //          {/* Twitch Chat Sidebar */}
        //          <div className="w-[400px] flex flex-col gap-4">
        //            {showChat && ( ... )}
        //            {/* Debug/Manual Controls */} ... </div>
        
        break; // Better handle safely below.
    }
});
