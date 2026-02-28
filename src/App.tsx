import React, { useState } from 'react';
import { TwitchChat } from './components/TwitchChat';
import { TriviaGame } from './components/TriviaGame';
import { FruitWar } from './components/FruitWar';
import { ChairsGame } from './components/ChairsGame';
import { RouletteGame } from './components/RouletteGame';
import { WordChainGame } from './components/WordChainGame';
import { ChatInvadersGame } from './components/ChatInvadersGame';
import { PriceIsRightGame } from './components/PriceIsRightGame';
import { HowManyGame } from './components/HowManyGame';
import { HowManyPlayer } from './components/HowManyPlayer';
import { TeamFeudGame } from './components/TeamFeudGame';
import { CodeNamesGame } from './components/CodeNamesGame';
import { BombRelayGame } from './components/BombRelayGame';
import { TeamPlayer } from './components/TeamPlayer';
import { useTwitchChat } from './hooks/useTwitchChat';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, HelpCircle, Swords, Armchair, Hourglass, Twitch, Heart, MessageCircle, MessageSquareText, Rocket, Tag, Skull } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

  export default function App() {
    return (
      <Routes>
        <Route path="/howmany/:roomId" element={<HowManyPlayer />} />
        <Route path="/team/:roomId" element={<TeamPlayer />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    );
  }const GAMES = [
  {
    id: 'trivia',
    name: 'سين جيم',
    description: 'اختبر معلوماتك العامة في مسابقة ثقافية سريعة. أجب على الأسئلة في الدردشة واجمع النقاط لتتصدر لوحة الصدارة.',
    tutorial: 'اكتب رقم الإجابة الصحيحة في الدردشة (1، 2، 3، أو 4). كلما أجبت أسرع، حصلت على نقاط أكثر!',
    image: '/trivia.png',
    status: 'active',
    type: 'puzzles',
    color: 'yellow'
  },
  {
    id: 'teamfeud',
    name: 'تحدي الفرق',
    description: 'انقسموا إلى فريقين وحاولوا تخمين الإجابات الأكثر شيوعاً بين الناس. هل تستطيع أنت وفريقك السيطرة على اللوحة؟',
    tutorial: 'اكتب إجابتك في الدردشة. إذا كانت إجابتك من ضمن الإجابات الأكثر شيوعاً، ستحصل على نقاط لفريقك.',
    image: '/teamfeud.png',
    status: 'active',
    type: 'puzzles',
    color: 'blue'
  },
  {
    id: 'priceisright',
    name: 'خمن السعر',
    description: 'استعرض مهاراتك في التسوق! خمن السعر الصحيح للمنتجات المعروضة. الفائز هو من يقترب من السعر الحقيقي دون تجاوزه.',
    tutorial: 'اكتب السعر الذي تتوقعه في الدردشة. يجب أن يكون السعر قريباً من السعر الحقيقي دون أن يتجاوزه.',
    image: '/priceisright.png',
    status: 'active',
    type: 'puzzles',
    color: 'green'
  },
  {
    id: 'fruitwar',
    name: 'حرب الفواكه',
    description: 'اختر فاكهتك المفضلة واستعد للمعركة! لعبة حماسية تعتمد على تصويت الجمهور أو الحظ لتحديد الناجي الأخير.',
    tutorial: 'اكتب اسم الفاكهة التي تريد دعمها في الدردشة. الفاكهة التي تحصل على أقل عدد من الأصوات أو يتم اختيارها في الروليت تخرج من اللعبة.',
    image: '/fruitwar.png',
    status: 'active',
    type: 'action',
    color: 'yellow'
  },
  
  {
    id: 'howmany',
    name: 'كم تقدر تسمي؟',
    description: 'تحدي الذاكرة والسرعة. كم عدد الأشياء التي يمكنك تسميتها في فئة معينة قبل أن يسبقك الآخرون؟',
    tutorial: 'اكتب أكبر عدد ممكن من الكلمات التي تنتمي للفئة المختارة في الدردشة. كل كلمة صحيحة تمنحك نقطة.',
    image: '/howmany.png',
    status: 'active',
    type: 'puzzles',
    color: 'blue',
    isNew: true
  },
  {
    id: 'codenames',
    name: 'لعبة الشفرة',
    description: 'لعبة الذكاء والارتباطات. حاول كشف كلمات فريقك السرية عبر تلميحات Spymaster، لكن احذر من لمس كلمة القاتل!',
    tutorial: 'اكتب الكلمة التي تعتقد أنها تنتمي لفريقك بناءً على تلميح Spymaster. تجنب كلمات الفريق الآخر وكلمة القاتل.',
    image: '/codenames.png',
    status: 'active',
    type: 'strategy',
    color: 'red'
  },
  {
    id: 'chairs',
    name: 'لعبة الكراسي',
    description: 'النسخة الرقمية من اللعبة الكلاسيكية. اكتب رقم الكرسي بسرعة في الدردشة لتضمن مكانك قبل أن تتوقف الموسيقى!',
    tutorial: 'عندما تتوقف الموسيقى، اكتب رقم الكرسي الخالي في الدردشة فوراً. من يتبقى بدون كرسي يخرج من اللعبة.',
    image: '/chairs.png',
    status: 'coming_soon',
    type: 'action',
    color: 'yellow'
  },
  {
    id: 'roulette',
    name: 'روليت',
    description: 'لعبة الحظ والإقصاء. انضم للعجلة وانتظر دورك. إذا تم اختيارك، ستمتلك القوة لإقصاء منافسيك أو المخاطرة بالبقاء.',
    tutorial: 'انضم للردهة ليظهر اسمك. إذا اختارتك العجلة، يمكنك اختيار لاعب لإقصائه أو المخاطرة بفرصة إضافية.',
    image: '/roulette.png',
    status: 'coming_soon',
    type: 'action',
    color: 'yellow'
  },
  {
    id: 'wordchain',
    name: 'سلسلة الكلمات',
    description: 'اختبار لسرعة البديهة والمفردات. ابدأ بكلمة، وعلى اللاعب التالي أن يأتي بكلمة تبدأ بآخر حرف. لا تتوقف!',
    tutorial: 'اكتب كلمة تبدأ بآخر حرف من الكلمة السابقة. لديك وقت محدود للرد قبل أن تخسر.',
    image: '/wordchain.png',
    status: 'coming_soon',
    type: 'puzzles',
    color: 'blue'
  },
  {
    id: 'chatinvaders',
    name: 'غزاة الشات',
    description: 'حول الدردشة إلى معركة فضائية! كل رسالة هي عدو جديد. دافع عن سفينتك ودمر الغزاة قبل أن يصلوا إليك.',
    tutorial: 'استخدم الأسهم للحركة و Space لإطلاق النار. كل رسالة في الدردشة تظهر كعدو يحاول تدميرك.',
    image: '/chatinvaders.png',
    status: 'coming_soon',
    type: 'action',
    color: 'red'
  },
  {
    id: 'guessmusic',
    name: 'خمن الموسيقى',
    description: 'لمحبي الألحان! استمع للمقاطع الموسيقية وكن الأول في تخمين اسم الأغنية أو الفنان في الدردشة.',
    tutorial: 'استمع للمقطع الموسيقي واكتب اسم الأغنية أو الفنان في الدردشة بأسرع ما يمكن.',
    image: '/guessmusic.png',
    status: 'coming_soon',
    type: 'puzzles',
    color: 'yellow'
  },
  {
    id: 'bankrobbery',
    name: 'سطو على البنك',
    description: 'مهمة تعاونية كبرى. خطط مع الدردشة لتجاوز أنظمة الأمن وفتح الخزنة والهروب بالكنز قبل وصول الشرطة.',
    tutorial: 'تعاون مع الدردشة عبر كتابة الأوامر لتجاوز العقبات. الدقة والتوقيت هما مفتاح النجاح.',
    image: '/bankrobbery.png',
    status: 'coming_soon',
    type: 'strategy',
    color: 'yellow'
  },
  {
    id: 'bombrelay',
    name: 'سباق القنبلة',
    description: 'الضغط يزداد! تعاون مع فريقك لتمرير القنبلة وتفكيك رموزها المعقدة قبل أن تنفجر في وجه الجميع.',
    tutorial: 'اكتب الرموز المطلوبة في الدردشة لتفكيك القنبلة قبل انتهاء الوقت. السرعة هي كل شيء!',
    image: '/bombrelay.png',
    status: 'coming_soon',
    type: 'action',
    color: 'green'
  }
];

function MainApp() {
  const [channelNameInput, setChannelNameInput] = useState('');
  const [activeChannel, setActiveChannel] = useState('');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [tutorialGame, setTutorialGame] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'coming_soon' | 'testing'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'action' | 'puzzles' | 'strategy'>('all');
  const navigate = useNavigate();
  const location = useLocation();

  const { messages, isConnected, error } = useTwitchChat({ 
    channelName: activeChannel 
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (channelNameInput.trim()) {
      setActiveChannel(channelNameInput.trim().toLowerCase());
    }
  };

  const leaveGame = () => {
    setActiveGame(null);
  };

  if (!activeChannel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-arabic relative overflow-hidden bg-black" dir="rtl">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
        >
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/80 backdrop-blur-xl border border-brand-gold/20 rounded-[40px] p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />
          
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-brand-gold/5 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-brand-gold/20 transform rotate-6 overflow-hidden shadow-2xl">
              <img 
                src="/roz.png" 
                alt="Roz Logo" 
                className="w-full h-full object-cover -rotate-6 scale-[1.4]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="flex flex-col items-center text-brand-gold/50"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg></div>';
                }}
              />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">منصة روز</h1>
            <p className="text-brand-gold/60 text-lg">اربط قناتك للبدء باللعب مع المتابعين</p>
          </div>

          <form onSubmit={handleConnect} className="space-y-8">
            <div>
              <label htmlFor="channel" className="block text-sm font-bold text-brand-gold/50 mb-3 uppercase tracking-widest">
                اسم قناة تويتش
              </label>
              <div className="relative" dir="ltr">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-brand-gold/30 font-mono text-sm">twitch.tv/</span>
                </div>
                <input
                  type="text"
                  id="channel"
                  value={channelNameInput}
                  onChange={(e) => setChannelNameInput(e.target.value)}
                  className="block w-full pl-32 pr-5 py-4 bg-white/5 border border-brand-gold/20 rounded-2xl text-white placeholder-brand-gold/20 focus:ring-2 focus:ring-brand-gold/50 focus:border-transparent transition-all outline-none text-lg font-medium"
                  placeholder="username"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-gold hover:bg-brand-gold-light text-black font-black py-5 px-6 rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_20px_rgba(212,175,55,0.2)] flex items-center justify-center gap-3 text-xl"
            >
              اتصال ولعب
            </button>
          </form>
        </motion.div>

        {/* Credits */}
        <div className="absolute bottom-6 left-0 right-0 text-center z-20 pointer-events-none">
          <p className="text-yellow-500/40 text-sm font-mono flex items-center justify-center gap-2" dir="ltr">
            <span>Done by:</span>
            <span className="text-yellow-500/60 font-bold">iRozQ8</span>
            <span>•</span>
            <span className="text-yellow-500/60 font-bold">iSari9</span>
            <span>•</span>
            <span className="text-yellow-500/60 font-bold">iMythQ8</span>
          </p>
        </div>
      </div>
    );
  }

  // Full screen games
  if (activeGame === 'trivia') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />
        
        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <TriviaGame messages={messages} onLeave={leaveGame} channelName={activeChannel} isConnected={isConnected} error={error} />
        </div>
      </div>
    );
  }

  if (activeGame === 'fruitwar') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <FruitWar messages={messages} onLeave={leaveGame} channelName={activeChannel} isConnected={isConnected} error={error} />
        </div>
      </div>
    );
  }

  if (activeGame === 'chairs') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <ChairsGame messages={messages} onLeave={leaveGame} channelName={activeChannel} isConnected={isConnected} error={error} />
        </div>
      </div>
    );
  }

  if (activeGame === 'roulette') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <RouletteGame messages={messages} onLeave={leaveGame} channelName={activeChannel} isConnected={isConnected} error={error} />
        </div>
      </div>
    );
  }

  if (activeGame === 'wordchain') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />
        
        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <WordChainGame messages={messages} onLeave={leaveGame} />
        </div>
      </div>
    );
  }

  if (activeGame === 'chatinvaders') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />
        
        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <ChatInvadersGame messages={messages} onLeave={leaveGame} />
        </div>
      </div>
    );
  }

  if (activeGame === 'howmany') {
    return (
      <div className="min-h-screen text-white font-arabic flex flex-col items-center relative overflow-hidden" dir="rtl">
        <div className="relative z-10 h-full w-full">
          <HowManyGame onLeave={leaveGame} channelName={activeChannel} messages={messages} />
        </div>
      </div>
    );
  }

  if (activeGame === 'teamfeud') {
    return (
      <div className="min-h-screen text-white font-arabic flex flex-col items-center relative overflow-hidden" dir="rtl">
        <div className="relative z-10 h-full w-full">
          <TeamFeudGame onLeave={leaveGame} messages={messages} />
        </div>
      </div>
    );
  }

  if (activeGame === 'codenames') {
    return (
      <div className="min-h-screen text-white font-arabic flex flex-col items-center relative overflow-hidden" dir="rtl">
        <div className="relative z-10 h-full w-full">
          <CodeNamesGame 
            onLeave={leaveGame} 
            messages={messages} 
            channelName={activeChannel}
            isConnected={isConnected}
            error={error}
          />
        </div>
      </div>
    );
  }

  if (activeGame === 'bombrelay') {
    return (
      <div className="min-h-screen text-white font-arabic flex flex-col items-center relative overflow-hidden" dir="rtl">
        <div className="relative z-10 h-full w-full">
          <BombRelayGame onLeave={leaveGame} messages={messages} />
        </div>
      </div>
    );
  }

  if (activeGame === 'priceisright') {
    return (
      <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden bg-black" dir="rtl">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-40">
          <source src="/background.webm" type="video/webm" />
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-0" />
        
        {/* Top Bar */}
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.twitch.tv/irozq8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="hidden sm:inline">قناتي في تويتش</span>
            </a>
            <a 
              href="https://streamlabs.com/irozq8/tip" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">دعم القناة</span>
            </a>
            <a 
              href="https://discord.com/users/StigQ8" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
            >
              <MessageCircle className="w-4 h-4 text-[#5865F2]" />
              <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
            </a>
          </div>
        </div>

        <div className="relative z-10 h-full w-full">
          <PriceIsRightGame messages={messages} onLeave={leaveGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-8 font-arabic flex flex-col items-center relative overflow-hidden" dir="rtl">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
        <source src="/background.webm" type="video/webm" />
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Top Bar */}
  <div className="w-full max-w-[96vw] flex items-center justify-between mb-4 relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand-gold/10 rounded-2xl flex items-center justify-center border border-brand-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <img src="/roz.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-brand-gold tracking-wider glow-gold-text">iRozQ8</h1>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://www.twitch.tv/irozq8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#9146FF]/20 hover:bg-[#9146FF]/40 text-white px-4 py-2 rounded-xl border border-[#9146FF]/50 transition-all font-bold text-sm backdrop-blur-md"
          >
            <Twitch className="w-4 h-4 text-[#9146FF]" />
            <span className="hidden sm:inline">قناتي في تويتش</span>
          </a>
          <a 
            href="https://streamlabs.com/irozq8/tip" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-white px-4 py-2 rounded-xl border border-emerald-500/50 transition-all font-bold text-sm backdrop-blur-md"
          >
            <Heart className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">دعم القناة</span>
          </a>
          <a 
            href="https://discord.com/users/StigQ8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white px-4 py-2 rounded-xl border border-[#5865F2]/50 transition-all font-bold text-sm backdrop-blur-md"
          >
            <MessageCircle className="w-4 h-4 text-[#5865F2]" />
            <span className="hidden sm:inline">الدعم الفني (StigQ8)</span>
          </a>
        </div>
      </div>

  <div className="w-full max-w-[96vw] flex gap-8 h-[96vh] relative z-10">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 p-8 flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent" />
          
          <div className="relative z-10 w-full h-full flex flex-col">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight">ردهة الألعاب</h1>
                  <p className="text-brand-gold/60 mt-1 text-lg">اختر لعبة للعبها مع الدردشة</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button 
                    onClick={() => setActiveChannel('')} 
                    className="text-brand-gold/70 hover:text-brand-gold transition-all text-sm font-bold flex items-center gap-2 bg-brand-gold/5 px-5 py-2.5 rounded-xl border border-brand-gold/20 hover:border-brand-gold/40"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" /> قطع الاتصال
                  </button>
                  
                  {/* Filters */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-brand-gold/10">
                      <button 
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >الكل</button>
                      <button 
                        onClick={() => setStatusFilter('active')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >نشطة</button>
                      <button 
                        onClick={() => setStatusFilter('coming_soon')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'coming_soon' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >قريباً</button>
                      <button 
                        onClick={() => setStatusFilter('testing')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'testing' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >تجريبي</button>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-brand-gold/10">
                      <button 
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === 'all' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >الكل</button>
                      <button 
                        onClick={() => setTypeFilter('action')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === 'action' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >أكشن</button>
                      <button 
                        onClick={() => setTypeFilter('puzzles')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === 'puzzles' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >ألغاز</button>
                      <button 
                        onClick={() => setTypeFilter('strategy')}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${typeFilter === 'strategy' ? 'bg-brand-gold text-black shadow-lg' : 'text-brand-gold/40 hover:text-brand-gold/70'}`}
                      >استراتيجية</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 mt-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {GAMES.filter(game => {
                      const matchesStatus = statusFilter === 'all' || game.status === statusFilter;
                      const matchesType = typeFilter === 'all' || game.type === typeFilter;
                      return matchesStatus && matchesType;
                    }).map(game => (
                      <div 
                        key={game.id}
                        onClick={() => { if (game.status === 'active' || game.status === 'testing') setActiveGame(game.id); }} 
                        className={`group relative bg-black/40 backdrop-blur-md border-2 border-brand-gold/10 hover:border-brand-gold/50 p-7 rounded-[34px] text-right transition-all duration-500 flex flex-col h-full shadow-xl hover:shadow-brand-gold/10 hover:-translate-y-2 cursor-pointer ${game.status === 'coming_soon' ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[30px]" />
                        
                        <div className="w-full h-56 mb-6 rounded-2xl overflow-hidden shrink-0 border border-brand-gold/20 bg-black/40 flex items-center justify-center relative shadow-inner">
                          <img 
                            src={game.image} 
                            alt={game.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex flex-col items-center text-brand-gold/30"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 21l-5-5 5-5 5 5-5 5z"></path><path d="M2 21h20"></path></svg></div>`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                          
                          {game.isNew && <div className="absolute top-4 right-4 bg-brand-gold text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">جديد</div>}
                          {game.status === 'coming_soon' && <div className="absolute top-4 right-4 bg-black/60 text-brand-gold/50 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand-gold/20">قريباً</div>}
                          {game.status === 'testing' && <div className="absolute top-4 right-4 bg-brand-gold/20 text-brand-gold text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-brand-gold/30">تجريبي</div>}
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-3xl font-black text-white mb-3 tracking-tight group-hover:text-brand-gold transition-colors">{game.name}</h3>
                          <p className="text-brand-gold/50 text-base leading-relaxed flex-1 font-medium">{game.description}</p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-brand-gold/10 flex items-center justify-between">
                          <span className="text-[10px] font-black text-brand-gold/30 uppercase tracking-widest">{game.type}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setTutorialGame(game.id);
                              }}
                              className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-all text-brand-gold"
                              title="كيف تلعب؟"
                            >
                              <HelpCircle className="w-4 h-4" />
                            </button>
                            <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center group-hover:bg-brand-gold group-hover:text-black transition-all text-brand-gold">
                              <Rocket className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

          {/* Sidebar Chat */}
          <div className="w-[500px] flex flex-col gap-4">
            <div className="flex-1 min-h-0 bg-black/60 backdrop-blur-xl rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl">
            <TwitchChat 
              channelName={activeChannel} 
              messages={messages}
              isConnected={isConnected}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Credits */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
        <p className="text-brand-gold/40 text-sm font-mono flex items-center justify-center gap-2" dir="ltr">
          <span>Done by:</span>
          <span className="text-brand-gold/60 font-bold">iRozQ8</span>
          <span>•</span>
          <span className="text-brand-gold/60 font-bold">iSari9</span>
          <span>•</span>
          <span className="text-brand-gold/60 font-bold">iMythQ8</span>
        </p>
      </div>
    </div>
  );
}
