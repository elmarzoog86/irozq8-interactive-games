const fs = require('fs');

function updateAppTsx() {
  let code = fs.readFileSync('src/App.tsx', 'utf8');

  // Change status of games from 'testing' to 'active'
  const gamesToUpdate = ['wordchain', 'missinglink', 'typingderby', 'categoryauction'];
  for (const gameId of gamesToUpdate) {
    const idx = code.indexOf(`id: '${gameId}'`);
    if (idx !== -1) {
      const statusIdx = code.indexOf("status: 'testing'", idx);
      if (statusIdx !== -1 && statusIdx - idx < 500) { // Limit search radius
        code = code.substring(0, statusIdx) + "status: 'active'" + code.substring(statusIdx + "status: 'testing'".length);
        console.log('Updated status for', gameId);
      }
    }
  }

  // Remove elements from the update popup
  // wordchain: MessageCircle
  code = code.replace(/<div className="flex items-start gap-3">\s*<div className="bg-purple-500\/20 p-2 rounded-lg mt-1 shrink-0"><MessageCircle[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>/g, '');

  // missinglink: Target
  code = code.replace(/<div className="flex items-start gap-3">\s*<div className="bg-brand-pink\/20 p-2 rounded-lg mt-1 shrink-0"><Target[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>/g, '');

  // typingderby: Rocket
  code = code.replace(/<div className="flex items-start gap-3">\s*<div className="bg-green-500\/20 p-2 rounded-lg mt-1 shrink-0"><Rocket[\s\S]*?<\/div>[\s\S]*?<\/div>\s*<\/div>/g, '');

  // categoryauction: Tag (We have two Tags, the second one is "مزاد الفئات").
  // Let's replace the one that contains "مزاد الفئات"
  code = code.replace(/<div className="flex items-start gap-3">\s*<div className="bg-blue-500\/20 p-2 rounded-lg mt-1 shrink-0"><Tag[\s\S]*?مزاد الفئات[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

  fs.writeFileSync('src/App.tsx', code, 'utf8');
}

updateAppTsx();
console.log('App.tsx updated');
