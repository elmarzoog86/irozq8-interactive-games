const fs = require('fs'); let f = fs.readFileSync('src/App.tsx', 'utf8'); f = f.replace(/<a\s+href="https:\/\/discord\.com\/users\/M86"[\s\S]*?<\/a>/g, ''); fs.writeFileSync('src/App.tsx', f);
