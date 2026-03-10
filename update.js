const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = fs.readdirSync('src/components').filter(f => f.endsWith('.tsx'));
files.forEach(f => {
  const file = path.join('src/components', f);
  let c = fs.readFileSync(file, 'utf8');
  if(!c.includes('<TwitchChat')) return;

  if(!c.includes('showChat')) {
    c = c.replace(/const \[([^\]]+)\] = useState([^;]+);/, "const [showChat, setShowChat] = useState(true);\n  const [] = useState;");
  }

  // Inject MessageSquareOff icon import if missing
  if(c.includes('lucide-react') && !c.includes('MessageSquareOff')) {
     c = c.replace(/import \{([^}]+)\} from 'lucide-react'/, "import {, MessageSquare, MessageSquareOff} from 'lucide-react'");
  }

  // Regex to match existing container wrapping the <TwitchChat> component
  const chatRegex = /<div className="w-\[500px\]([^>]+)>[\s\S]*?<TwitchChat([\s\S]*?)\/>\s*<\/div>\s*<\/div>/;

  if (chatRegex.test(c)) {
    c = c.replace(chatRegex, (match, classes, twitchProps) => {
      return 
        {/* Hideable Twitch Chat Sidebar */}
        <div className={\lex flex-col gap-4 relative transition-all duration-300 \\}>
          <button
            onClick={() => setShowChat(!showChat)}
            className="absolute -left-16 top-0 w-12 h-12 bg-black/80 rounded-xl text-brand-gold flex items-center justify-center border border-brand-gold/20 hover:bg-brand-gold/20 transition-all z-50 shadow-lg group"
            title={showChat ? "иийии ийиииии" : "иийии ийиииии"}
            style={{ visibility: "visible" }}
          >
            {showChat ? <MessageSquareOff size={24} /> : <MessageSquare size={24} />}
          </button>
          {showChat && (
            <div className="flex-1 w-[500px] min-h-0 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col">
              <TwitchChat\/>
            </div>
          )}
        </div>
      ;
    });
  }

  fs.writeFileSync(file, c);
});
console.log('Done mapping game files');
