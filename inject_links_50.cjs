const fs = require('fs');
const file = 'src/components/MissingLinkGame.tsx';
let content = fs.readFileSync(file, 'utf8');

const newRounds = `,
  {
    answer: ['وظائف', 'مهن', 'مهنة', 'وظيفة', 'عمل'],
    items: [
      { text: 'طبيب', image: 'https://api.dicebear.com/7.x/icons/svg?seed=doctor&backgroundColor=d4af37' },
      { text: 'معلم', image: 'https://api.dicebear.com/7.x/icons/svg?seed=teacher&backgroundColor=d4af37' },
      { text: 'مهندس', image: 'https://api.dicebear.com/7.x/icons/svg?seed=engineer&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['مشروبات', 'مشروب', 'سوائل'],
    items: [
      { text: 'قهوة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=coffee&backgroundColor=d4af37' },
      { text: 'شاي', image: 'https://api.dicebear.com/7.x/icons/svg?seed=tea&backgroundColor=d4af37' },
      { text: 'عصير', image: 'https://api.dicebear.com/7.x/icons/svg?seed=juice&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['سيارات', 'مركبات', 'سيارة'],
    items: [
      { text: 'تويوتا', image: 'https://api.dicebear.com/7.x/icons/svg?seed=toyota&backgroundColor=d4af37' },
      { text: 'انفنتي', image: 'https://api.dicebear.com/7.x/icons/svg?seed=infiniti&backgroundColor=d4af37' },
      { text: 'نيسان', image: 'https://api.dicebear.com/7.x/icons/svg?seed=nissan&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['ملابس', 'كسوة', 'لبس', 'هدوم'],
    items: [
      { text: 'قميص', image: 'https://api.dicebear.com/7.x/icons/svg?seed=shirt&backgroundColor=d4af37' },
      { text: 'بنطلون', image: 'https://api.dicebear.com/7.x/icons/svg?seed=pants&backgroundColor=d4af37' },
      { text: 'حذاء', image: 'https://api.dicebear.com/7.x/icons/svg?seed=shoes&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['أدوات مدرسية', 'قرطاسية', 'مدرسة'],
    items: [
      { text: 'قلم', image: 'https://api.dicebear.com/7.x/icons/svg?seed=pen&backgroundColor=d4af37' },
      { text: 'دفتر', image: 'https://api.dicebear.com/7.x/icons/svg?seed=notebook&backgroundColor=d4af37' },
      { text: 'ممحاة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=eraser&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['معادن', 'معدن'],
    items: [
      { text: 'ذهب', image: 'https://api.dicebear.com/7.x/icons/svg?seed=gold&backgroundColor=d4af37' },
      { text: 'فضة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=silver&backgroundColor=d4af37' },
      { text: 'حديد', image: 'https://api.dicebear.com/7.x/icons/svg?seed=iron&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['أثاث', 'مفروشات', 'اثاث'],
    items: [
      { text: 'سرير', image: 'https://api.dicebear.com/7.x/icons/svg?seed=bed&backgroundColor=d4af37' },
      { text: 'طاولة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=table&backgroundColor=d4af37' },
      { text: 'كرسي', image: 'https://api.dicebear.com/7.x/icons/svg?seed=chair&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['فصول السنة', 'فصول', 'فصل'],
    items: [
      { text: 'شتاء', image: 'https://api.dicebear.com/7.x/icons/svg?seed=winter&backgroundColor=d4af37' },
      { text: 'صيف', image: 'https://api.dicebear.com/7.x/icons/svg?seed=summer&backgroundColor=d4af37' },
      { text: 'ربيع', image: 'https://api.dicebear.com/7.x/icons/svg?seed=spring&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['أدوات مطبخ', 'مطبخ', 'اواني', 'أواني'],
    items: [
      { text: 'سكين', image: 'https://api.dicebear.com/7.x/icons/svg?seed=knife&backgroundColor=d4af37' },
      { text: 'ملعقة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=spoon&backgroundColor=d4af37' },
      { text: 'شوكة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=fork&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['طيور', 'طائر', 'عصافير'],
    items: [
      { text: 'صقر', image: 'https://api.dicebear.com/7.x/icons/svg?seed=falcon&backgroundColor=d4af37' },
      { text: 'حمامة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=dove&backgroundColor=d4af37' },
      { text: 'نسر', image: 'https://api.dicebear.com/7.x/icons/svg?seed=eagle&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['وسائل نقل', 'مواصلات', 'نقل', 'مواصلة'],
    items: [
      { text: 'طائرة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=plane&backgroundColor=d4af37' },
      { text: 'قطار', image: 'https://api.dicebear.com/7.x/icons/svg?seed=train&backgroundColor=d4af37' },
      { text: 'سفينة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=ship&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['أجهزة كهرابئية', 'اجهزة', 'أجهزة', 'الكترونيات', 'كهربائيات'],
    items: [
      { text: 'تلفاز', image: 'https://api.dicebear.com/7.x/icons/svg?seed=tv&backgroundColor=d4af37' },
      { text: 'ثلاجة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=fridge&backgroundColor=d4af37' },
      { text: 'غسالة', image: 'https://api.dicebear.com/7.x/icons/svg?seed=washer&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['زهور', 'زهرة', 'ورد', 'ورود'],
    items: [
      { text: 'ياسمين', image: 'https://api.dicebear.com/7.x/icons/svg?seed=jasmine&backgroundColor=d4af37' },
      { text: 'جوري', image: 'https://api.dicebear.com/7.x/icons/svg?seed=rose&backgroundColor=d4af37' },
      { text: 'توليب', image: 'https://api.dicebear.com/7.x/icons/svg?seed=tulip&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['لغات', 'لغة', 'لهجات'],
    items: [
      { text: 'عربية', image: 'https://api.dicebear.com/7.x/icons/svg?seed=arabic&backgroundColor=d4af37' },
      { text: 'إنجليزية', image: 'https://api.dicebear.com/7.x/icons/svg?seed=english&backgroundColor=d4af37' },
      { text: 'فرنسية', image: 'https://api.dicebear.com/7.x/icons/svg?seed=french&backgroundColor=d4af37' }
    ]
  },
  {
    answer: ['أدوات موسيقية', 'آلات موسيقية', 'موسيقى', 'الات'],
    items: [
      { text: 'عود', image: 'https://api.dicebear.com/7.x/icons/svg?seed=oud&backgroundColor=d4af37' },
      { text: 'بيانو', image: 'https://api.dicebear.com/7.x/icons/svg?seed=piano&backgroundColor=d4af37' },
      { text: 'جيتار', image: 'https://api.dicebear.com/7.x/icons/svg?seed=guitar&backgroundColor=d4af37' }
    ]
  }
]`;

content = content.replace(/\n\s*\]\n*\s*\/\/\s*Shuffle rounds helper/, newRounds + '\n\n// Shuffle rounds helper');
fs.writeFileSync(file, content);
console.log("Injected 15 new puzzles.");
