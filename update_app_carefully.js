const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targets = ['wordchain', 'typingderby', 'missinglink', 'categoryauction'];
for (const target of targets) {
  const match = new RegExp(id: '',[\\s\\S]*?status: 'testing');
  content = content.replace(match, (m) => m.replace("status: 'testing'", "status: 'active'"));
}

// Remove the item "????? ???????"/Word Chain
content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-purple-500\/20 p-2 rounded-lg mt-1 shrink-0"><MessageCircle[^>]*><\/MessageCircle><\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">????? ???????<\/h3>[^<]*<p className="text-sm text-zinc-400">[^<]*<\/p>\s*<\/div>\s*<\/div>/g, "");

content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-purple-500\/20 p-2 rounded-lg mt-1 shrink-0"><MessageCircle[^>]*\/>[\s\S]*?<\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">????? ???????<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, "")

content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-red-500\/20 p-2 rounded-lg mt-1 shrink-0"><Crown[^>]*\/>[\s\S]*?<\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">??? ????<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, "")

content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-yellow-500\/20 p-2 rounded-lg mt-1 shrink-0"><Link[^>]*\/>[\s\S]*?<\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">?????? ???????<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, "")

content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-green-500\/20 p-2 rounded-lg mt-1 shrink-0"><Rocket[^>]*\/>[\s\S]*?<\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">???? ???????<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, "")

content = content.replace(/<div className="flex items-start gap-3">\s*<div className="bg-blue-500\/20 p-2 rounded-lg mt-1 shrink-0"><Tag[^>]*\/>[\s\S]*?<\/div>\s*<div>\s*<h3 className="font-bold text-white mb-1">???? ??????<\/h3>[\s\S]*?<\/div>\s*<\/div>/g, "")


fs.writeFileSync('src/App.tsx', content);
