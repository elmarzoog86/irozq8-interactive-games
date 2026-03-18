const fs = require('fs');
let c = fs.readFileSync('src/pages/BankRobberyController.tsx', 'utf8');
c = c.replace(/\\\`/g, '`');
fs.writeFileSync('src/pages/BankRobberyController.tsx', c);
