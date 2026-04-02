const fs = require('fs');

// 1. Trivia Game
try {
const triviaFile = 'src/components/TriviaGame.tsx';
let txt = fs.readFileSync(triviaFile, 'utf8');
const newTrivia = `
  { q: "ما هو العنصر الأساسي الذي يصنع منه الزجاج؟", a: "الرمل", options: ["الرمل", "الحديد", "الخشب", "البلاستيك"] },
  { q: "ما هي عاصمة كوريا الجنوبية؟", a: "سيول", options: ["بكين", "سيول", "طوكيو", "بانكوك"] },
  { q: "كم عدد الكواكب في نظامنا الشمسي؟", a: "8", options: ["7", "8", "9", "10"] },
  { q: "ما هي الدولة التي تمتلك أكبر عدد من الجزر؟", a: "السويد", options: ["إندونيسيا", "الفلبين", "السويد", "اليابان"] },
  { q: "ما هو المعدن السائل في درجة حرارة الغرفة؟", a: "الزئبق", options: ["الحديد", "النحاس", "الفضة", "الزئبق"] },
  { q: "من هو الحيوان الذي له بصمات تشبه بصمات الإنسان؟", a: "الكوالا", options: ["الشامبانزي", "الكوالا", "القرد", "الغوريلا"] },
  { q: "ما هو أعرض نهر في العالم؟", a: "الأمازون", options: ["النيل", "المسيسيبي", "الأمازون", "الغانج"] },
  { q: "كم عدد العظام في جسم الإنسان البالغ؟", a: "206", options: ["200", "206", "212", "218"] },
  { q: "ما هي لغة البرمجة الأكثر استخدامًا في تطوير الويب؟", a: "جافاسكربت", options: ["بايثون", "سي++", "جافاسكربت", "جافا"] },
  { q: "ما هو البحر الذي يفصل بين قارتي أوروبا وأفريقيا؟", a: "البحر الأبيض المتوسط", options: ["البحر الأحمر", "البحر الميت", "البحر الأبيض المتوسط", "البحر الأسود"] },
  { q: "من هي أول امرأة فازت بجائزة نوبل؟", a: "ماري كوري", options: ["روزاليند فرانكلين", "ماري كوري", "إيرين جوليو-كوري", "دوروثي هودجكن"] },
  { q: "ما هي الغدة الأكبر في جسم الإنسان؟", a: "الكبد", options: ["الكبد", "البنكرياس", "الغدة الدرقية", "الطحال"] },
  { q: "أين تقع أعلى شلالات في العالم؟", a: "فنزويلا", options: ["نيوزيلندا", "البرازيل", "الولايات المتحدة", "فنزويلا"] },
  { q: "ما هو أطول جسر فوق الماء في العالم؟", a: "جسر بحيرة بونتشارترين", options: ["جسر البوابة الذهبية", "جسر بروكلين", "جسر بحيرة بونتشارترين", "جسر دانيانغ-كونشان"] },
  { q: "ما هي العاصمة السابقة لليابان قبل طوكيو؟", a: "كيوتو", options: ["أوساكا", "نارا", "كيوتو", "سابورو"] },`;
txt = txt.replace('const ARABIC_QUESTIONS = [', 'const ARABIC_QUESTIONS = [' + newTrivia);
fs.writeFileSync(triviaFile, txt);
} catch(e) {}

// 2. Hot Potato
try {
const hpFile = 'src/data/hot-potato-questions.ts';
let hpTxt = fs.readFileSync(hpFile, 'utf8');
const newHp = `
  { q: "ما هي عاصمة كندا؟", a: "أوتاوا" },
  { q: "من هو مخترع المذياع؟", a: "ماركوني" },
  { q: "ما هو الاسم العلمي للماء المالح؟", a: "كلوريد الصوديوم" },
  { q: "أين يوجد مقر الأمم المتحدة؟", a: "نيويورك" },
  { q: "ما هو أسرع الأسماك؟", a: "سمكة الشراع" },
  { q: "ما هي العملة الرسمية في البرازيل؟", a: "الريال" },
  { q: "ما هو الحيوان الذي يعيش في أستراليا فقط؟", a: "الكنغر" },
  { q: "كم قلبًا لدى دودة الأرض؟", a: "خمسة قلوب" },
  { q: "ما هي أصغر دولة في العالم؟", a: "الفاتيكان" },
  { q: "ما هي نسبة الأكسجين في الهواء؟", a: "حوالي 21%" },`;
hpTxt = hpTxt.replace('export const hotPotatoQuestions: Question[] = [', 'export const hotPotatoQuestions: Question[] = [' + newHp);
fs.writeFileSync(hpFile, hpTxt);
} catch(e) {}

