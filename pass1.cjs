const fs = require('fs');
const path = require('path');
const games = [
  'BankRobberyGame.tsx', 'BombRelayGame.tsx', 'ChairsGame.tsx', 'ChatRoyaleGame.tsx',
  'CodeNamesGame.tsx', 'FruitWar.tsx', 'HowManyGame.tsx', 'SnakesAndLaddersGame.tsx',
  'TeamFeudGame.tsx', 'TurfWarsGame.tsx'
];
games.forEach(game => {
    let p = path.join('src', 'components', game);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    if (!content.includes('MessageSquare')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"\`]lucide-react['"\`];/, (m, p1) => {
            return 'import {' + p1 + ', MessageSquare, MessageSquareOff } from "lucide-react";';
        });
    }

    if (!content.includes('const [showChat')) {
        const compRegex = /(export (?:default )?(?:function|const) \w+(?:[:\w<>\s]+)?\s*=?\s*\([^)]*\)\s*(?:=>)?\s*\{(?:\s*const[^;]+;)*)/;
        content = content.replace(compRegex, (m) => {
            return m + '\n  const [showChat, setShowChat] = useState(true);';
        });
        if (!content.includes('useState,')) {
            content = content.replace(/import React from 'react';/, "import React, { useState } from 'react';");
            content = content.replace(/import\s*\{\s*([^{}]+)\s*\}\s*from\s*['"]react['"];/, (m, p1) => {
                if(p1.includes('useState')) return m;
                return 'import { ' + p1 + ', useState } from "react";';
            });
            content = content.replace(/import\s*React,\s*\{\s*([^{}]+)\s*\}\s*from\s*['"]react['"];/, (m, p1) => {
                if(p1.includes('useState')) return m;
                return 'import React, { ' + p1 + ', useState } from "react";';
            });
        }
    }
    fs.writeFileSync(p, content);
});
console.log('done pass 1');
