const fs = require('fs');

const extendedQuestionsBatch2 = `,
  { letter: 'ش', category: 'اسم', answers: ['شادية', 'شادي', 'شام', 'شهاب', 'شوقي', 'شيرين', 'شفيقة', 'شمس'] },
  { letter: 'م', category: 'اسم', answers: ['محمد', 'محمود', 'مصطفى', 'مريم', 'مروة', 'ماجد', 'منى', 'منال', 'ملاك', 'مالك', 'مراد', 'مازن'] },
  { letter: 'ع', category: 'اسم', answers: ['علي', 'عمر', 'عثمان', 'عادل', 'عماد', 'عيسى', 'عبير', 'عائشة', 'عفاف', 'عطيات'] },
  { letter: 'س', category: 'اسم', answers: ['سعيد', 'سعد', 'سالم', 'سامي', 'سليمان', 'سعاد', 'سلوى', 'سارة', 'سميرة', 'سحر'] },
  { letter: 'أ', category: 'نبات', answers: ['ارز', 'اناناس', 'افوكادو', 'اصف', 'أرز', 'أناناس', 'أفوكادو'] },
  { letter: 'ص', category: 'نبات', answers: ['صبار', 'صنوبر', 'صويا'] },
  { letter: 'ض', category: 'حيوان', answers: ['ضفدع', 'ضبع', 'ضب'] },
  { letter: 'ض', category: 'جماد', answers: ['ضوء', 'ضرس', 'ضفيرة', 'ضمادة'] },
  { letter: 'غ', category: 'جماد', answers: ['غسالة', 'غرفة', 'غراء', 'غلاف', 'غواصة', 'غطاء'] },
  { letter: 'ث', category: 'حيوان', answers: ['ثعلب', 'ثعبان', 'ثور'] },
  { letter: 'ث', category: 'جماد', answers: ['ثلاجة', 'ثوب', 'ثريا', 'ثقب'] },
  { letter: 'خ', category: 'حيوان', answers: ['خروف', 'خنزير', 'خفاش', 'خنفساء', 'خرتيت'] },
  { letter: 'خ', category: 'جماد', answers: ['خزانة', 'خاتم', 'خيمة', 'خيط', 'خريطة', 'خشب', 'خنجر'] },
  { letter: 'هـ', category: 'حيوان', answers: ['هدهد', 'هامستر', 'هرة'] },
  { letter: 'هـ', category: 'دولة/مدينة', answers: ['هند', 'هولندا', 'هونغ كونغ', 'هاواي', 'هونولولو'] },
  { letter: 'هـ', category: 'جماد', answers: ['هاتف', 'هرم', 'هليكوبتر', 'هدية', 'هيكل'] },
  { letter: 'ي', category: 'حيوان', answers: ['يمامة', 'يعسوب', 'يربوع', 'يسروع'] },
  { letter: 'م', category: 'نبات', answers: ['موز', 'مانجو', 'مشمش', 'ملفوف', 'ميرمية', 'ملوخية', 'مكاديميا'] },
  { letter: 'ح', category: 'نبات', answers: ['حمص', 'حلبة', 'حنطة', 'حبق', 'حبة البركة', 'حناء'] },
  { letter: 'ج', category: 'نبات', answers: ['جزر', 'جوز', 'جوافة', 'جرجير', 'جلجلان', 'جت'] },
  { letter: 'ف', category: 'دولة/مدينة', answers: ['فرنسا', 'فلسطين', 'فلبين', 'فنلندا', 'فنزويلا', 'فيتنام'] },
  { letter: 'ل', category: 'دولة/مدينة', answers: ['لبنان', 'ليبيا', 'ليبيريا', 'لاتفيا', 'لوكسمبورغ', 'ليتوانيا'] },
  { letter: 'ت', category: 'دولة/مدينة', answers: ['تونس', 'تركيا', 'تشاد', 'تنزانيا', 'تاجيكستان', 'تايلاند', 'تايوان'] },
  { letter: 'ك', category: 'دولة/مدينة', answers: ['كويت', 'كندا', 'كوريا', 'كرواتيا', 'كينيا', 'كولومبيا', 'كوبا', 'كازاخستان'] },
  { letter: 'د', category: 'دولة/مدينة', answers: ['دنمارك', 'دومينيكان'] },
  { letter: 'ط', category: 'دولة/مدينة', answers: ['طوكيو', 'طهران', 'طنجة', 'طرابلس', 'طشقند', 'طابا'] }
];`;

const content = fs.readFileSync('src/components/ScattergoriesGame.tsx', 'utf-8');
const exactMatch = `  { letter: 'ش', category: 'حيوان', answers: ['شبل', 'شامبانزي', 'شيهم', 'شاهين'] },
]`;

if (content.includes(exactMatch)) {
    const updated = content.replace(exactMatch, `  { letter: 'ش', category: 'حيوان', answers: ['شبل', 'شامبانزي', 'شيهم', 'شاهين'] }${extendedQuestionsBatch2}`);
    fs.writeFileSync('src/components/ScattergoriesGame.tsx', updated, 'utf-8');
    console.log('Successfully expanded QUESTIONS array Phase 2.');
} else {
    // If the exact match fails due to styling or indentation
    const split = content.split(`  { letter: 'ش', category: 'حيوان', answers: ['شبل', 'شامبانزي', 'شيهم', 'شاهين'] },`);
    if (split.length === 2) {
       const updated = split[0] + `  { letter: 'ش', category: 'حيوان', answers: ['شبل', 'شامبانزي', 'شيهم', 'شاهين'] }${extendedQuestionsBatch2}\n` + split[1].substring(split[1].indexOf(';'));
       fs.writeFileSync('src/components/ScattergoriesGame.tsx', updated, 'utf-8');
       console.log('Successfully expanded QUESTIONS array Phase 2 fallback.');
    } else {
       console.log('Failed to identify match.');
    }
}
