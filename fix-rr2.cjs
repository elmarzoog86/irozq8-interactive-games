const fs = require('fs');
let code = fs.readFileSync('src/components/RussianRouletteChatGame.tsx', 'utf8');

const matchStr = 'if (players[activePlayerIndex] === uname) {';
const startIdx = code.indexOf(matchStr);

if (startIdx !== -1) {
    let openBraces = 0;
    let endIdx = -1;
    let foundFirst = false;
    for (let i = startIdx; i < code.length; i++) {
        if (code[i] === '{') {
            openBraces++;
            foundFirst = true;
        }
        if (code[i] === '}') {
            openBraces--;
            if (foundFirst && openBraces === 0) {
                endIdx = i;
                break;
            }
        }
    }
    
    if (endIdx !== -1) {
        const insertStr = `
         if (players[activePlayerIndex] === uname) {
             if (text.startsWith('!pass ')) {
                 if (hasPulledTrigger) {
                    const target = text.replace('!pass ', '').replace('@', '').trim();
                    if (target && target !== uname && players.includes(target)) {
                       const targetIdx = players.indexOf(target);
                       setActivePlayerIndex(targetIdx);
                       setHasPulledTrigger(false);
                       setTimeLeft(20);
                       if (soundEnabled) playSound('lobby_click');
                       setMessage(\`تم تمرير المسدس إلى \${target}! الانتظار لسحب الزناد...\`);
                    }
                 }
             }
         }`;
        code = code.substring(0, startIdx) + insertStr + code.substring(endIdx + 1);
        fs.writeFileSync('src/components/RussianRouletteChatGame.tsx', code);
        console.log('replaced');
    }
}
