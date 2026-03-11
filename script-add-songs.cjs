const fs = require('fs');
const ytSearch = require('yt-search');
const path = require('path');

const songsToAdd = [
  "محمود التركي - حاسد روحي",
  "أصيل هميم - المفروض",
  "حمزة المحمداوي - دمار",
  "نور الزين - قافل",
  "ياسر عبد الوهاب - ما تنمل",
  "علي صابر - معقولة",
  "سيف نبيل - ما دريت",
  "سليم سالم - لما كحلتي العيون",
  "جعفر الغزال - ضحى بية",
  "محمد السالم - ذاك من ذاك",
  "زيد الحبيب - ابقى اني تاج الراس",
  "مصطفى العبدالله وعلي جاسم - حلو",
  "أصيل هميم - يشبهك قلبي",
  "محمود التركي - اشمك",
  "علي صابر - دائماً",
  "حمزة المحمداوي - أعترف",
  "ياسر عبد الوهاب - العراقية",
  "سيف نبيل - من تغيب",
  "نور الزين - ترافي",
  "علي جاسم - راحتي النفسية",
  "إسراء الأصيل - من صغري",
  "بسام مهدي - انتي حلوة",
  "محمود التركي - تدري شمتني",
  "حاتم العراقي - شعلومه",
  "قيس هشام - انتي وبس",
  "عبد المجيد عبد الله - يا ابن الاوادم",
  "راشد الماجد - ولهان",
  "ماجد المهندس - تناديك",
  "عايض - فمان الله",
  "نبيل شعيل - ندمان",
  "عبد العزيز الويس - استعدي",
  "فؤاد عبد الواحد - يا حب يا حب",
  "داليا مبارك - ترا حقي",
  "بدر الشعيبي - انتهى",
  "شمة حمدان - معجبة",
  "مطرف المطرف - يا نور عيني",
  "إسماعيل مبارك - طمني عنك",
  "عبد العزيز الويس - خطوة",
  "نبيل شعيل - يا عسل",
  "راشد الماجد - لربما",
  "عبد المجيد عبد الله - غزال ما ينصادي",
  "ماجد المهندس - الفاتنة",
  "فهد الكبيسي - ليه",
  "حمد القطان - لو علي",
  "داليا مبارك - يا حاسد",
  "عايض - استراحة محارب",
  "حسين الجسمي - دلع واتدلع",
  "بدر الشعيبي - كذاك",
  "مطرف المطرف - منهو أنت",
  "عبد العزيز الويس - عيشني"
];

async function addSongs() {
  const musicFile = path.join(__dirname, 'music-songs.json');
  let existingSongs = [];
  if (fs.existsSync(musicFile)) {
    existingSongs = JSON.parse(fs.readFileSync(musicFile, 'utf8'));
  }

  for (const songName of songsToAdd) {
    console.log(`Searching for: ${songName}`);
    try {
      const result = await ytSearch(songName + " اغنية"); // add 'song' in Arabic to improve accuracy if needed
      const video = result.videos[0];
      
      if (video) {
        // Check if already exists
        if (!existingSongs.some(s => s.id === video.videoId || s.name === songName)) {
           existingSongs.push({
             name: songName,
             id: video.videoId,
             url: video.url,
             duration: {
               seconds: video.seconds,
               timestamp: video.timestamp
             }
           });
           console.log(`Added: ${songName} -> ${video.videoId}`);
        } else {
           console.log(`Already exists: ${songName}`);
        }
      } else {
        console.log(`Could not find video for: ${songName}`);
      }
    } catch (e) {
      console.error(`Error searching for ${songName}:`, e);
    }
  }

  fs.writeFileSync(musicFile, JSON.stringify(existingSongs, null, 2), 'utf8');
  console.log('Done!');
}

addSongs();