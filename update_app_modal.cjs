const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const markerDate = '13/3/2026';
if (content.includes(markerDate)) {
  content = content.replace(markerDate, '14/3/2026');
}

const targetReplacement = `                  <div className="flex items-start gap-3">
                     <div className="bg-brand-gold/20 p-2 rounded-lg mt-1 shrink-0"><Target className="w-5 h-5 text-brand-gold" /></div>`;

const newHTML = `                  <div className="flex items-start gap-3">
                     <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0"><Tag className="w-5 h-5 text-blue-500" /></div>
                     <div>
                       <h3 className="font-bold text-white mb-1">مسار المعرفة</h3>
                       <p className="text-sm text-zinc-400">لعبة لوحية هادئة وتنافسية! ارمِ النرد واجمع 4 ميداليات من أسئلة ثقافية.</p>
                     </div>
                  </div>

` + targetReplacement;

content = content.replace(targetReplacement, newHTML);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Update text inserted');
