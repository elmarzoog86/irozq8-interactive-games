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

            // Strategy: Make h1, h3, h4 pink/magenta.
            content = content.replace(/<h1(.*?)text-brand-cyan(.*?)>/g, '<h1$1text-brand-pink$2>');
            content = content.replace(/<h2(.*?)>([\s\S]*?)<span className="(.*?)text-brand-cyan(.*?)"/g, '<h2$1>$2<span className="$3text-brand-pink$4"');
            
            // Randomly swap some structural borders to indigo (accent borders)
            content = content.replace(/shadow-\[0_0_50px_rgba\(0,229,255/g, 'shadow-[0_0_50px_rgba(255,0,255');
            // Swap some icon containers
            content = content.replace(/w-16 h-16 text-brand-cyan/g, 'w-16 h-16 text-brand-pink');
            content = content.replace(/w-32 h-32 text-brand-cyan/g, 'w-32 h-32 text-brand-indigo');
            // Mix up background highlights
            content = content.replace(/bg-brand-cyan\/10(.*?)border-brand-cyan/g, 'bg-brand-indigo/10$1border-brand-indigo');
            
            // Re-map some buttons to Pink
            content = content.replace(/bg-brand-cyan hover:bg-brand-pink disabled/g, 'bg-brand-pink hover:bg-pink-400 disabled'); // from earlier direct replacment logic fallback
            content = content.replace(/className="bg-brand-cyan/g, 'className="bg-brand-pink');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Mixed ' + fullPath);
            }
        }
    }
}

processDir('src');
