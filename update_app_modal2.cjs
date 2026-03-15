const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const t = content.lastIndexOf('الرابط العجيب');
if (t > 0) {
  // Let's find the start of the `<div className="flex items-start gap-3">` right before it
  const startTarget = content.lastIndexOf('<div className="flex items-start gap-3">', t);
  
  const toInject = `<div className="flex items-start gap-3">
                     <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0"><Tag className="w-5 h-5 text-blue-500" /></div>
                     <div>
                       <h3 className="font-bold text-white mb-1">مسار المعرفة</h3>
                       <p className="text-sm text-zinc-400">لعبة لوحية هادئة وتنافسية! ارمِ النرد واجمع 4 ميداليات من أسئلة ثقافية.</p>
                     </div>
                  </div>

                  `;
                  
  content = content.substring(0, startTarget) + toInject + content.substring(startTarget);
  fs.writeFileSync('src/App.tsx', content, 'utf-8');
  console.log('Successfully injected the text');
} else {
  console.log('Could not find marker text.');
}