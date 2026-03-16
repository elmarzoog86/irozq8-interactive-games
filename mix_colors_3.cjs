const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist') {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Make the game blocks on the main screen use a mix of borders
            // Convert alternating card borders to pink
            let cardCount = 0;
            content = content.replace(/border-brand-cyan\/10 hover:border-brand-cyan\/50/g, () => {
                cardCount++;
                return cardCount % 2 === 0 ? 'border-brand-indigo/30 hover:border-brand-pink/60' : 'border-brand-cyan/20 hover:border-brand-cyan/60';
            });
            
            // Rebalance the title screen (App.tsx mostly) icons
            content = content.replace(/<span className="(.*?)text-brand-cyan(.*?)">(.*?)<\/span>/g, '<span className="$1text-brand-indigo$2">$3</span>');
            
            // Buttons logic:
            content = content.replace(/bg-brand-pink hover:bg-brand-pink-light/g, 'bg-brand-pink hover:bg-pink-400');
            // Many buttons didn't match the first run
            content = content.replace(/className="bg-brand-cyan disabled/g, 'className="bg-brand-pink disabled');
            content = content.replace(/border-brand-cyan\/30(.*?)shadow-2xl/g, 'border-brand-indigo/30$1shadow-2xl');
            
            content = content.replace(/text-3xl font-black text-brand-cyan/g, 'text-3xl font-black text-brand-indigo');
            content = content.replace(/text-5xl font-black text-brand-cyan/g, 'text-5xl font-black text-brand-indigo');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Mixed ' + fullPath);
            }
        }
    }
}

processDir('src');
