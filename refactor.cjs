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

    // 1. imports
    if (!content.includes('MessageSquare')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"];/, (match, p1) => {
            return `import {${p1}, MessageSquare, MessageSquareOff} from "lucide-react";`;
        });
    }

    // 2. useState
    if (!content.includes('const [showChat')) {
        const compRegex = /(export (?:default )?(?:function|const) \w+(?:[:\w<>\s]+)?\s*=?\s*\([^)]*\)\s*(?:=>)?\s*\{)([\s\S]*?)const \[(.*?\] = (?:React\.)?useState)/m;
        content = content.replace(compRegex, (match, p1, p2, p3) => {
            return p1 + p2 + 'const [showChat, setShowChat] = useState(true);\n  const [' + p3;
        });
        
        // Ensure useState is imported
        if (!content.includes('useState,')) {
            content = content.replace(/import\s+\{\s*([^{}]+)\s*\}\s*from\s*['"]react['"];/, (match, p1) => {
                if(p1.includes('useState')) return match;
                return `import { ${p1}, useState } from "react";`;
            });
            if (!content.includes('useState')) {
                content = content.replace(/import React from ['"]react['"];/, 'import React, { useState } from "react";');
            }
        }
    }

    // 3. Update the layout wrapping
    const chatMatch = content.match(/<div[^>]*?>\s*(?:\{[^\}]+\}\s*)?<(?:TwitchChat|ChatSidebar)[^>]+?\/>\s*<\/div>/);
    const chatMatchConditional = content.match(/\{[\s\S]{0,100}&&\s*\(\s*<div[^>]*?>\s*(?:\{[^\}]+\}\s*)?<(?:TwitchChat|ChatSidebar)[\s\S]+?<\/div>\s*\)\s*\}/);

    let replaced = false;

    if (chatMatchConditional) {
        const innerMatch = chatMatchConditional[0].match(/<(TwitchChat|ChatSidebar)[\s\S]+?\/>/);
        if (innerMatch) {
            const conditionMatch = chatMatchConditional[0].match(/\{([^&]+)&&/);
            const conditionStr = conditionMatch ? conditionMatch[1].trim() : 'true';
            
            const newChat = `{showChat && ${conditionStr} && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            ${innerMatch[0]}
          </div>
        </div>
      )}`;
            content = content.replace(chatMatchConditional[0], newChat);
            replaced = true;
        }
    } else if (chatMatch) {
        const innerMatch = chatMatch[0].match(/<(TwitchChat|ChatSidebar)[\s\S]+?\/>/);
        if (innerMatch) {
            const newChat = `{showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            ${innerMatch[0]}
          </div>
        </div>
      )}`;
            content = content.replace(chatMatch[0], newChat);
            replaced = true;
        }
    }

    const btnHtml = `\n        <button onClick={() => setShowChat(!showChat)} className="absolute top-6 left-6 text-brand-gold/70 hover:text-brand-gold flex items-center gap-2 transition-colors z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 shadow-xl z-50">\n          {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}\n          {showChat ? 'إخفاء الشات' : 'إظهار الشات'}\n        </button>\n`;

    if (replaced && !content.includes('MessageSquareOff')) {
        let injected = false;
        
        // Find the main component body div wrapper
        content = content.replace(/(<div className="flex-1[^>]*rounded-\[40px\][^>]*>)/, (m) => {
            if (injected) return m;
            injected = true;
            return m + btnHtml;
        });

        if (!injected) {
            content = content.replace(/(<div className="[^>]*flex-1[^>]*>)/, (m) => {
                if (injected) return m;
                injected = true;
                return m + btnHtml;
            });
        }
    }

    fs.writeFileSync(p, content, 'utf8');
});
console.log('done pass 3');
