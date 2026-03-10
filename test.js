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
  'TurfWarsGame.tsx'
];

games.forEach(game => {
    let p = path.join('src', 'components', game);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // 1. Add MessageSquare and MessageSquareOff to lucide-react or import them if missing
    if (!content.includes('MessageSquare')) {
        if (content.includes('lucide-react')) {
            content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (m, p1) => {
                return \import {\, MessageSquare, MessageSquareOff } from 'lucide-react';\;
            });
        } else {
            content = \import { MessageSquare, MessageSquareOff } from 'lucide-react';\n\ + content;
        }
    }

    // 2. Add const [showChat, setShowChat] = useState(true);
    // Find the main component function: usually export const GameName ... or export default function GameName ...
    if (!content.includes('const [showChat')) {
        const compRegex = /(export (?:default )?(?:function|const) \w+(?:[:\w<>]+)?\s*=?\s*\([^)]*\)\s*(?:=>)?\s*\{)/;
        content = content.replace(compRegex, (m, p1) => {
            return p1 + '\n  const [showChat, setShowChat] = React.useState(true);\n';
        });
        // Make sure React.useState is valid, wait, better to find if there's a React.useState or just use useState.
        // Actually, just add \const [showChat, setShowChat] = useState(true);\ and ensure useState is imported.
        content = content.replace('React.useState(true)', 'useState(true)');
        if (!content.includes('useState,')) {
            content = content.replace(/import\s+React.*?from\s+['"]react['"];/, (m) => m.includes('useState') ? m : m.replace('React', 'React, { useState }'));
        }
    }

    fs.writeFileSync(p, content);
});
console.log('first pass done');
