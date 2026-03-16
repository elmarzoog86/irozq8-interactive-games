const fs = require('fs');

const file = 'src/components/MissingLinkGame.tsx';
let content = fs.readFileSync(file, 'utf8');

// Using emojis mapping for matching text to be rendered as an icon!
const emojiMap = {
  'تفاح': '🍎',
  'برتقال': '🍊',
  'موز': '🍌',
  'تويتر': '🐦',
  'يوتيوب': '▶️',
  'انستغرام': '📸',
  'دولار': '💵',
  'يورو': '💶',
  'بتكوين': '🪙',
  'لندن': '🎡',
  'باريس': '🗼',
  'طوكيو': '🗻',
  'برجر': '🍔',
  'بطاطس': '🍟',
  'بيتزا': '🍕',
  'المريخ': '🪐',
  'القمر': '🌙',
  'الارض': '🌍',
  'سیارة': '🚗',
  'سيارة': '🚗',
  'دراجة': '🚲',
  'قطار': '🚂',
  'قطة': '🐱',
  'كلب': '🐶',
  'ارنب': '🐰',
  'أرنب': '🐰',
  'كرة قدم': '⚽',
  'سلة': '🏀',
  'تنس': '🎾',
  'قميص': '👕',
  'بنطال': '👖',
  'حذاء': '👞',
  'قهوة': '☕',
  'شاي': '🍵',
  'عصير': '🥤',
  'قلم': '✏️',
  'دفتر': '📓',
  'شنطة': '🎒',
  'احمر': '🔴',
  'ازرق': '🔵',
  'اخضر': '🟢',
  'نسر': '🦅',
  'ببغاء': '🦜',
  'حمامة': '🕊️',
  'ثلاجة': '🧊',
  'غسالة': '🧺',
  'تلفاز': '📺',
  'نملة': '🐜',
  'نحلة': '🐝',
  'فراشة': '🦋',
  'عين': '👁️',
  'قلب': '❤️',
  'يد': '✋',
  'سيف': '⚔️',
  'بندقية': '🔫',
  'قنبلة': '💣',
  'عود': '🪕',
  'بيانو': '🎹',
  'جيتار': '🎸',
  'طبيب': '👨‍⚕️',
  'معلم': '👨‍🏫',
  'مهندس': '👷',
  'ماينكرافت': '🧱',
  'فيفا': '⚽',
  'فورتنايت': '🪂',
  'صباح': '🌅',
  'مساء': '🌇',
  'ليل': '🌃',
  'البحر الاحمر': '🌊',
  'البحر المتوسط': '⛵',
  'المحيط الاطلسي': '🐋',
  'الاهرامات': '🔺',
  'سور الصين': '🧱',
  'ساعة بيغ بن': '🕰️',
  'لوز': '🥜',
  'فستق': '🌰',
  'كاجو': '🥜',
  'انجليزي': '🇬🇧',
  'عربي': '🇸🇦',
  'فرنسي': '🇫🇷',
  'ملعقة': '🥄',
  'شوكة': '🍴',
  'سكين': '🔪',
  'نخلة': '🌴',
  'شجرة تفاح': '🍎',
  'صبار': '🌵',
  'فرح': '😄',
  'حزن': '😢',
  'غضب': '😡',
  'أحمر': '🔴',
  'أزرق': '🔵',
  'أخضر': '🟢',
  'أسد': '🦁',
  'فيل': '🐘',
  'زرافة': '🦒',
  'كرة سلة': '🏀',
  'المشتري': '🪐',
  'الأرض': '🌍',
  'أذن': '👂',
  'أنف': '👃',
  'تويوتا': '🚙',
  'انفنتي': '🏎️',
  'نيسان': '🚗',
  'بنطلون': '👖',
  'ممحاة': '🧽',
  'ذهب': '🥇',
  'فضة': '🥈',
  'حديد': '⛓️',
  'سرير': '🛏️',
  'طاولة': '🪑',
  'كرسي': '🪑',
  'شتاء': '❄️',
  'صيف': '☀️',
  'ربيع': '🌸',
  'صقر': '🦅',
  'طائرة': '✈️',
  'سفينة': '🚢',
  'ياسمين': '🌼',
  'جوري': '🌹',
  'توليب': '🌷',
  'عربية': '🇸🇦',
  'إنجليزية': '🇬🇧',
  'فرنسية': '🇫🇷'
};

content = content.replace(/\{ text: '([^']+)', image: '([^']+)' \}/g, (match, text, img) => {
  if (emojiMap[text]) {
    return `{ text: '${text}', image: '${emojiMap[text]}' }`;
  }
  return `{ text: '${text}', image: '❓' }`; // fallback to ensure clean emoji instead of broken link
});

// Update the image rendering component logic
const imgPattern = /<img\s+src=\{item\.image\}\s+alt=\{item\.text\}\s+className="w-full h-full object-cover"\s+onError=\{\(e\)\s*=>\s*\{\s*\(e\.target\s*as\s*HTMLImageElement\)\.style\.display\s*=\s*'none';\s*\(e\.target\s*as\s*HTMLImageElement\)\.parentElement!\.innerHTML\s*=\s*'<span[^>]+>⚠<\/span>';\s*\}\}\s*\/>/m;

const newRenderer = `{item.image.startsWith('http') ? (
                            <img
                              src={item.image}
                              alt={item.text}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl text-white">⚠</span>';
                              }}
                            />
                          ) : (
                            <span className="text-[100px] leading-none select-none drop-shadow-2xl">{item.image}</span>
                          )}`;

content = content.replace(imgPattern, newRenderer);

fs.writeFileSync(file, content);
console.log('Successfully remapped all items in MissingLinkGame.tsx to modern Emojis!');
