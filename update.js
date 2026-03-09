const fs = require('fs');

let content = fs.readFileSync('src/components/SnakesAndLaddersGame.tsx', 'utf-8');

// 1. Update SNAKES
content = content.replace(
  /const SNAKES: SnakeOrLadder\[\] = \[[\s\S]*?\];/,
  const SNAKES: SnakeOrLadder[] = [
  { start: 32, end: 8 },
  { start: 43, end: 17 },
  { start: 56, end: 15 },
  { start: 68, end: 26 },
  { start: 84, end: 57 },
  { start: 98, end: 41 }
];
);

// 2. Update LADDERS
content = content.replace(
  /const LADDERS: SnakeOrLadder\[\] = \[[\s\S]*?\];/,
  const LADDERS: SnakeOrLadder[] = [
  { start: 12, end: 29 },
  { start: 22, end: 40 },
  { start: 34, end: 67 },
  { start: 71, end: 92 },
  { start: 79, end: 100 }
];
);

// 3. Remove getCoordinates and getWavyPath
content = content.replace(
  /\/\/ Calculate board coordinates[\s\S]*?const getWavyPath =[\s\S]*?return path;\n[ ]*};/,
  ''
);

// 4. Modify renderBoard
const oldBoard =     // Render Grid
    const renderBoard = () => {
      const cells = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const effectiveRow = 9 - row; // 0 at bottom, 9 at top
          let number;
          if (effectiveRow % 2 === 0) {
               // Left to Right
               number = effectiveRow * 10 + col + 1;
          } else {
               // Right to Left
               number = effectiveRow * 10 + (10 - col);
          }

          const isBlack = (effectiveRow + col) % 2 !== 0;

          cells.push(
            <div key={number} className={\elative flex items-center justify-center border border-[#8B4513]/30
              \
              \}>
               <span className="absolute top-1 left-2 text-[#5D4037] font-serif font-bold text-lg opacity-60">{number}</span>;

const newBoard =     // Render Grid
    const renderBoard = () => {
      const cells = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const effectiveRow = 9 - row; // 0 at bottom, 9 at top
          let number;
          if (effectiveRow % 2 === 0) {
               // Right to Left (0, 2, 4...)
               number = effectiveRow * 10 + (10 - col);
          } else {
               // Left to Right (1, 3, 5...)
               number = effectiveRow * 10 + col + 1;
          }

          cells.push(
            <div key={number} className="relative flex items-center justify-center">;

content = content.replace(oldBoard, newBoard);

// 5. Remove spans for 100 and 1
content = content.replace(/\{number === 100[\s\S]*?<\/span>\}\n\s*\{number === 1[\s\S]*?<\/span>\}/, '');

// 6. Remove renderOverlays function completely
content = content.replace(/\/\/ Render SVG Lines and Images[\s\S]*?const renderOverlays = \(\) => \{[\s\S]*?(?=\{\/\* Grid Cells \*\/\})/, '');

// 7. Remove renderOverlays call
content = content.replace(/\{renderOverlays\(\)\}/, '');

// 8. modify the board container background
const oldContainer = <div className="relative aspect-square w-full max-h-full bg-[#F5DEB3] rounded-sm border-[16px] border-[#5d4037] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-10 grid-rows-10 transform perspective-1000 rotate-x-1">
                       {/* Texture Overlay */}
                       <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none z-0 mix-blend-multiply"></div>
                       <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)] pointer-events-none z-0"></div>

                       {/* Background SVGs for Snakes and Ladders */}
                       <div className="absolute inset-0 z-10 pointer-events-none drop-shadow-xl">
                         
                       </div>;

const newContainer = <div className="relative aspect-square w-full max-h-[85vh] rounded-2xl border-[12px] border-[#4A3728] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-10 grid-rows-10 transform bg-[url('/snakesandladder.png')] bg-cover bg-center bg-no-repeat">;

content = content.replace(oldContainer, newContainer);

fs.writeFileSync('src/components/SnakesAndLaddersGame.tsx', content);

console.log('Done nodescript');
