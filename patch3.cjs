const fs = require('fs');
let file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{BOARD_TILES\.map\(\(tile, i\) => \{\n\s*const rc = getBoardCoordinates\(i\);\n\s*return \(\n\s*<div\n\s*key=\{i\}\n\s*className=\{`relative rounded-\[20%\] border-2 flex items-center justify-center \$\{tile\.color\}\s*shadow-lg transition-colors`\}/,
  `{BOARD_TILES.map((tile, i) => {
                        const rc = getBoardCoordinates(i);
                        const isTileDisabled = players[currentPlayerIndex] && players[currentPlayerIndex].tokens.includes(tile.id);
                        return (
                          <div
                            key={i}
                            className={\`relative rounded-[20%] border-2 flex items-center justify-center \${tile.color} shadow-lg transition-colors \${isTileDisabled ? 'opacity-30 grayscale' : 'opacity-100'}\`}`
);

fs.writeFileSync(file, content);
console.log('patched tile UI');
