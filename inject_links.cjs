const fs = require('fs');
const file = 'src/components/MissingLinkGame.tsx';
let content = fs.readFileSync(file, 'utf8');

const newRounds = `,
  {
    answer: ['ألوان', 'الوان', 'لون'],
    items: [
      { text: 'أحمر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SNice.svg/500px-SNice.svg.png' },
      { text: 'أزرق', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Blue_sphere.svg/500px-Blue_sphere.svg.png' },
      { text: 'أخضر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Green_sphere.svg/500px-Green_sphere.svg.png' }
    ]
  },
  {
    answer: ['حيوانات', 'حيوان', 'كائنات'],
    items: [
      { text: 'أسد', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lion_waiting_in_Namibia.jpg/500px-Lion_waiting_in_Namibia.jpg' },
      { text: 'فيل', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/500px-African_Bush_Elephant.jpg' },
      { text: 'زرافة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Giraffe_Mikumi_National_Park.jpg/500px-Giraffe_Mikumi_National_Park.jpg' }
    ]
  },
  {
    answer: ['رياضات', 'رياضة', 'لعبة', 'ألعاب'],
    items: [
      { text: 'كرة قدم', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png' },
      { text: 'كرة سلة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Basketball.png/500px-Basketball.png' },
      { text: 'تنس', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Tennis_ball.svg/500px-Tennis_ball.svg.png' }
    ]
  },
  {
    answer: ['كواكب', 'كوكب', 'فضاء'],
    items: [
      { text: 'الأرض', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/500px-The_Earth_seen_from_Apollo_17.jpg' },
      { text: 'المريخ', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/500px-OSIRIS_Mars_true_color.jpg' },
      { text: 'المشتري', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/500px-Jupiter.jpg' }
    ]
  },
  {
    answer: ['حواس', 'حاسة'],
    items: [
      { text: 'عين', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Eye.jpg/500px-Eye.jpg' },
      { text: 'أذن', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ear.jpg/500px-Ear.jpg' },
      { text: 'أنف', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Nose.jpg/500px-Nose.jpg' }
    ]
  }
]`;

content = content.replace(/\n\s*\]\s*\n*\s*\/\/\s*Shuffle rounds helper/, newRounds + '\n\n  // Shuffle rounds helper');
fs.writeFileSync(file, content);
console.log("Updated.");
