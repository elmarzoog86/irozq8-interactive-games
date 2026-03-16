const fs = require('fs');
['src/components/TeamFeudGame.tsx', 'src/components/BombRelayGame.tsx'].forEach(file => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/'gold'/g, `'pink'`)
       .replace(/'black'/g, `'blue'`)
       .replace(/"gold"/g, `"pink"`)
       .replace(/"black"/g, `"blue"`)
       .replace(/gold:/g, `pink:`)
       .replace(/black:/g, `blue:`)
       .replace(/\bgold\?/g, `pink?`)
       .replace(/\bblack\?/g, `blue?`)
       .replace(/الذهبي/g, 'الوردي')
       .replace(/الأسود/g, 'الأزرق');
  
  // also handle properties like state.leaders?.gold
  c = c.replace(/\.gold\b/g, '.pink')
       .replace(/\.black\b/g, '.blue');
       
  fs.writeFileSync(file, c, 'utf8');
  console.log(`Updated ${file}`);
});