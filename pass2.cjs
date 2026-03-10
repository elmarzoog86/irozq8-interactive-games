const fs = require('fs');
const path = require('path');

const games = [
  'BankRobberyGame.tsx', 'BombRelayGame.tsx', 'ChairsGame.tsx', 'ChatRoyaleGame.tsx',
  'CodeNamesGame.tsx', 'FruitWar.tsx', 'HowManyGame.tsx', 'SnakesAndLaddersGame.tsx',
  'TeamFeudGame.tsx', 'TurfWarsGame.tsx'
];

games.forEach(game => {
    let p = path.join('src', 'components', game);
    if (!fs.existsSync(p)) return;
    let content = fs.readFileSync(p, 'utf8');

    // Remove old specific widths on the chat container
    // We will find `<TwitchChat` or `<ChatSidebar`
    const chatMatch = content.match(/<div[^>]*?>\s*(?:\{[^\}]+\}\s*)?<(?:TwitchChat|ChatSidebar)[^>]+?\/>\s*<\/div>/);
    const chatMatchConditional = content.match(/\{[^}]+&&\s*\(\s*<div[^>]*?>\s*(?:\{[^\}]+\}\s*)?<(?:TwitchChat|ChatSidebar)[\s\S]+?<\/div>\s*\)\s*\}/);

    let replaced = false;

    if (chatMatchConditional) {
        // e.g. {mode !== 'lobby' && ( <div class="w-80..."> <TwitchChat.../> </div> )}
        const innerMatch = chatMatchConditional[0].match(/<(TwitchChat|ChatSidebar)[\s\S]+?\/>/);
        if (innerMatch) {
            const condition = chatMatchConditional[0].match(/\{([^&]+)&&/);
            const condStr = condition ? condition[1].trim() : 'true';
            
            const newChat = `{showChat && ${condStr} && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            ${innerMatch[0]}
          </div>
        </div>
      )}`;
            content = content.replace(chatMatchConditional[0], newChat);
            replaced = true;
        }
    } else if (chatMatch) {
        const innerMatch = chatMatch[0].match(/<(TwitchChat|ChatSidebar)[\s\S]+?\/>/);
        if (innerMatch) {
            const newChat = `{showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            ${innerMatch[0]}
          </div>
        </div>
      )}`;
            content = content.replace(chatMatch[0], newChat);
            replaced = true;
        }
    }

    if (replaced && !content.includes('MessageSquareOff className')) {
        // Add the button just inside the main flex-1 tag (sometimes it's <div className="flex-1...)
        // Let's find `<div className="flex-1`
        const btnHtml = `\n        <button onClick={() => setShowChat(!showChat)} className="absolute top-6 left-6 text-brand-gold/70 hover:text-brand-gold flex items-center gap-2 transition-colors z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 shadow-xl">\n          {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}\n          {showChat ? '????? ?????' : '????? ?????'}\n        </button>\n`;
        
        let injected = false;
        // Inject right after the first `rounded-[40px]` flex-1 div
        content = content.replace(/(<div className="[^"]*flex-1[^"]*rounded-\[40px\][^"]*".*?>)/, (m) => {
            if (injected) return m;
            injected = true;
            return m + btnHtml;
        });

        // if not injected, try just first flex-1 div
        if (!injected) {
            content = content.replace(/(<div className="flex-1[^>]*>)/, (m) => {
                if (injected) return m;
                injected = true;
                return m + btnHtml;
            });
        }
    }

    fs.writeFileSync(p, content);
});
console.log('done pass 2');
