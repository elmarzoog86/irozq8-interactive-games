const fs = require('fs');

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('MessageSquareOff')) {
    content = content.replace(/import { ([^}]+) } from 'lucide-react';/, "import { $1, MessageSquareOff } from 'lucide-react';");
  }

  const btnHtml = `
      <button 
        onClick={() => setShowChat(!showChat)}
        className="absolute top-6 left-6 z-[90] bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
      >
        {showChat ? <MessageSquareOff className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        <span className="font-bold">{showChat ? 'إخفاء' : 'إظهار'}</span>
      </button>
  `;

  content = content.replace(/(<div className="flex h-full w-full[^>]+dir="rtl">)/, "$1\n" + btnHtml);

  content = content.replace(/<ChatSidebar\s+messages=\{messages\}\s+instructions=\{\[([\s\S]*?)\]\}\s*\/>/g, (match, p1) => {
    return `{showChat && (
        <div className="w-[500px] flex flex-col gap-4 shrink-0 transition-all duration-300 p-6 z-[80]">
          <div className="flex-1 min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 via-transparent to-black/60 pointer-events-none" />
            <div className="relative h-full flex flex-col">
              <ChatSidebar messages={messages} instructions={[${p1}]} />
            </div>
          </div>
        </div>
      )}`;
  });

  fs.writeFileSync(file, content);
}

processFile('src/components/BombRelayGame.tsx');
processFile('src/components/TeamFeudGame.tsx');
