const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

if (!code.includes('const [fakeUsername')) {
    code = code.replace(
        'const [selectedTarget, setSelectedTarget] = useState<string | null>(null);',
        `const [selectedTarget, setSelectedTarget] = useState<string | null>(null);\n  const [fakeUsername, setFakeUsername] = useState('');\n  const [fakeMessage, setFakeMessage] = useState('');\n  const [kickUsername, setKickUsername] = useState('');`
    );
}

fs.writeFileSync('src/pages/Admin.tsx', code);
console.log('Fixed states');
