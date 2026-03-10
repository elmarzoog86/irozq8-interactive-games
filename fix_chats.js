const fs = require('fs');

const buttonHtml = `<button onClick={() => setShowChat(!showChat)} className="absolute top-6 left-6 text-brand-gold/70 hover:text-brand-gold flex items-center gap-2 transition-colors z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40 shadow-xl z-[90]">
            {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
            {showChat ? 'إخفاء الشات' : 'إظهار الشات'}
          </button>`;

const getSidebarHtml = (condition = 'showChat') => `{${condition} && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            <TwitchChat
              channelName={channelName}
              messages={messages}
              isConnected={isConnected}
              error={error}
            />
          </div>
        </div>
      )}`;

const files = [
  'BankRobberyGame.tsx',
  'BombRelayGame.tsx',
  'ChairsGame.tsx',
  'ChatRoyaleGame.tsx',
  'CodeNamesGame.tsx',
  'FruitWar.tsx',
  'HowManyGame.tsx',
  'SnakesAndLaddersGame.tsx',
  'TeamFeudGame.tsx',
  'TurfWarsGame.tsx',
  'TriviaGame.tsx',         // Doing it to Trivia just to normalize
  'WordChainGame.tsx',
  'RouletteGame.tsx',
  'PriceIsRightGame.tsx'
];

files.forEach(f => {
  const path = 'src/components/' + f;
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');

  // Replace button if it exists
  const btnRegex = /<button[^>]*onClick=\{\(\)\s*=>\s*setShowChat\(!showChat\)\}[^>]*>.*?<\/button>/s;
  if(btnRegex.test(content)) {
    content = content.replace(btnRegex, buttonHtml);
  }

  // Swap ChatSidebar to TwitchChat in TeamFeud/BombRelay
  content = content.replace(/<ChatSidebar[^>]*\/>/g, `<TwitchChat channelName={channelName} messages={messages} isConnected={isConnected} error={error} />`);
  // Import fix for ChatSidebar to TwitchChat
  if (content.includes('import { ChatSidebar }') || content.includes('import {ChatSidebar}')) {
    content = content.replace(/import\s*\{\s*ChatSidebar\s*\}\s*from\s*['"]\.\/ChatSidebar['"];?/, "import { TwitchChat } from './TwitchChat';");
  }

  // Add missing imports
  if (!content.includes('import { TwitchChat }') && !content.includes("from './TwitchChat'")) {
    content = content.replace(/import React/, "import { TwitchChat } from './TwitchChat';\nimport React");
  }
  
  if (!content.includes('MessageSquareOff')) {
    content = content.replace(/import \{([^}]+MessageSquare[^}]+)\}/, (match, p1) => {
       return `import {${p1}, MessageSquareOff}`;
    });
  }

  // Update TwitchChat prop aliases if hardcoded like in HowManyGame
  content = content.replace(/isConnected=\{true\}/g, 'isConnected={isConnected}');
  content = content.replace(/error=\{null\}/g, 'error={error}');

  // Replace the structural wrapper - snakes and ladders specific
  if (f === 'SnakesAndLaddersGame.tsx') {
    content = content.replace(/<div className="w-\[400px\] flex flex-col gap-4 shrink-0">[\s\S]*?<\/div>\s*<\/div>/, getSidebarHtml('showChat'));
  } else if (f === 'BankRobberyGame.tsx' || f === 'ChatRoyaleGame.tsx' || f === 'TurfWarsGame.tsx') {
    content = content.replace(/\{showChat && mode !== 'lobby' && \([\s\S]*?<TwitchChat[\s\S]*?\/>.*?<\/div>\s*<\/div>\s*\)/s, getSidebarHtml("showChat && mode !== 'lobby'"));
  } else if (f === 'BombRelayGame.tsx' || f === 'TeamFeudGame.tsx') {
    // In BombRelay and TeamFeud the wrapper might be slightly different or completely custom
    content = content.replace(/\{showChat && \([\s\S]*?<TwitchChat[\s\S]*?\/>[\s\S]*?<\/div>\s*\)\}/s, getSidebarHtml("showChat"));
  } else {
    // Default replacement for trivia style
    content = content.replace(/\{showChat && \([\s\S]*?<TwitchChat[\s\S]*?\/>.*?<\/div>\s*<\/div>\s*\)}/s, getSidebarHtml("showChat"));
  }

  fs.writeFileSync(path, content);
});
console.log('Fixed chat boxes');
