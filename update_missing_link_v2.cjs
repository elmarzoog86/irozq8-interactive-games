const fs = require('fs');

const file = 'src/components/MissingLinkGame.tsx';
let content = fs.readFileSync(file, 'utf8');

const newLinks = `
  {
    answer: ['الوان', 'لون', 'ألوان'],
    items: [
      { text: 'احمر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Red.svg/500px-Red.svg.png' },
      { text: 'ازرق', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Solid_blue.svg/500px-Solid_blue.svg.png' },
      { text: 'اخضر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Solid_green.svg/500px-Solid_green.svg.png' }
    ]
  },
  {
    answer: ['طيور', 'طير', 'عصافير'],
    items: [
      { text: 'نسر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Bald_Eagle_Portrait.jpg/500px-Bald_Eagle_Portrait.jpg' },
      { text: 'ببغاء', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ara_macao_flying_-Costa_Rica-8.jpg/500px-Ara_macao_flying_-Costa_Rica-8.jpg' },
      { text: 'حمامة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Feral_Pigeon.jpg/500px-Feral_Pigeon.jpg' }
    ]
  },
  {
    answer: ['اجهزة كهربائية', 'الكترونيات', 'كهربائيات', 'اجهزة منزلية'],
    items: [
      { text: 'ثلاجة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Refrigerator.png/500px-Refrigerator.png' },
      { text: 'غسالة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Washing_machine.jpg/500px-Washing_machine.jpg' },
      { text: 'تلفاز', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/CRT_television.jpg/500px-CRT_television.jpg' }
    ]
  },
  {
    answer: ['حشرات', 'حشرة', 'بقيات'],
    items: [
      { text: 'نملة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ant_Macro.jpg/500px-Ant_Macro.jpg' },
      { text: 'نحلة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Apis_mellifera_flying.jpg/500px-Apis_mellifera_flying.jpg' },
      { text: 'فраشة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Monarch_Butterfly_Danaus_plexippus.jpg/500px-Monarch_Butterfly_Danaus_plexippus.jpg' }
    ]
  },
  {
    answer: ['اعضاء الجسم', 'جسم', 'اعضاء'],
    items: [
      { text: 'عين', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Human_eye_with_blood_vessels.jpg/500px-Human_eye_with_blood_vessels.jpg' },
      { text: 'قلب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Human_Heart_and_lungs.jpg/500px-Human_Heart_and_lungs.jpg' },
      { text: 'يد', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hand_picture.jpg/500px-Hand_picture.jpg' }
    ]
  },
  {
    answer: ['اسلحة', 'سلاح'],
    items: [
      { text: 'سيف', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Sword.jpg/500px-Sword.jpg' },
      { text: 'بندقية', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Rifle.jpg/500px-Rifle.jpg' },
      { text: 'قنبلة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Bomb.jpg/500px-Bomb.jpg' }
    ]
  },
  {
    answer: ['الات موسيقية', 'موسيقى', 'معازف', 'آلات موسيقية'],
    items: [
      { text: 'عود', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Oud.jpg/500px-Oud.jpg' },
      { text: 'بيانو', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Piano.jpg/500px-Piano.jpg' },
      { text: 'جيتار', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Guitar.jpg/500px-Guitar.jpg' }
    ]
  },
  {
    answer: ['مهن', 'وظائف', 'عمل', 'شغل'],
    items: [
      { text: 'طبيب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Doctor.jpg/500px-Doctor.jpg' },
      { text: 'معلم', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Teacher.jpg/500px-Teacher.jpg' },
      { text: 'مهندس', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Engineer.jpg/500px-Engineer.jpg' }
    ]
  },
  {
    answer: ['العاب فيديو', 'قيمنق', 'العاب', 'بلايستيشن', 'اكس بوكس'],
    items: [
      { text: 'ماينكرافت', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Minecraft_logo.svg/500px-Minecraft_logo.svg.png' },
      { text: 'فيفا', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/FIFA_logo.svg/500px-FIFA_logo.svg.png' },
      { text: 'فورتنايت', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Fortnite_logo.svg/500px-Fortnite_logo.svg.png' }
    ]
  },
  {
    answer: ['اوقات', 'زمن', 'وقت', 'فصول', 'فترات'],
    items: [
      { text: 'صباح', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Sunrise.jpg/500px-Sunrise.jpg' },
      { text: 'مساء', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sunset.jpg/500px-Sunset.jpg' },
      { text: 'ليل', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Night.jpg/500px-Night.jpg' }
    ]
  },
  {
    answer: ['بحار', 'محيطات', 'مسطحات مائية', 'ماء'],
    items: [
      { text: 'البحر الاحمر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Red_Sea_map.png/500px-Red_Sea_map.png' },
      { text: 'البحر المتوسط', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mediterranean_Sea_map.png/500px-Mediterranean_Sea_map.png' },
      { text: 'المحيط الاطلسي', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Atlantic_Ocean.png/500px-Atlantic_Ocean.png' }
    ]
  },
  {
    answer: ['معالم سياحية', 'معالم', 'سياحة', 'اماكن'],
    items: [
      { text: 'الاهرامات', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Kheops-Pyramid.jpg/500px-Kheops-Pyramid.jpg' },
      { text: 'سور الصين', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Great_Wall_of_China_July_2006.JPG/500px-Great_Wall_of_China_July_2006.JPG' },
      { text: 'ساعة بيغ بن', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Big_Ben_Clock_Face.jpg/500px-Big_Ben_Clock_Face.jpg' }
    ]
  },
  {
    answer: ['مكسرات', 'تسالي', 'حبوب'],
    items: [
      { text: 'لوز', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Almonds.jpg/500px-Almonds.jpg' },
      { text: 'فستق', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Pistachio.jpg/500px-Pistachio.jpg' },
      { text: 'كاجو', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Cashew.jpg/500px-Cashew.jpg' }
    ]
  },
  {
    answer: ['لغات', 'لغة', 'لهجات', 'كلام'],
    items: [
      { text: 'انجليزي', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/500px-Flag_of_the_United_Kingdom.svg.png' },
      { text: 'عربي', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_Arab_League.svg/500px-Flag_of_the_Arab_League.svg.png' },
      { text: 'فرنسي', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/500px-Flag_of_France.svg.png' }
    ]
  },
  {
    answer: ['ادوات طعام', 'مطبخ', 'مواعين', 'اواني'],
    items: [
      { text: 'ملعقة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Spoon.jpg/500px-Spoon.jpg' },
      { text: 'شوكة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Fork.jpg/500px-Fork.jpg' },
      { text: 'سكين', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Knife.jpg/500px-Knife.jpg' }
    ]
  },
  {
    answer: ['اشجار', 'شجر', 'نباتات', 'نبات'],
    items: [
      { text: 'نخلة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Palm_tree.jpg/500px-Palm_tree.jpg' },
      { text: 'شجرة تفاح', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Apple_tree.jpg/500px-Apple_tree.jpg' },
      { text: 'صبار', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Cactus.jpg/500px-Cactus.jpg' }
    ]
  },
  {
    answer: ['مشاعر', 'احاسيس', 'عواطف', 'شعور'],
    items: [
      { text: 'فرح', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Joy.jpg/500px-Joy.jpg' },
      { text: 'حزن', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Sadness.jpg/500px-Sadness.jpg' },
      { text: 'غضب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Anger.jpg/500px-Anger.jpg' }
    ]
  }
];
`;

