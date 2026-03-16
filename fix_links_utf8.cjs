const fs = require('fs');

const emojiMap = {
"احمر": "🔴",
"أحمر": "🔴",
"اخضر": "🟢",
"أخضر": "🟢",
"أذن": "👂",
"ارنب": "🐰",
"ازرق": "🔵",
"أزرق": "🔵",
"أسد": "🦁",
"الارض": "🌍",
"الأرض": "🌍",
"الاهرامات": "🔺",
"البحر الاحمر": "🌊",
"البحر المتوسط": "⛵",
"القمر": "🌕",
"المحيط الاطلسي": "🐋",
"المريخ": "🪐",
"المشتري": "🪐",
"انجليزي": "🇬🇧",
"إنجليزية": "🇬🇧",
"انستغرام": "📷",
"أنف": "👃",
"انفنتي": "♾️",
"باريس": "🗼",
"ببغاء": "🦜",
"بتكوين": "🪙",
"برتقال": "🍊",
"برجر": "🍔",
"بطاطس": "🍟",
"بندقية": "🔫",
"بنطال": "👖",
"بنطلون": "👖",
"بيانو": "🎹",
"بيتزا": "🍕",
"تفاح": "🍎",
"تلفاز": "📺",
"تنس": "🎾",
"توليب": "🌷",
"تويتر": "🐦",
"تويوتا": "🚙",
"ثلاجة": "🧊",
"جوري": "🌹",
"جيتار": "🎸",
"حديد": "⚓",
"حذاء": "👞",
"حزن": "😢",
"حمامة": "🕊️",
"دراجة": "🚲",
"دفتر": "📓",
"دولار": "💵",
"ذهب": "🥇",
"ربيع": "🌸",
"زرافة": "🦒",
"ساعة بيغ بن": "🕐",
"سرير": "🛌",
"سفينة": "🚢",
"سكين": "🔪",
"سلة": "🧺",
"سور الصين": "🧱",
"سيارة": "🚗",
"سيف": "🗡️",
"شاي": "🍵",
"شتاء": "❄️",
"شجرة تفاح": "🌳",
"شنطة": "🎒",
"شوكة": "🍴",
"صباح": "🌅",
"صبار": "🌵",
"صقر": "🦅",
"صيف": "☀️",
"طاولة": "🪑",
"طائرة": "✈️",
"طبيب": "👨‍⚕️",
"طوكيو": "🗻",
"عربي": "🇸🇦",
"عربية": "🇸🇦",
"عصير": "🧃",
"عود": "🪵",
"عين": "👁️",
"غسالة": "🧺",
"غضب": "😠",
"فраشة": "🦋",
"فرح": "😊",
"فرنسي": "🇫🇷",
"فرنسية": "🇫🇷",
"فستق": "🥜",
"فضة": "🥈",
"فورتنايت": "🎮",
"فيفا": "⚽",
"فيل": "🐘",
"قطار": "🚆",
"قطة": "🐱",
"قلب": "❤️",
"قلم": "✏️",
"قميص": "👕",
"قنبلة": "💣",
"قهوة": "☕",
"كاجو": "🥜",
"كرة سلة": "🏀",
"كرة قدم": "⚽",
"كرسي": "🪑",
"كلب": "🐶",
"لندن": "🎡",
"لوز": "🥜",
"ليل": "🌃",
"ماينكرافت": "🧱",
"مساء": "🌇",
"معلم": "👨‍🏫",
"ملعقة": "🥄",
"ممحاة": "🧹",
"مهندس": "👷",
"موز": "🍌",
"نحلة": "🐝",
"نخلة": "🌴",
"نسر": "🦅",
"نملة": "🐜",
"نيسان": "🚘",
"ياسمين": "🌼",
"يد": "✋",
"يوتيوب": "▶️",
"يورو": "💶"
};

let file = 'src/components/MissingLinkGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard image object literal
content = content.replace(/\{ text: '([^']+)', image: '([^']+)' \}/g, (match, text, img) => {
    let emoji = emojiMap[text] || '❓';
    return `{ text: '${text}', image: '${emoji}' }`;
});

// Update the renderer to support emoji strings
let imgRenderMatch = /<img\s+src=\{item\.image\}\s+alt=\{item\.text\}\s+className="w-[^>]+>/;

if (imgRenderMatch.test(content)) {
    content = content.replace(imgRenderMatch, `{item.image.length <= 2 ? (
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
}

fs.writeFileSync(file, content, 'utf8');
console.log('Done mapping emojis & fixing link logic.');