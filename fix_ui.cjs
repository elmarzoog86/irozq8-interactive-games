const fs = require('fs');
let code = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

code = code.replace(/<span className="text-brand-gold">1<\/span> أو <span className="text-brand-gold">!join<\/span>/g, '<span className="text-brand-gold">!join</span>');

code = code.replace(/<div className="flex items-center gap-4">\s*<p className="text-3xl text-white font-mono">!join<\/p>\s*<span className="text-zinc-500">أو<\/span>\s*<p className="text-3xl text-white font-mono">1<\/p>\s*<\/div>/g, '<div className="flex items-center gap-4">\n                  <p className="text-3xl text-white font-mono">!join</p>\n                </div>');

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', code, 'utf8');
console.log('done UI fix');
