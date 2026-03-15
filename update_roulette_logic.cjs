const fs = require('fs');

const file = 'src/components/RouletteGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add hasUsedRevive to Player interface
content = content.replace(
  "  hasRevived?: boolean;",
  "  hasRevived?: boolean;\n  hasUsedRevive?: boolean;"
);

// 2. Update logic for handleAction. We need to check if the actor has used revive.
// In handleAction(selectedTarget: Player), we need to update actor's hasUsedRevive when reviving someone.
// Wait, to safely do this inside handleAction which only takes selectedTarget, we can use the current actor from state.     

const newHandleAction = `  const handleAction = (selectedTarget: Player) => {
    if (!actor) return;
    
    setTarget(selectedTarget);

    if (selectedTarget.status === 'eliminated') {
      if (selectedTarget.hasRevived || actor.hasUsedRevive) {
         // Prevent double revive for the target OR if the actor already revived someone
         return;
      }
      // Revive
      setResultMsg(\`🕊️ تم إنعاش \${selectedTarget.username}! عاد إلى اللعبة.\`);
      setPlayers(prev => prev.map(p => {
        if (p.id === selectedTarget.id) {
          return { ...p, status: 'alive', survivedShots: 0, hasRevived: true };
        }
        if (p.id === actor.id) {
          return { ...p, hasUsedRevive: true };
        }
        return p;
      }));
      setActor(prev => prev ? { ...prev, hasUsedRevive: true } : prev); // Update current actor state
      setGameState('result');
    } else {
      // Shoot (Russian Roulette) Animation
      setGameState('shooting');

      // Chance gets higher the more shots they survive. If they survived 5 shots, remaining chambers is 1, so 1/1 = 100% chance.
      const remainingChambers = Math.max(1, 6 - selectedTarget.survivedShots);
      const isBullet = Math.random() < (1 / remainingChambers);

      setTimeout(() => {
        if (isBullet) {
           setResultMsg(\`💥 بوم! الرصاصة أصابت \${selectedTarget.username} وتم إقصاؤه!\`);
           setPlayers(prev => prev.map(p => p.id === selectedTarget.id ? { ...p, status: 'eliminated' } : p));
        } else {
           setResultMsg(\`كليك! مسدس فارغ.. \${selectedTarget.username} نجا بصعوبة!\`);
           setPlayers(prev => prev.map(p => p.id === selectedTarget.id ? { ...p, survivedShots: p.survivedShots + 1 } : p));
        }
        setGameState('result');
      }, 3500); // Wait 3.5 seconds for dramatic shooting animation
    }
  };`;

// We must replace the old handleAction block completely.
// the string starts at "  const handleAction = (selectedTarget: Player) => {"
// and ends at "    }\n  };"

content = content.replace(
  /  const handleAction = \(selectedTarget: Player\) => \{[\s\S]*?3500\); \/\/ Wait 3\.5 seconds for dramatic shooting animation\n    \}\n  \};/,
  newHandleAction
);

// 3. Optional: display if the player's revive is disabled OR if the target is un-reviveable
// The current code has:
// ) : p.hasRevived ? (
//  <div className="flex items-center gap-1 text-zinc-500 text-xs font-bold bg-zinc-500/10 px-2 py-1 rounded mb-2 border border-zinc-500/20">
//   <Skull className="w-4 h-4" /> لا يمكن إنعاشه مجدداً
//  </div>
// ) : (

// Let's modify it so we show it's disabled if the *actor* has used revive as well.
content = content.replace(
  /\) : p\.hasRevived \? \(/g,
  ") : (p.hasRevived || actor?.hasUsedRevive) ? ("
);

// 4. Reset game should clear everything, players array is already [] which is fine.

fs.writeFileSync(file, content);
console.log('Done Update Roulette Logic');