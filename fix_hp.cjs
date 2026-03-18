const fs = require('fs');
let content = fs.readFileSync('src/data/hot-potato-questions.ts', 'utf8');

// fix the weird text
content = content.replace('ما হচ্ছে أكبر محيط في العالم؟', 'ما هو أكبر محيط في العالم؟');

// wrap all single string answers in arrays
content = content.replace(/a:\s*"([^"]+)"/g, 'a: ["$1"]');

// fix double arrays if any were already arrays
content = content.replace(/a:\s*\["\["([^"]+)"\]"\]/g, 'a: ["$1"]');

fs.writeFileSync('src/data/hot-potato-questions.ts', content, 'utf8');
