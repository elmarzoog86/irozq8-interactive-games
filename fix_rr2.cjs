const fs = require('fs');
let code = fs.readFileSync('src/components/RussianRouletteChatGame.tsx', 'utf8');

code = code.replace(/useState\(''\);\\\\n  const/, "useState('');\\n  const");
code = code.replace(/;\\\\n    setHasPulledTrigger/, ";\\n    setHasPulledTrigger");
code = code.replace(/;\\\\n    spinCylinder/, ";\\n    spinCylinder");
code = code.replace(/?????? ??????!\\'\);\\\\n     set/, "?????? ??????!');\\n     set");
code = code.replace(/ ?????? ??????!\\'\);\\\\n     set/, " ?????? ??????!');\\n     set");
code = code.replace(/\\\\n  useEffect/, "\\n  useEffect");
code = code.replace(/\\\\n    if \(mode/, "\\n    if (mode");
code = code.replace(/\\\\n      timerRef/, "\\n      timerRef");

fs.writeFileSync('src/components/RussianRouletteChatGame.tsx', code);
