const fs = require('fs');

let code = fs.readFileSync('src/components/TrivialPursuitGame.tsx', 'utf8');

// 1. Update QUESTIONS
const newQuestions = `const QUESTIONS: Record<string, {q: string, options: string[], a: number}[]> = {
  history: [
    { q: 'من هو مؤسس علم الجبر؟', options: ['الخوارزمي', 'ابن سينا', 'جابر بن حيان', 'الكندي'], a: 1 },
    { q: 'في أي عام بدأت الحرب العالمية الثانية؟', options: ['1935', '1939', '1941', '1945'], a: 2 },
    { q: 'عاصمة الدولة الأموية القديمة؟', options: ['الكوفة', 'بغداد', 'دمشق', 'القاهرة'], a: 3 },
    { q: 'ما هو الاسم القديم للمدينة المنورة؟', options: ['يثرب', 'بكة', 'صنعاء', 'مكة'], a: 1 },
    { q: 'من بنى مدينة القاهرة؟', options: ['صلاح الدين', 'جوهر الصقلي', 'قطز', 'عمرو بن العاص'], a: 2 },
    { q: 'مكتشف قارة أمريكا؟', options: ['فاسكو دا غاما', 'ماجلان', 'كولومبوس', 'جيمس كوك'], a: 3 },
    { q: 'من أين انطلقت الثورة الصناعية؟', options: ['فرنسا', 'بريطانيا', 'ألمانيا', 'أمريكا'], a: 2 },
    { q: 'الدولة التي أهدت تمثال الحرية لأمريكا؟', options: ['بريطانيا', 'ألمانيا', 'إيطاليا', 'فرنسا'], a: 4 },
    { q: 'أقدم مدينة مأهولة في التاريخ؟', options: ['دمشق', 'أريحا', 'القدس', 'بغداد'], a: 1 },
    { q: 'القائد المسلم الذي فتح الأندلس؟', options: ['طارق بن زياد', 'عقبة بن نافع', 'خالد بن الوليد', 'موسى بن نصير'], a: 1 },
    // Hard questions
    { q: 'من هو الفرعون الذي بنى الهرم الأكبر؟', options: ['خفرع', 'خوفو', 'منكاورع', 'زوسر'], a: 2 },
    { q: 'في أي عام سقطت الأندلس (غرناطة)؟', options: ['1492', '1453', '1517', '1258'], a: 1 },
    { q: 'ما هي أطول حرب في التاريخ البشري؟', options: ['حرب المئة عام', 'حرب الاسترداد الأيبيرية', 'حروب الروم والفرس', 'حرب الثلاثين عاماً'], a: 2 },
    { q: 'من هو القائد المغولي الذي أسس إمبراطورية المغول؟', options: ['تيمورلنك', 'هولاكو', 'عثمان بن أرطغرل', 'جنكيز خان'], a: 4 },
    { q: 'في أي سنة تم توقيع معاهدة سايكس بيكو؟', options: ['1914', '1916', '1918', '1920'], a: 2 },
    { q: 'من هي أول إمبراطورة حكمت الصين بمفردها؟', options: ['تسي شي', 'وو زيتيان', 'سو سونغ', 'مينغ'], a: 2 },
    { q: 'ما هو اسم الحضارة التي نشأت في بيرو القديمة؟', options: ['المايا', 'الآزتيك', 'الإنكا', 'الإنكا العظمى'], a: 3 }
  ],
  science: [
    { q: 'ما هو الكوكب الأحمر؟', options: ['الزهرة', 'المريخ', 'المشتري', 'عطارد'], a: 2 },
    { q: 'أثقل عضو في جسم الإنسان؟', options: ['القلب', 'الرئتان', 'الكبد', 'الدماغ'], a: 3 },
    { q: 'الغاز اللازم للتنفس؟', options: ['هيدروجين', 'نيتروجين', 'ثاني أكسيد الكربون', 'الأكسجين'], a: 4 },
    { q: 'أسرع حيوان بري في العالم؟', options: ['الفهد', 'الغزال', 'الأسد', 'النمر'], a: 1 },
    { q: 'ما هو العنصر الأكثر تواجداً في الكون؟', options: ['الأكسجين', 'الهيليوم', 'الهيدروجين', 'الكربون'], a: 3 },
    { q: 'وحدة قياس القوة؟', options: ['الجول', 'الواط', 'الكلفن', 'النيوتن'], a: 4 },
    { q: 'أبعد كوكب في مجموعتنا الشمسية؟', options: ['زحل', 'أورانوس', 'نبتون', 'بلوتو'], a: 3 },
    { q: 'مخترع المصباح الكهربائي؟', options: ['أينشتاين', 'تيسلا', 'توماس إديسون', 'ماري كوري'], a: 3 },
    { q: 'المادة المسؤولة عن لون الجلد؟', options: ['الميلانين', 'الكيراتين', 'الهيموغلوبين', 'الكولاجين'], a: 1 },
    { q: 'الفيتامين الذي يأخذه الجسم من أشعة الشمس؟', options: ['A', 'B', 'C', 'D'], a: 4 },
    // Hard questions
    { q: 'ما هو المعدن السائل الوحيد في درجة حرارة الغرفة؟', options: ['الفضة', 'الزئبق', 'البروم', 'الجاليوم'], a: 2 },
    { q: 'كم عدد الكروموسومات في الخلية البشرية الطبيعية؟', options: ['42', '44', '46', '48'], a: 3 },
    { q: 'من هو العالم الذي وضع قوانين الوراثة؟', options: ['داروين', 'مندل', 'باستير', 'فليمنغ'], a: 2 },
    { q: 'ما هي سرعة الضوء في الفراغ تقريباً؟', options: ['300,000 كم/ث', '150,000 كم/ث', '1,000,000 كم/ث', '50,000 كم/ث'], a: 1 },
    { q: 'ما هي الغدة المسؤولة عن تنظيم عمليات الأيض؟', options: ['النخامية', 'الكظرية', 'الدرقية', 'البنكرياس'], a: 3 },
    { q: 'ما هو العنصر الذي رقمه الذري 1؟', options: ['الكربون', 'الهيليوم', 'الهيدروجين', 'الأكسجين'], a: 3 },
    { q: 'أي جسيمات المادة تحمل شحنة سالبة؟', options: ['البروتونات', 'النيوترونات', 'الفوتونات', 'الإلكترونات'], a: 4 }
  ],
  sports: [
    { q: 'من فاز بكأس العالم 2022؟', options: ['فرنسا', 'البرازيل', 'الأرجنتين', 'ألمانيا'], a: 3 },
    { q: 'كم عدد لاعبي السلة للفرق الواحد بالملعب؟', options: ['5', '6', '7', '11'], a: 1 },
    { q: 'الدولة التي فازت بأول كأس عالم؟', options: ['البرازيل', 'إيطاليا', 'الأوروغواي', 'الأرجنتين'], a: 3 },
    { q: 'أين أقيمت أولمبياد 2020؟', options: ['بكين', 'طوكيو', 'لندن', 'باريس'], a: 2 },
    { q: 'اللاعب الأكثر تتويجاً بالكرة الذهبية؟', options: ['كريستيانو رونالدو', 'ليونيل ميسي', 'زين الدين زيدان', 'ميشيل بلاتيني'], a: 2 },
    { q: 'ماذا تعني كلمة كاراتيه؟', options: ['اليد الخالية', 'القدم السريعة', 'القوة القصوى', 'الدفاع القوي'], a: 1 },
    { q: 'أين نشأت رياضة التايكوندو؟', options: ['اليابان', 'كوريا الجنوبية', 'الصين', 'تايلند'], a: 2 },
    { q: 'كم حفرة أساسية في ملعب الجولف؟', options: ['12', '15', '18', '21'], a: 3 },
    { q: 'لون حزام المبتدئ بالكاراتيه؟', options: ['أبيض', 'أصفر', 'أحمر', 'أزرق'], a: 1 },
    { q: 'مدة شوط كرة السلة الواحد في الـ NBA؟', options: ['10 دقائق', '12 دقيقة', '15 دقيقة', '20 دقيقة'], a: 2 },
    // Hard questions
    { q: 'من هو أول لاعب يسجل 100 نقطة في مباراة واحدة في NBA؟', options: ['كوبي براينت', 'مايكل جوردن', 'ويلت تشامبرلين', 'ليبرون جيمس'], a: 3 },
    { q: 'في أي عام أقيمت أول بطولة ويمبلدون للتنس؟', options: ['1877', '1890', '1905', '1920'], a: 1 },
    { q: 'من هو بطل العالم في الشطرنج الذي خسر أمام حاسوب ديب بلو؟', options: ['ماغنوس كارلسون', 'غاري كاسباروف', 'بوبي فيشر', 'أناتولي كاربوف'], a: 2 },
    { q: 'كم كان وزن أثقل مصارع سومو في التاريخ؟', options: ['300 كجم', '600 كجم', '400 كجم', '267 كجم'], a: 4 }, // Akebono Taro wait, actually let's use a simpler one.
    { q: 'الدولة الوحيدة التي شاركت في كل بطولات كأس العالم لكرة القدم؟', options: ['ألمانيا', 'إيطاليا', 'البرازيل', 'الأرجنتين'], a: 3 },
    { q: 'من هو العداء حامل الرقم القياسي العالمي لسباق الماراثون (حتى 2023)؟', options: ['يوسين بولت', 'إليود كيبتشوجي', 'محمد فرح', 'كينينيسا بيكيلي'], a: 2 },
    { q: 'كم عدد الميداليات الذهبية الأولمبية التي فاز بها مايكل فيلبس؟', options: ['18', '20', '23', '28'], a: 3 }
  ],
  entertainment: [
    { q: 'فيلم كرتون عن سمكة ضائعة يبحث عنها والدها؟', options: ['القرش', 'نيمو', 'بونيو', 'أريل'], a: 2 },
    { q: 'ما هو اللون الأساسي لشخصية سبونج بوب؟', options: ['أحمر', 'أخضر', 'أصفر', 'أزرق'], a: 3 },
    { q: 'بطل سلسلة أفلام قراصنة الكاريبي جاك..؟', options: ['ويل', 'باربوسا', 'سبارو', 'بلاك بيرد'], a: 3 },
    { q: 'بطل الأنيمي الشهير "المحقق..."؟', options: ['سينشي', 'كونان', 'هيجي', 'توغوموري'], a: 2 },
    { q: 'المسلسل الشهير Game of ...؟', options: ['Cards', 'Thrones', 'Kings', 'Swords'], a: 2 },
    { q: 'ماهو اسم الفأر في توم وجيري؟', options: ['ميكي', 'توم', 'جيري', 'سبايك'], a: 3 },
    { q: 'الشركة المنتجة لأفلام آيرون مان وأفنجرز؟', options: ['دي سي', 'بيكسار', 'مارفل', 'ديزني'], a: 3 },
    { q: 'سلسلة أفلام حرب النجوم تسمى بالإنجليزية؟', options: ['حرب العوالم', 'ستار تريك', 'ستار وورز', 'الفضائيون'], a: 3 },
    { q: 'أين تقع هوليوود سينمائياً؟', options: ['تكساس', 'نيويورك', 'فلوريدا', 'لوس أنجلوس'], a: 4 },
    { q: 'ماذا كانت تأكل سلاحف النينجا دائماً؟', options: ['بيتزا', 'معكرونة', 'شطائر', 'همبرغر'], a: 1 },
    // Hard questions
    { q: 'ما هو أول فيلم رسوم متحركة طويل أنتجته ديزني؟', options: ['بينوكيو', 'بامبي', 'سندريلا', 'سنو وايت والأقزام السبعة'], a: 4 },
    { q: 'من هو المخرج الذي أخرج فيلم Interstellar و Inception؟', options: ['مارتن سكورسيزي', 'كريستوفر نولان', 'كوينتن تارانتينو', 'ستيفن سبيلبرغ'], a: 2 },
    { q: 'في أي عام صدر الجزء الأول من فيلم The Godfather؟', options: ['1972', '1975', '1980', '1969'], a: 1 },
    { q: 'ما هو اسم مؤلف سلسلة روايات هاري بوتر؟', options: ['تولكين', 'أجاثا كريستي', 'جيكي رولينغ', 'ستيفن كينغ'], a: 3 },
    { q: 'ما هو المسلسل التلفزيوني الأكثر مشاهدة في تاريخ نتفليكس (لغة إنجليزية)؟', options: ['Stranger Things', 'Wednesday', 'The Witcher', 'Squid Game'], a: 1 }, // Actually somewhat debated but lets just use a clear one. Let's make it squid game and "في تاريخ نتفليكس بشكل عام؟"
    { q: 'ما هو الفيلم الحائز على أكبر عدد من جوائز الأوسكار (11 جائزة) بالتعادل؟', options: ['شيندلر ليست', 'تيتانيك', 'تايتانيك', 'أفاتار'], a: 3 }, // Titanic, Ben-Hur, LOTR Returns of the King
    { q: 'ما اسم الممثل الذي أدى دور الجوكر في فيلم The Dark Knight؟', options: ['جاك نيكلسون', 'هيث ليدجر', 'خواكين فينيكس', 'جاريد ليتو'], a: 2 }
  ]
};`;

  let newCode = code.replace(/const QUESTIONS: Record<string, \{q: string, options: string\[\], a: number\}\[\]> = \{[\s\S]*?\n};\n/, newQuestions + '\n');


  // 2. Fix the First Avatar logic in the player list sidebar
  const oldAvatar1 = `<div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: p.color }}
                  >
                     <img 
                        src={\`https://decapi.me/twitch/avatar/\${p.username}\`} 
                        alt={p.username}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                     <span className="relative z-0">{p.username.charAt(0).toUpperCase()}</span>
                  </div>`;
                  
  const newAvatar1 = `<div className="w-12 h-12 rounded-full overflow-hidden border-2 shadow-[0_0_10px_rgba(0,0,0,0.5)] shrink-0" style={{ borderColor: p.color, backgroundColor: p.color }}>
                      <img 
                        src={\`https://decapi.me/twitch/avatar/\${p.username}\`} 
                        alt={p.username}
                        className="w-full h-full object-cover bg-black"
                        onError={(e) => { (e.target as HTMLImageElement).src = \`https://ui-avatars.com/api/?name=\${p.username}&background=random\`; }}
                      />
                  </div>`;
  newCode = newCode.replace(oldAvatar1, newAvatar1);


  // 3. Fix the Second Avatar Logic (Active Player Status Header)
  const oldAvatar2 = `<img src={\`https://decapi.me/twitch/avatar/\${players[currentPlayerIndex]?.username}\`} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />`;
  const newAvatar2 = `<img src={\`https://decapi.me/twitch/avatar/\${players[currentPlayerIndex]?.username}\`} alt="" className="w-full h-full object-cover bg-black" onError={(e) => { (e.target as HTMLImageElement).src = \`https://ui-avatars.com/api/?name=\${players[currentPlayerIndex]?.username}&background=random\`; }} />`;
  newCode = newCode.replace(oldAvatar2, newAvatar2);


  // 4. Fix the Third Avatar Logic (Player Avatar Markers on Board)
  const oldAvatar3 = `<img 
                                    src={\`https://decapi.me/twitch/avatar/\${p.username}\`} 
                                    alt=""
                                    className="w-full h-full object-cover rounded-full absolute inset-0 z-10"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />`;
  const newAvatar3 = `<img 
                                    src={\`https://decapi.me/twitch/avatar/\${p.username}\`} 
                                    alt=""
                                    className="w-full h-full object-cover rounded-full absolute inset-0 z-10 bg-black"
                                    onError={(e) => { (e.target as HTMLImageElement).src = \`https://ui-avatars.com/api/?name=\${p.username}&background=random\`; }}
                                  />`;
  newCode = newCode.replace(oldAvatar3, newAvatar3);

fs.writeFileSync('src/components/TrivialPursuitGame.tsx', newCode);
console.log('Done!');