const marker = "    ]\n  }\n];";
if (content.includes(marker)) {
    content = content.replace(marker, "    ]\n  }," + newLinks.slice(0, -2));
} else {
    // try different white space
    content = content.replace(/\]\s*\}\s*\];/, "    ]\n  }," + newLinks.slice(0, -2));
}

let startControlsUI = `<p className="text-zinc-400 text-lg mb-8">اكتب <span className="text-brand-gold font-bold">!join</span> أو <span className="text-brand-gold font-bold">join</span> في الشات للانضمام</p>
                
                {/* Rounds Selector */}
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl mb-6 border border-white/10">
                  <span className="text-white font-bold">عدد الجولات:</span>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20].map(num => (
                      <button
                        key={num}
                        onClick={() => setMaxRounds(num)}
                        className={\`px-4 py-2 rounded-lg font-bold transition-all \${
                          maxRounds === num
                            ? 'bg-brand-gold text-black scale-105'
                            : 'bg-black/40 text-white/70 hover:bg-white/10'
                        }\`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4 w-full">`;

content = content.replace(
  /<p className="text-zinc-400 text-lg mb-8">اكتب <span className="text-brand-gold font-bold">!join<\/span> أو <span className="text-brand-gold font-bold">join<\/span> في الشات للانضمام<\/p>[\s\n]*<div className="flex justify-center gap-4 w-full">/,
  startControlsUI
);


fs.writeFileSync(file, content);
console.log('Links updated');