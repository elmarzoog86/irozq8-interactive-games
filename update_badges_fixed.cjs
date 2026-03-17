const fs = require('fs');

function cleanFile() {
  let text = fs.readFileSync('src/App.tsx', 'utf8');

  // Regex to remove ONLY the asked games from the popup
  // Word Chain (MessageCircle, سلسلة الكلمات)
  const regexWordChain = /<div className="flex items-start gap-3">\s*<div className="bg-purple-500\/20 p-2 rounded-lg mt-1 shrink-0"><MessageCircle[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  text = text.replace(regexWordChain, '');

  // Missing Link (Target, الرابط العجيب)
  const regexMissingLink = /<div className="flex items-start gap-3">\s*<div className="bg-brand-pink\/20 p-2 rounded-lg mt-1 shrink-0"><Target[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  text = text.replace(regexMissingLink, '');

  // Typing Derby (Rocket, سباق الكتابة)
  const regexTypingDerby = /<div className="flex items-start gap-3">\s*<div className="bg-green-500\/20 p-2 rounded-lg mt-1 shrink-0"><Rocket[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  text = text.replace(regexTypingDerby, '');

  // Category Auction (Tag with مزاد الفئات)
  const regexCatAuction = /<div className="flex items-start gap-3">\s*<div className="bg-blue-500\/20 p-2 rounded-lg mt-1 shrink-0"><Tag[\s\S]*?مزاد الفئات[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
  text = text.replace(regexCatAuction, '');

  // Remove testing badges from wordchain, missinglink, typingderby, categoryauction
  const updateStatus = (id) => {
    const idx = text.indexOf(`id: '${id}'`);
    if (idx !== -1) {
      const statusIdx = text.indexOf("status: 'testing'", idx);
      if (statusIdx !== -1 && statusIdx - idx < 500) { // Limit search radius
        text = text.substring(0, statusIdx) + "status: 'active'" + text.substring(statusIdx + "status: 'testing'".length);
        console.log(`Updated status for ${id}`);
      }
    }
  };

  updateStatus('wordchain');
  updateStatus('missinglink');
  updateStatus('typingderby');
  updateStatus('categoryauction');

  fs.writeFileSync('src/App.tsx', text, 'utf8');
}

cleanFile();
console.log('Finished updating App.tsx.');
