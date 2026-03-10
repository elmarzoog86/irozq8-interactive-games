const fs = require('fs'); 
const files = ['src/components/HowManyGame.tsx', 'src/components/CodeNamesGame.tsx']; 
for (const file of files) { 
    let content = fs.readFileSync(file, 'utf8'); 
    if (content.includes('MessageSquareOff') && !content.match(/import.*MessageSquareOff.*lucide-react/)) { 
        content = content.replace(/import { ([^}]+) } from 'lucide-react';/, (match, p1) => { 
            if (!p1.includes('MessageSquareOff')) { 
                return `import { ${p1}, MessageSquareOff } from 'lucide-react';`; 
            } 
            return match; 
        }); 
        fs.writeFileSync(file, content); 
    } 
}