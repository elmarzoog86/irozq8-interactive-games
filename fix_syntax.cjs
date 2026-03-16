const fs = require('fs');
let c = fs.readFileSync('src/components/MissingLinkGame.tsx', 'utf8');

c = c.replace(/\{item\.image\.length <= 2 \? \([\s\S]*?\)\} \{\s*\([^>]+>\s*❓<\/span>';\s*\}\}\s*\/>/m, 
`{!item.image.startsWith('http') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <span className="text-[120px] drop-shadow-2xl select-none leading-none">{item.image}</span>
                            </div>
                          ) : (
                            <img
                              src={item.image}
                              alt={item.text}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl text-white">⚠️</span>';
                              }}
                            />
                          )}`);

fs.writeFileSync('src/components/MissingLinkGame.tsx', c);
console.log('Fixed syntax error!');