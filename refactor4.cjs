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

    if (!content.includes('const [showChat, setShowChat] = useState(true);')) {
        // Just inject it after the first `const [` inside the file
        // This is safe assuming the first `const [` is a useState hook in the main function body
        content = content.replace(/(const \[.*?\] = (?:React\.)?useState)/, 'const [showChat, setShowChat] = useState(true);\n  $1');

        if (content.includes('const [showChat, setShowChat] = useState(true);')) {
             if (!content.includes('useState,')) {
                content = content.replace(/import\s+\{\s*([^{}]+)\s*\}\s*from\s*['"]react['"];/, (m, p1) => {
                    if(p1.includes('useState')) return m;
                    return `import { ${p1}, useState } from "react";`;
                });
                if (!content.includes('useState')) {
                    content = content.replace(/import React from ['"]react['"];/, 'import React, { useState } from "react";');
                }
            }
        }
    }
    
    fs.writeFileSync(p, content, 'utf8');
});
console.log('done fixing via simpler hook replace');
