const fs = require('fs');
let file = 'src/components/TrivialPursuitGame.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const handleAnswerResult = \(status: 'correct' \| 'wrong' \| 'timeout', selected\?: number\) => \{/,
  `const handleAnswerResult = (status: 'correct' | 'wrong' | 'timeout' | 'skipped', selected?: number) => {`
);

content = content.replace(
  /\{resultInfo\.status === 'correct' \? \([\s\S]*?\) : \([\s\S]*?\{resultInfo\.status === 'timeout' \? \([\s\S]*?\) : \([\s\S]*?\) \? 'Ø§Ù†ØªÙ‡Ù‰ Ø§Ù„ÙˆÙ‚Øª!' : 'Ø¥Ø¬Ø§Ø¨Ø©\\nØ®Ø§Ø·Ø¦Ø©!'\}\n\s*<\/h3>\n\s*<p className="text-xl text-red-300 mb-8">ÙØ±ØµØ© Ø³Ø¹ÙŠØ¯Ø© ÙÙŠ Ø§Ù„Ø¯ÙˆØ±\\nØ§Ù„Ù‚Ø§Ø¯Ù…!<\/p>/,
  `{resultInfo.status === 'correct' ? (
                                  <>
                                    <CheckCircle2 className="w-32 h-32 text-green-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                                    <h3 className="text-5xl font-bold text-white mb-4">إجابة صحيحة!</h3>
                                    <p className="text-2xl text-green-300">لقد حصلت على ميدالية التصنيف!</p>
                                  </>
                                ) : resultInfo.status === 'skipped' ? (
                                  <>
                                    <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-zinc-800 border-4 border-zinc-500 flex items-center justify-center opacity-80">
                                      <XCircle className="w-16 h-16 text-zinc-400" />
                                    </div>
                                    <h3 className="text-5xl font-bold text-white mb-4">تجاوز!</h3>
                                    <p className="text-2xl text-zinc-400 mb-8">لديك هذه الميدالية بالفعل!</p>
                                  </>
                                ) : (
                                  <>
                                    {resultInfo.status === 'timeout' ? (
                                       <Timer className="w-32 h-32 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                    ) : (
                                       <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                    )}

                                    <h3 className="text-5xl font-bold text-white mb-4">
                                      {resultInfo.status === 'timeout' ? 'انتهى الوقت!' : 'إجابة خاطئة!'}
                                    </h3>
                                    <p className="text-xl text-red-300 mb-8">فرصة سعيدة في الدور القادم!</p>
                                  `
);

fs.writeFileSync(file, content);
console.log('patched handleAnswerResult + UI');
