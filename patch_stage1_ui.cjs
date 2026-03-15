const fs = require('fs');

let content = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

if (!content.includes('isCollected = players[currentPlayerIndex]?.tokens.includes(tile.id)')) {
    const rx = /\{BOARD_TILES\.map\(\(tile, i\) => \{\s*const rc = getBoardCoordinates\(i\);\s*return \(\s*<div\s*key=\{i\}\s*className=\{`relative rounded-\[20%\] border-2 flex items-center justify-center \$\{tile\.color\} shadow-lg transition-colors`\}/;
    
    if (rx.test(content)) {
        content = content.replace(
            rx,
            `{BOARD_TILES.map((tile, i) => {\n                        const rc = getBoardCoordinates(i);\n                        const isCollected = players[currentPlayerIndex]?.tokens.includes(tile.id);\n                        const tileStyle = isCollected && gameState !== 'lobby' && gameState !== 'game_over' && (gameState === 'turn_start' || gameState === 'rolling' || gameState === 'answering' || gameState === 'result') ? 'bg-zinc-900 border-zinc-800 opacity-40 grayscale' : tile.color;\n                        return (\n                          <div\n                            key={i}\n                            className={\`relative rounded-[20%] border-2 flex items-center justify-center \${tileStyle} shadow-lg transition-all duration-500\`}`
        );
        fs.writeFileSync('src/components/TrivialPursuitGame.tsx', content);
        console.log("Patched UI to dim completed categories.");
    } else {
        console.log("Regex did not match.");
    }
} else {
    console.log("Already patched UI.");
}
