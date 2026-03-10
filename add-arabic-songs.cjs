const fs = require('fs');

const musicFile = 'music-songs.json';
let songs = [];
try {
  songs = JSON.parse(fs.readFileSync(musicFile, 'utf8'));
} catch (e) {
  console.log('Could not read existing file, starting fresh');
}

const newSongsList = [
  "نوال الكويتية - الشوق جابك",
  "نوال الكويتية - لقيت روحي",
  "نوال الكويتية - نور الدنيا",
  "نوال الكويتية - احاول",
  "نوال الكويتية - ضاقت عليك",
  "نوال الكويتية - تبغى الصدق",
  "نوال الكويتية - أيام حبك",
  "نوال الكويتية - القلوب الساهية",
  "نوال الكويتية - قضى عمري",
  "نوال الكويتية - خذاني الشوق",
  "نبيل شعيل - وش مسوي",
  "نبيل شعيل - مشوار",
  "نبيل شعيل - ندمان",
  "نبيل شعيل - ابنساكم",
  "نبيل شعيل - ما اروعك",
  "شيرين - على بالي",
  "شيرين - بتمنى انساك",
  "شيرين - مشاعر",
  "شيرين - متحاسبنيش",
  "شيرين - اه ياليل",
  "شيرين - صبري قليل",
  "بلقيس - ياكل الحب",
  "بلقيس - مجنون",
  "بلقيس - هذا منو",
  "بلقيس - هوى",
  "بلقيس - تعالى تشوف",
  "بلقيس - يوي يوي",
  "راشد الماجد - صاحي لهم",
  "أسماء لمنور - كل ما لمحتك",
  "أسماء لمنور - ويل",
  "أسماء لمنور - روح",
  "أسماء لمنور - ادري",
  "أسماء لمنور - صافي",
  "جميلة - بلاش بلاش"
];

let addedCount = 0;
newSongsList.forEach(songName => {
  // Check if song already exists to avoid duplicates
  if (!songs.some(s => s.name === songName)) {
    songs.push({
      name: songName,
      id: null,
      url: '',
      duration: ''
    });
    addedCount++;
  }
});

fs.writeFileSync(musicFile, JSON.stringify(songs, null, 2), 'utf8');
console.log('Added ' + addedCount + ' new songs.');
console.log('Total songs sum: ' + songs.length);
