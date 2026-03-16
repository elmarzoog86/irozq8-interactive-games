const fs = require('fs'); let c = fs.readFileSync('src/App.tsx', 'utf8'); c = c.replace(/\/background\.webm[^\"]*/g, '/background.webm?v=' + Date.now()); fs.writeFileSync('src/App.tsx', c);