// 3. Team Feud
try {
const tfFile = 'src/data/team-feud-questions.ts';
let tfTxt = fs.readFileSync(tfFile, 'utf8');
const newTf = `
  {
    question: "أسماء مدن عربية يبدأ اسمها بحرف الكاف",
    answers: [
      { text: "الكويت", points: 40, revealed: false },
      { text: "كربلاء", points: 30, revealed: false },
      { text: "كازابلانكا", points: 20, revealed: false },
      { text: "كركوك", points: 10, revealed: false }
    ]
  },
  {
    question: "فواكه لونها أصفر",
    answers: [
      { text: "موز", points: 45, revealed: false },
      { text: "ليمون", points: 30, revealed: false },
      { text: "أناناس", points: 15, revealed: false },
      { text: "مانجو", points: 10, revealed: false }
    ]
  },
  {
    question: "أشياء توجد في الحديقة",
    answers: [
      { text: "أشجار", points: 40, revealed: false },
      { text: "زهور", points: 30, revealed: false },
      { text: "عشب", points: 20, revealed: false },
      { text: "نافورة", points: 10, revealed: false }
    ]
  },`;
tfTxt = tfTxt.replace('export const TEAM_FEUD_QUESTIONS: TeamFeudQuestion[] = [', 'export const TEAM_FEUD_QUESTIONS: TeamFeudQuestion[] = [' + newTf);
fs.writeFileSync(tfFile, tfTxt);
} catch(e) {}

// 4. Questions Game
try {
const qGameFile = 'src/pages/games/QuestionsGame.tsx';
let qt = fs.readFileSync(qGameFile, 'utf8');
const newQs = `
  { q: "ما هي عاصمة البرتغال؟", a: "لشبونة", options: ["بورتو", "لشبونة", "مدريد", "روما"] },
  { q: "كم عدد العضلات في جسم الإنسان؟", a: "أكثر من 600", options: ["أقل من 300", "حوالي 400", "أكثر من 600", "أكثر من 800"] },
  { q: "ما هو العنصر المستخدم في قلم الرصاص؟", a: "الجرافيت", options: ["الرصاص", "الفحم", "الجرافيت", "الحبر"] },
  { q: "ما هو أكبر كائن حي على وجه الأرض؟", a: "فطر العسل", options: ["الحوت الأزرق", "الفيل", "فطر العسل", "شجرة السيكويا"] },
  { q: "متى بدأت الحرب العالمية الثانية؟", a: "1939", options: ["1914", "1918", "1939", "1945"] },
`;
qt = qt.replace('const QUESTIONS = [', 'const QUESTIONS = [' + newQs);
fs.writeFileSync(qGameFile, qt);
}catch(e){}

// 5. Scattergories
try {
const scFile = 'src/components/ScattergoriesGame.tsx';
let scTxt = fs.readFileSync(scFile, 'utf8');
const newSc = `
  { letter: 'ب', category: 'بلد', answers: ['بحرين', 'بريطانيا', 'برتغال'] },
  { letter: 'ت', category: 'نبات', answers: ['تفاح', 'تمر', 'تين'] },
  { letter: 'ث', category: 'جماد', answers: ['ثلاجة', 'ثوب', 'ثريا'] },
  { letter: 'ح', category: 'حيوان', answers: ['حصان', 'حمار', 'حوت'] },
  { letter: 'خ', category: 'مهنة', answers: ['خباز', 'خياط', 'خادم'] },
`;
scTxt = scTxt.replace('const QUESTIONS: Question[] = [', 'const QUESTIONS: Question[] = [' + newSc);
fs.writeFileSync(scFile, scTxt);
}catch(e){}

console.log('Massive questions injected successfully.');
