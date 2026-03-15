const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

// 1. Add `avatar?: string;` to Player interface
if (!content.includes('avatar?: string;')) {
    content = content.replace(/color: string;\n\}/g, "color: string;\n    avatar?: string;\n}");
}

// 2. Change the join logic
content = content.replace(/if \(!players\.find\(p => p\.username === username\) && players\.length < 8\) \{\s*setPlayers\(prev => \[\.\.\.prev, \{\s*username,\s*position: 0,\s*score2: 0,\s*tokens: \[\],\s*color: PLAYER_COLORS\[prev\.length\]\s*\}\]\);\s*\}/g,
`setPlayers(prev => {
              if (prev.find(p => p.username === username) || prev.length >= 8) return prev;
              
              fetch(\`https://decapi.me/twitch/avatar/\${username}\`)
                .then(res => res.text())
                .then(avatarUrl => {
                  if (avatarUrl && !avatarUrl.includes('User not found')) {
                     setPlayers(p => p.map(pl => pl.username === username ? { ...pl, avatar: avatarUrl } : pl));
                  }
                }).catch(() => {});

              return [...prev, {
                username,
                position: 0,
                score2: 0,
                tokens: [],
                color: PLAYER_COLORS[prev.length]
              }];
            });`);


// 3. Replace decapi.me `src` references
content = content.replace(/src=\{\`https:\/\/decapi\.me\/twitch\/avatar\/\$\{p\.username\}\`\}/g,
  `src={p.avatar || \`https://ui-avatars.com/api/?name=\${p.username}&background=random\`}`);

content = content.replace(/src=\{\`https:\/\/decapi\.me\/twitch\/avatar\/\$\{players\[currentPlayerIndex\]\?\.username\}\`\}/g,
  `src={players[currentPlayerIndex]?.avatar || \`https://ui-avatars.com/api/?name=\${players[currentPlayerIndex]?.username}&background=random\`}`);

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
console.log('Avatars patched!');