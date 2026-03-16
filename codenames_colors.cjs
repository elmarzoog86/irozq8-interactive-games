const fs = require('fs');
let c = fs.readFileSync('src/components/CodeNamesGame.tsx', 'utf8');

c = c.replace(/team: 'gold' \| 'black' \| null/g, "team: 'pink' | 'blue' | null");
c = c.replace(/'gold' \| 'black' \| 'neutral' \| 'assassin'/g, "'pink' | 'blue' | 'neutral' | 'assassin'");
c = c.replace(/'gold' \| 'black'/g, "'pink' | 'blue'");
c = c.replace(/gold: number; black: number/g, "pink: number; blue: number");
c = c.replace(/gold: string \| null; black: string \| null/g, "pink: string | null; blue: string | null");
c = c.replace(/currentTurn: 'gold' \| 'black'/g, "currentTurn: 'pink' | 'blue'");
c = c.replace(/winner\?: 'gold' \| 'black'/g, "winner?: 'pink' | 'blue'");

c = c.replace(/team === 'gold'/g, "team === 'pink'");
c = c.replace(/team === 'black'/g, "team === 'blue'");
c = c.replace(/spymasters\?\.gold/g, "spymasters?.pink");
c = c.replace(/spymasters\?\.black/g, "spymasters?.blue");
c = c.replace(/'gold',/g, "'pink',");
c = c.replace(/'black',/g, "'blue',");
c = c.replace(/type === 'gold'/g, "type === 'pink'");
c = c.replace(/type === 'black'/g, "type === 'blue'");
c = c.replace(/scores\.gold/g, "scores.pink");
c = c.replace(/scores\.black/g, "scores.blue");
c = c.replace(/winner === 'gold'/g, "winner === 'pink'");
c = c.replace(/winner === 'black'/g, "winner === 'blue'");
c = c.replace(/cardType === 'gold'/g, "cardType === 'pink'");
c = c.replace(/cardType === 'black'/g, "cardType === 'blue'");
c = c.replace(/team: 'gold'/g, "team: 'pink'");
c = c.replace(/team: 'black'/g, "team: 'blue'");
c = c.replace(/currentTurn === 'gold'/g, "currentTurn === 'pink'");
c = c.replace(/currentTurn === 'black'/g, "currentTurn === 'blue'");

c = c.replace(/setSpymaster\(p\.name, 'gold'\)/g, "setSpymaster(p.name, 'pink')");
c = c.replace(/setSpymaster\(p\.name, 'black'\)/g, "setSpymaster(p.name, 'blue')");
c = c.replace(/switchTeam\(p\.id, 'gold'\)/g, "switchTeam(p.id, 'pink')");
c = c.replace(/switchTeam\(p\.id, 'black'\)/g, "switchTeam(p.id, 'blue')");

c = c.replace(/الفريق الذهبي/g, "الفريق الوردي");
c = c.replace(/الفريق الأسود/g, "الفريق الأزرق");
c = c.replace(/الذهبي/g, "الوردي");
c = c.replace(/الأسود/g, "الأزرق");
c = c.replace(/\/\* Gold Team \*\//g, "/* Pink Team */");
c = c.replace(/\/\* Black Team \*\//g, "/* Blue Team */");

c = c.replace(/entry\.team === 'gold'/g, "entry.team === 'pink'");
c = c.replace(/entry\.team === 'black'/g, "entry.team === 'blue'");

// Styles replacement: we might have 'bg-brand-indigo/10' or similar for Gold.
// Let's replace 'bg-brand-cyan text-brand-black shadow-\[0_0_10px_rgba\(0, 229, 255,0\.5\)\]' with brand pink if needed,
// but let's just make sure the pink is pink and blue is cyan/indigo.
// The user asked to change the team *names* to pink and blue. That means logically we should probably use pink and blue colors as well.
// We can substitute 'bg-brand-cyan' -> 'bg-brand-pink' where type === 'pink' or similar.

fs.writeFileSync('src/components/CodeNamesGame.tsx', c);
