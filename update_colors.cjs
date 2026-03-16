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
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Replacements mappings
            content = content.replace(/brand-gold-light/g, 'brand-pink');
            content = content.replace(/brand-gold-dark/g, 'brand-indigo');
            content = content.replace(/brand-gold/g, 'brand-cyan');
            
            content = content.replace(/glow-gold-strong/g, 'glow-cyan-strong');
            content = content.replace(/glow-gold-text/g, 'glow-cyan-text');
            content = content.replace(/glow-gold/g, 'glow-cyan');
            
            content = content.replace(/text-gold-light/g, 'text-pink');
            content = content.replace(/text-gold/g, 'text-cyan');
            
            content = content.replace(/border-gold-strong/g, 'border-cyan-strong');
            content = content.replace(/border-gold/g, 'border-cyan');
            
            content = content.replace(/bg-gold-gradient/g, 'bg-cyan-gradient');

            content = content.replace(/rgba\(212,\s*175,\s*55/g, 'rgba(0, 229, 255');
            content = content.replace(/d4af37/gi, '00e5ff');
            content = content.replace(/f1c40f/gi, 'ff00ff');

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

processDir('src');
processDir('public');
