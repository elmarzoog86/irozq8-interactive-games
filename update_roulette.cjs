const fs = require('fs');

const file = 'src/components/RouletteGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add gameMode State
content = content.replace(
  "const [gameState, setGameState] = useState<'lobby' | 'wheel' | 'spinning' | 'decision' | 'shooting' | 'result' | 'finished'>('lobby');",
  "const [gameState, setGameState] = useState<'lobby' | 'wheel' | 'spinning' | 'decision' | 'shooting' | 'result' | 'finished'>('lobby');\n  const [gameMode, setGameMode] = useState<'shakhsana' | 'no_shakhsana'>('no_shakhsana');"
);

// 2. Remove yellow bar
content = content.replace(
  "{p.id === actor.id && p.status === 'alive' && <div className=\"absolute top-0 inset-x-0 h-1 bg-brand-gold shadow-[0_0_10px_#d4af37]\" />}",
  ""
);

// 3. Conditional render of username
// In the map function, we have:
// <span className="font-bold text-lg mb-2 truncate w-full" style={{color: p.color}}>{p.username}</span>
// Let's replace it:
content = content.replace(
  /<span className=\"font-bold text-lg mb-2 truncate w-full\" style=\{\{color:\s*p\.color\}\}>\{p\.username\}<\/span>/,
  "{gameMode === 'shakhsana' && <span className=\"font-bold text-lg mb-2 truncate w-full\" style={{color: p.color}}>{p.username}</span>}"
);

// 4. Add Lobby mode selector
const lobbyRegex = /<div className="bg-black\/70 border border-brand-gold\/20 rounded-2xl p-8 w-full text-center mb-8 relative">/;

const modeSelector = `<div className="flex justify-center gap-4 mb-8">
              <button
                onClick={() => setGameMode('no_shakhsana')}
                className={\`px-6 py-3 rounded-xl font-bold transition-all \${
                  gameMode === 'no_shakhsana'
                    ? 'bg-brand-gold text-black scale-105 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-black/50 text-white/50 border border-white/10 hover:bg-white/10'
                }\`}
              >
                بدون شخصنه (أرقام فقط)
              </button>
              <button
                onClick={() => setGameMode('shakhsana')}
                className={\`px-6 py-3 rounded-xl font-bold transition-all \${
                  gameMode === 'shakhsana'
                    ? 'bg-red-500 text-white scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-black/50 text-white/50 border border-white/10 hover:bg-white/10'
                }\`}
              >
                تبي تشخصن؟ (تظهر الأسماء)
              </button>
            </div>

            <div className="bg-black/70 border border-brand-gold/20 rounded-2xl p-8 w-full text-center mb-8 relative">`;

content = content.replace(lobbyRegex, modeSelector);

fs.writeFileSync(file, content);
console.log('Done Update Roulette');