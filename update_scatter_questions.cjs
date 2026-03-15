const fs = require('fs');

const extendedQuestions = `[
  { letter: 'م', category: 'حيوان', answers: ['ماعز', 'مها', 'ميمون', 'مدرع', 'محار', 'مكاك', 'ماموث'] },
  { letter: 'ب', category: 'خضار/فواكه', answers: ['بطيخ', 'برتقال', 'بصل', 'باذنجان', 'بقدونس', 'باميا', 'بازلاء', 'بنجر', 'برقوق', 'بوملي'] },
  { letter: 'س', category: 'دولة', answers: ['سوريا', 'سعودية', 'سويسرا', 'سريلانكا', 'سنغافورة', 'سودان', 'سويد', 'سنغال', 'سلوفاكيا', 'سلوفينيا'] },
  { letter: 'ك', category: 'جماد', answers: ['كرسي', 'كتاب', 'كأس', 'كوب', 'كراسة', 'كيس', 'كفر', 'كنبة', 'كابل', 'كمبيوتر', 'كيبورد', 'كاميرا', 'كشاف'] },
  { letter: 'ف', category: 'حيوان', answers: ['فيل', 'فأر', 'فهد', 'فقمة', 'فلامنجو', 'فراشة', 'فرس النهر'] },
  { letter: 'م', category: 'دولة', answers: ['مصر', 'مغرب', 'موريتانيا', 'ماليزيا', 'مالي', 'مكسيك', 'موزمبيق', 'مقدونيا', 'مدغشقر'] },
  { letter: 'ت', category: 'خضار/فواكه', answers: ['تفاح', 'توت', 'تين', 'تمر', 'تمر هندي', 'ترنج'] },
  { letter: 'ن', category: 'حيوان', answers: ['نمر', 'نسر', 'نورس', 'نحلة', 'نملة', 'نعامة', 'ناقة', 'نيص'] },
  { letter: 'ع', category: 'دولة', answers: ['عراق', 'عمان', 'عربية'] },
  { letter: 'د', category: 'حيوان', answers: ['دب', 'دجاجة', 'ديك', 'دولفين', 'دودة', 'ديناصور', 'دبور'] },
  { letter: 'أ', category: 'دولة', answers: ['المانيا', 'امريكا', 'ارجنتين', 'اسبانيا', 'ايطاليا', 'اردن', 'امارات', 'استراليا', 'اوروجواي', 'اكوادور', 'ألمانيا', 'أمريكا', 'أرجنتين', 'إسبانيا', 'إيطاليا', 'أردن', 'إمارات', 'أستراليا'] },
  { letter: 'ط', category: 'جماد', answers: ['طاولة', 'طائرة', 'طبق', 'طنجرة', 'طوق', 'طاقية', 'طبلة', 'طلاء'] },
  { letter: 'ق', category: 'حيوان', answers: ['قرد', 'قط', 'قطة', 'قنديل', 'قرش', 'قنفذ', 'قملة', 'قندس'] },
  { letter: 'ر', category: 'خضار/فواكه', answers: ['رمان', 'رامبوتان', 'رطب', 'ريحان'] },
  { letter: 'ح', category: 'حيوان', answers: ['حصان', 'حمار', 'حمامة', 'حوت', 'حلزون', 'حية', 'حرباء'] },
  { letter: 'ن', category: 'دولة', answers: ['نرويج', 'نيجر', 'نيجيريا', 'نمسا', 'نيبال', 'نيوزيلندا'] },
  { letter: 'خ', category: 'خضار/فواكه', answers: ['خس', 'خيار', 'خوخ', 'خرشوف', 'خردل'] },
  { letter: 'غ', category: 'حيوان', answers: ['غزال', 'غوريلا', 'غراب', 'غنم', 'غرير'] },
  { letter: 'ل', category: 'جماد', answers: ['لمبة', 'لوحة', 'لعبة', 'ليموزين', 'لسان', 'ليفة'] },
  { letter: 'ج', category: 'حيوان', answers: ['جمل', 'جاموس', 'جرذ', 'جندب', 'جرو', 'جمبري'] },
  { letter: 'ج', category: 'جماد', answers: ['جرس', 'جدار', 'جبل', 'جسر', 'جوال', 'جراب', 'جرة'] },
  { letter: 'ع', category: 'خضار/فواكه', answers: ['عنب', 'عدس', 'عليق', 'عنبر'] },
  { letter: 'ب', category: 'حيوان', answers: ['بقرة', 'بطة', 'بومة', 'ببر', 'بجعة', 'بطريق', 'بغل', 'برغوث'] },
  { letter: 'ف', category: 'خضار/فواكه', answers: ['فراولة', 'فجل', 'فاصوليا', 'فلفل', 'فستق', 'فول'] },
  { letter: 'ك', category: 'حيوان', answers: ['كلب', 'كنغر', 'كوالا', 'كتكوت', 'كركدن'] },
  { letter: 'ش', category: 'جماد', answers: ['شباك', 'شجرة', 'شمسية', 'شاحنة', 'شاشة', 'شوكة', 'شمعة'] },
  { letter: 'ص', category: 'حيوان', answers: ['صقر', 'صرصور', 'صيصان', 'صدفه'] },
  { letter: 'ص', category: 'جماد', answers: ['صاروخ', 'صورة', 'صابون', 'صندوق', 'صينية', 'صخرة'] },
  { letter: 'ت', category: 'حيوان', answers: ['تمساح', 'تيس', 'تنين', 'تونة'] },
  { letter: 'ز', category: 'دولة/مدينة', answers: ['زيمبابوي', 'زامبيا', 'زغرب', 'زيورخ'] },
  { letter: 'ز', category: 'حيوان', answers: ['زرافة', 'زرزور', 'زنبور'] },
  { letter: 'ز', category: 'جماد', answers: ['زجاج', 'زلاجة', 'زر', 'زريبة', 'زهرية', 'زمرد'] },
  { letter: 'ي', category: 'دولة/مدينة', answers: ['يمن', 'يابان', 'يونان', 'يوغسلافيا'] },
  { letter: 'ب', category: 'دولة/مدينة', answers: ['بحرين', 'برازيل', 'برتغال', 'بريطانيا', 'بلجيكا', 'بلغاريا', 'بنما', 'بيرو', 'بولندا'] },
  { letter: 'س', category: 'حيوان', answers: ['سمك', 'سحلية', 'سلحفاة', 'سنجاب', 'سرطان', 'سلطعون', 'سنونو'] },
  { letter: 'ط', category: 'حيوان', answers: ['طاووس', 'طيور', 'طفيلي', 'طهر'] },
  { letter: 'ط', category: 'خضار/فواكه', answers: ['طماطم', 'طلع', 'طحالب'] },
  { letter: 'ح', category: 'جماد', answers: ['حبل', 'حديد', 'حذاء', 'حقيبة', 'حزام', 'حاسوب', 'حبر', 'حجر'] },
  { letter: 'و', category: 'حيوان', answers: ['وحيد القرن', 'وطواط', 'وزغة', 'وزة', 'وشق'] },
  { letter: 'ش', category: 'حيوان', answers: ['شبل', 'شامبانزي', 'شيهم', 'شاهين'] },
]`;

const content = fs.readFileSync('src/components/ScattergoriesGame.tsx', 'utf-8');
const start = content.indexOf('const QUESTIONS: Question[] = [');
const end = content.indexOf('];', start) + 2;

if (start !== -1 && end !== -1) {
    const updated = content.substring(0, start) + 'const QUESTIONS: Question[] = ' + extendedQuestions + ';' + content.substring(end);
    fs.writeFileSync('src/components/ScattergoriesGame.tsx', updated, 'utf-8');
    console.log('Successfully expanded QUESTIONS array.');
} else {
    console.log('Failed to locate QUESTIONS array.');
}
