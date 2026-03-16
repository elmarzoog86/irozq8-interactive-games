import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, Users, ArrowLeft, ArrowRight, BrainCircuit, Timer, CheckCircle2, Crown, MessageSquare, MessageSquareOff, Tag, Lightbulb } from 'lucide-react';

interface Player {
  username: string;
  score: number;
  avatar: string;
}

interface Item {
  text: string;
  image: string;
}

interface Round {
  answer: string[];
  items: Item[];
}

const ROUNDS: Round[] = [
  {
    answer: ['فواكه', 'فاكهة', 'فواكة'],
    items: [
      { text: 'تفاح', image: '🍎' },
      { text: 'برتقال', image: '🍊' },
      { text: 'موز', image: '🍌' }
    ]
  },
  {
    answer: ['تواصل اجتماعي', 'سوشيال ميديا', 'برامج', 'تطبيقات'],
    items: [
      { text: 'تويتر', image: '🐦' },
      { text: 'يوتيوب', image: '▶️' },
      { text: 'انستغرام', image: '📷' }
    ]
  },
  {
    answer: ['عملات', 'عملة', 'فلوس', 'اموال', 'مال'],
    items: [
      { text: 'دولار', image: '💵' },
      { text: 'يورو', image: '💶' },
      { text: 'بتكوين', image: '🪙' }
    ]
  },
  {
    answer: ['عواصم', 'عاصمة', 'مدن', 'مدينة'],
    items: [
      { text: 'لندن', image: '🎡' },
      { text: 'باريس', image: '🗼' },
      { text: 'طوكيو', image: '🗻' }
    ]
  },
  {
    answer: ['مطاعم', 'وجبات سريعة', 'فاست فود'],
    items: [
      { text: 'برجر', image: '🍔' },
      { text: 'بطاطس', image: '🍟' },
      { text: 'بيتزا', image: '🍕' }
    ]
  },
  {
    answer: ['كواكب', 'كوكب', 'فضاء'],
    items: [
      { text: 'المريخ', image: '🪐' },
      { text: 'القمر', image: '🌕' },
      { text: 'الارض', image: '🌍' }
    ]
  },
  {
    answer: ['مركبات', 'سيارات', 'مواصلات', 'وسائل نقل'],
    items: [
      { text: 'سيارة', image: '🚗' },
      { text: 'دراجة', image: '🚲' },
      { text: 'قطار', image: '🚆' }
    ]
  },
  {
    answer: ['حيوانات', 'حيوان', 'حيوانات اليفة'],
    items: [
      { text: 'قطة', image: '🐱' },
      { text: 'كلب', image: '🐶' },
      { text: 'ارنب', image: '🐰' }
    ]
  },
  {
    answer: ['رياضات', 'رياضة', 'العاب رياضية'],
    items: [
      { text: 'كرة قدم', image: '⚽' },
      { text: 'سلة', image: '🧺' },
      { text: 'تنس', image: '🎾' }
    ]
  },
  {
    answer: ['ملابس', 'ملبس', 'ازياء', 'أزياء'],
    items: [
      { text: 'قميص', image: '👕' },
      { text: 'بنطال', image: '👖' },
      { text: 'حذاء', image: '👞' }
    ]
  },
  {
    answer: ['مشروبات', 'مشروب', 'سوائل'],
    items: [
      { text: 'قهوة', image: '☕' },
      { text: 'شاي', image: '🍵' },
      { text: 'عصير', image: '🧃' }
    ]
  },
  {
    answer: ['ادوات مدرسية', 'مدرسة', 'قرطاسية', 'أدوات مكتبية'],
    items: [
      { text: 'قلم', image: '✏️' },
      { text: 'دفتر', image: '📓' },
      { text: 'شنطة', image: '🎒' }
        ]
  },
  {
    answer: ['الوان', 'لون', 'ألوان'],
    items: [
      { text: 'احمر', image: '🔴' },
      { text: 'ازرق', image: '🔵' },
      { text: 'اخضر', image: '🟢' }
    ]
  },
  {
    answer: ['طيور', 'طير', 'عصافير'],
    items: [
      { text: 'نسر', image: '🦅' },
      { text: 'ببغاء', image: '🦜' },
      { text: 'حمامة', image: '🕊️' }
    ]
  },
  {
    answer: ['اجهزة كهربائية', 'الكترونيات', 'كهربائيات', 'اجهزة منزلية'],
    items: [
      { text: 'ثلاجة', image: '🧊' },
      { text: 'غسالة', image: '🧺' },
      { text: 'تلفاز', image: '📺' }
    ]
  },
  {
    answer: ['حشرات', 'حشرة', 'بقيات'],
    items: [
      { text: 'نملة', image: '🐜' },
      { text: 'نحلة', image: '🐝' },
      { text: 'فраشة', image: '🦋' }
    ]
  },
  {
    answer: ['اعضاء الجسم', 'جسم', 'اعضاء'],
    items: [
      { text: 'عين', image: '👁️' },
      { text: 'قلب', image: '❤️' },
      { text: 'يد', image: '✋' }
    ]
  },
  {
    answer: ['اسلحة', 'سلاح'],
    items: [
      { text: 'سيف', image: '🗡️' },
      { text: 'بندقية', image: '🔫' },
      { text: 'قنبلة', image: '💣' }
    ]
  },
  {
    answer: ['الات موسيقية', 'موسيقى', 'معازف', 'آلات موسيقية'],
    items: [
      { text: 'عود', image: '🪵' },
      { text: 'بيانو', image: '🎹' },
      { text: 'جيتار', image: '🎸' }
    ]
  },
  {
    answer: ['مهن', 'وظائف', 'عمل', 'شغل'],
    items: [
      { text: 'طبيب', image: '👨‍⚕️' },
      { text: 'معلم', image: '👨‍🏫' },
      { text: 'مهندس', image: '👷' }
    ]
  },
  {
    answer: ['العاب فيديو', 'قيمنق', 'العاب', 'بلايستيشن', 'اكس بوكس'],
    items: [
      { text: 'ماينكرافت', image: '🧱' },
      { text: 'فيفا', image: '⚽' },
      { text: 'فورتنايت', image: '🎮' }
    ]
  },
  {
    answer: ['اوقات', 'زمن', 'وقت', 'فصول', 'فترات'],
    items: [
      { text: 'صباح', image: '🌅' },
      { text: 'مساء', image: '🌇' },
      { text: 'ليل', image: '🌃' }
    ]
  },
  {
    answer: ['بحار', 'محيطات', 'مسطحات مائية', 'ماء'],
    items: [
      { text: 'البحر الاحمر', image: '🌊' },
      { text: 'البحر المتوسط', image: '⛵' },
      { text: 'المحيط الاطلسي', image: '🐋' }
    ]
  },
  {
    answer: ['معالم سياحية', 'معالم', 'سياحة', 'اماكن'],
    items: [
      { text: 'الاهرامات', image: '🔺' },
      { text: 'سور الصين', image: '🧱' },
      { text: 'ساعة بيغ بن', image: '🕐' }
    ]
  },
  {
    answer: ['مكسرات', 'تسالي', 'حبوب'],
    items: [
      { text: 'لوز', image: '🥜' },
      { text: 'فستق', image: '🥜' },
      { text: 'كاجو', image: '🥜' }
    ]
  },
  {
    answer: ['لغات', 'لغة', 'لهجات', 'كلام'],
    items: [
      { text: 'انجليزي', image: '🇬🇧' },
      { text: 'عربي', image: '🇸🇦' },
      { text: 'فرنسي', image: '🇫🇷' }
    ]
  },
  {
    answer: ['ادوات طعام', 'مطبخ', 'مواعين', 'اواني'],
    items: [
      { text: 'ملعقة', image: '🥄' },
      { text: 'شوكة', image: '🍴' },
      { text: 'سكين', image: '🔪' }
    ]
  },
  {
    answer: ['اشجار', 'شجر', 'نباتات', 'نبات'],
    items: [
      { text: 'نخلة', image: '🌴' },
      { text: 'شجرة تفاح', image: '🌳' },
      { text: 'صبار', image: '🌵' }
    ]
  },
  {
    answer: ['مشاعر', 'احاسيس', 'عواطف', 'شعور'],
    items: [
      { text: 'فرح', image: '😊' },
      { text: 'حزن', image: '😢' },
      { text: 'غضب', image: '😠' }
    ]
  },
  {
    answer: ['ألوان', 'الوان', 'لون'],
    items: [
      { text: 'أحمر', image: '🔴' },
      { text: 'أزرق', image: '🔵' },
      { text: 'أخضر', image: '🟢' }
    ]
  },
  {
    answer: ['حيوانات', 'حيوان', 'كائنات'],
    items: [
      { text: 'أسد', image: '🦁' },
      { text: 'فيل', image: '🐘' },
      { text: 'زرافة', image: '🦒' }
    ]
  },
  {
    answer: ['رياضات', 'رياضة', 'لعبة', 'ألعاب'],
    items: [
      { text: 'كرة قدم', image: '⚽' },
      { text: 'كرة سلة', image: '🏀' },
      { text: 'تنس', image: '🎾' }
    ]
  },
  {
    answer: ['كواكب', 'كوكب', 'فضاء'],
    items: [
      { text: 'الأرض', image: '🌍' },
      { text: 'المريخ', image: '🪐' },
      { text: 'المشتري', image: '🪐' }
    ]
  },
  {
    answer: ['حواس', 'حاسة'],
    items: [
      { text: 'عين', image: '👁️' },
      { text: 'أذن', image: '👂' },
      { text: 'أنف', image: '👃' }
    ]
  },
  {
    answer: ['وظائف', 'مهن', 'مهنة', 'وظيفة', 'عمل'],
    items: [
      { text: 'طبيب', image: '👨‍⚕️' },
      { text: 'معلم', image: '👨‍🏫' },
      { text: 'مهندس', image: '👷' }
    ]
  },
  {
    answer: ['مشروبات', 'مشروب', 'سوائل'],
    items: [
      { text: 'قهوة', image: '☕' },
      { text: 'شاي', image: '🍵' },
      { text: 'عصير', image: '🧃' }
    ]
  },
  {
    answer: ['سيارات', 'مركبات', 'سيارة'],
    items: [
      { text: 'تويوتا', image: '🚙' },
      { text: 'انفنتي', image: '♾️' },
      { text: 'نيسان', image: '🚘' }
    ]
  },
  {
    answer: ['ملابس', 'كسوة', 'لبس', 'هدوم'],
    items: [
      { text: 'قميص', image: '👕' },
      { text: 'بنطلون', image: '👖' },
      { text: 'حذاء', image: '👞' }
    ]
  },
  {
    answer: ['أدوات مدرسية', 'قرطاسية', 'مدرسة'],
    items: [
      { text: 'قلم', image: '✏️' },
      { text: 'دفتر', image: '📓' },
      { text: 'ممحاة', image: '🧹' }
    ]
  },
  {
    answer: ['معادن', 'معدن'],
    items: [
      { text: 'ذهب', image: '🥇' },
      { text: 'فضة', image: '🥈' },
      { text: 'حديد', image: '⚓' }
    ]
  },
  {
    answer: ['أثاث', 'مفروشات', 'اثاث'],
    items: [
      { text: 'سرير', image: '🛌' },
      { text: 'طاولة', image: '🪑' },
      { text: 'كرسي', image: '🪑' }
    ]
  },
  {
    answer: ['فصول السنة', 'فصول', 'فصل'],
    items: [
      { text: 'شتاء', image: '❄️' },
      { text: 'صيف', image: '☀️' },
      { text: 'ربيع', image: '🌸' }
    ]
  },
  {
    answer: ['أدوات مطبخ', 'مطبخ', 'اواني', 'أواني'],
    items: [
      { text: 'سكين', image: '🔪' },
      { text: 'ملعقة', image: '🥄' },
      { text: 'شوكة', image: '🍴' }
    ]
  },
  {
    answer: ['طيور', 'طائر', 'عصافير'],
    items: [
      { text: 'صقر', image: '🦅' },
      { text: 'حمامة', image: '🕊️' },
      { text: 'نسر', image: '🦅' }
    ]
  },
  {
    answer: ['وسائل نقل', 'مواصلات', 'نقل', 'مواصلة'],
    items: [
      { text: 'طائرة', image: '✈️' },
      { text: 'قطار', image: '🚆' },
      { text: 'سفينة', image: '🚢' }
    ]
  },
  {
    answer: ['أجهزة كهرابئية', 'اجهزة', 'أجهزة', 'الكترونيات', 'كهربائيات'],
    items: [
      { text: 'تلفاز', image: '📺' },
      { text: 'ثلاجة', image: '🧊' },
      { text: 'غسالة', image: '🧺' }
    ]
  },
  {
    answer: ['زهور', 'زهرة', 'ورد', 'ورود'],
    items: [
      { text: 'ياسمين', image: '🌼' },
      { text: 'جوري', image: '🌹' },
      { text: 'توليب', image: '🌷' }
    ]
  },
  {
    answer: ['لغات', 'لغة', 'لهجات'],
    items: [
      { text: 'عربية', image: '🇸🇦' },
      { text: 'إنجليزية', image: '🇬🇧' },
      { text: 'فرنسية', image: '🇫🇷' }
    ]
  },
  {
    answer: ['أدوات موسيقية', 'آلات موسيقية', 'موسيقى', 'الات'],
    items: [
      { text: 'عود', image: '🪵' },
      { text: 'بيانو', image: '🎹' },
      { text: 'جيتار', image: '🎸' }
    ]
  }
]

// Shuffle rounds helper
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

interface Props {
  messages: any[];
  onLeave: () => void;
  channelName: string;
}

type Phase = 'lobby' | 'countdown' | 'playing' | 'round_winner' | 'game_over';


export function MissingLinkGame({ messages, onLeave, channelName }: Props) {
  const [phase, setPhase] = useState<Phase>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameRounds, setGameRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [roundWinner, setRoundWinner] = useState<Player | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [maxRounds, setMaxRounds] = useState(5);


  const processedMessageIds = useRef<Set<string>>(new Set());

  // Handle Lobby Joins
  useEffect(() => {
    if (phase === 'lobby') {
      messages.forEach(async msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          
          if (text === '!join' || text === 'join') {
            setPlayers(prev => {
              if (prev.find(p => p.username === msg.username)) return prev;
              const newPlayer = {
                username: msg.username,
                score: 0,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.username}`
              };
              
              // Async fetch actual avatar
              fetch(`https://decapi.me/twitch/avatar/${msg.username}`)
                .then(res => res.text())
                .then(avatar => {
                  if (avatar && avatar.startsWith('http')) {
                    setPlayers(currentPlayers => 
                      currentPlayers.map(p => p.username === msg.username ? { ...p, avatar } : p)
                    );
                  }
                }).catch(() => {});

              return [...prev, newPlayer];
            });
          }
        }
      });
    }
  }, [messages, phase]);

  // Handle Gameplay chat
  useEffect(() => {
    if (phase === 'playing' && gameRounds.length > 0) {
      const currentRound = gameRounds[currentRoundIndex];
      
      messages.forEach(msg => {
        if (!processedMessageIds.current.has(msg.id)) {
          processedMessageIds.current.add(msg.id);
          const text = msg.message.trim().toLowerCase();
          
          // Check if user is in players list
          const playerIndex = players.findIndex(p => p.username === msg.username);
          if (playerIndex === -1) return;

          // Check answer
          const isCorrect = currentRound.answer.some(ans => text === ans || text.includes(ans));
          
          if (isCorrect) {
            const winnerArr = [...players];
            winnerArr[playerIndex].score += 1;
            setPlayers(winnerArr);
            setRoundWinner(winnerArr[playerIndex]);
            setPhase('round_winner');
            setShowHint(false);
            
            setTimeout(() => {
              if (currentRoundIndex + 1 >= gameRounds.length) {
                setPhase('game_over');
              } else {
                setCurrentRoundIndex(prev => prev + 1);
                setPhase('countdown');
              }
            }, 4000);
          }
        }
      });
    }
  }, [messages, phase, gameRounds, currentRoundIndex, players]);

  // Countdown logic
  useEffect(() => {
    if (phase === 'countdown') {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase('playing');
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const startGame = () => {
    if (players.length === 0) return;
    setGameRounds(shuffleArray(ROUNDS).slice(0, maxRounds)); // Play selected rounds
    setPhase('countdown');
  };

  const getWinner = () => {
    if (players.length === 0) return null;
    return [...players].sort((a, b) => b.score - a.score)[0];
  };

  return (
    <div className="flex h-full w-full max-w-[1600px] mx-auto gap-6 p-6 font-arabic" dir="rtl">
      {/* Main Game Area */}
      <div className="flex-1 bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="h-20 border-b border-brand-cyan/10 flex items-center justify-between px-8 bg-brand-black/20">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">
              الرابط <span className="text-brand-pink">العجيب</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 font-bold ${
                showChat 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              }`}
            >
              {showChat ? (
                <><MessageSquareOff className="w-5 h-5" /> إخفاء الشات</>
              ) : (
                <><MessageSquare className="w-5 h-5" /> إظهار الشات</>
              )}
            </button>
            <button onClick={onLeave} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6 text-white/50 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            {phase === 'lobby' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center max-w-2xl"
              >
                <div className="w-32 h-32 bg-brand-indigo/10 rounded-3xl flex items-center justify-center border-2 border-brand-indigo mb-8 shadow-[0_0_50px_rgba(0, 229, 255,0.2)]">
                  <BrainCircuit className="w-16 h-16 text-brand-pink" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">ابحث عن الرابط المشترك!</h1>
                
                <div className="bg-brand-pink/5 border border-brand-cyan/20 rounded-2xl p-6 text-right mb-8 w-full">
                    <h3 className="text-xl font-bold text-brand-cyan mb-3 flex items-center gap-2">
                          <Tag className="w-5 h-5" /> كيف تلعب؟
                      </h3>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                          <li>1. اكتب <span className="text-brand-pink font-bold">!join</span> لدخول الردهة الآن.</li>
                          <li>2. ستظهر مجموعة من الكلمات والصور على الشاشة تبدو مختلفة (3 صور).</li>
                          <li>3. فكر بسرعة! ما هو <span className="text-brand-pink font-bold">الرابط العجيب التصنيفي أو المشترك</span> بينهم؟</li>
                          <li>4. أول شخص يكتب الإجابة المطلوبة الصحيحة في الشات سيفوز بنقطة الجولة!</li>
                      </ul>
                  </div>
                
                <div className="flex items-center gap-6 mb-12">
                  <div className="bg-brand-black/50 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">    
                    <span className="text-3xl font-black text-brand-pink mb-1">{players.length}</span>
                    <span className="text-sm font-bold text-zinc-500">عدد اللاعبين</span>
                  </div>
                  
                  <div className="bg-brand-black/50 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">    
                    <div className="flex items-center gap-4 mb-1">
                      <button 
                        onClick={() => setMaxRounds(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="text-3xl font-black text-brand-pink min-w-[2rem] text-center">{maxRounds}</span>
                      <button 
                        onClick={() => setMaxRounds(prev => Math.min(ROUNDS.length, prev + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-zinc-500">عدد الجولات</span>
                  </div>
                </div>                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    disabled={players.length === 0}
                    className="bg-brand-pink hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-brand-black font-black px-12 py-5 rounded-2xl text-xl transition-all shadow-lg flex items-center gap-3"
                  >
                    <Play className="w-6 h-6" /> ابدأ اللعبة
                  </button>
                </div>
              </motion.div>
            )}

            {phase === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <h2 className="text-3xl font-bold text-zinc-400 mb-8">الجولة {currentRoundIndex + 1}</h2>
                <div className="text-9xl font-black text-brand-cyan drop-shadow-[0_0_30px_rgba(0, 229, 255,0.5)]">
                  {countdown}
                </div>
              </motion.div>
            )}

            {phase === 'playing' && gameRounds[currentRoundIndex] && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center w-full"
              >
                <div className="bg-brand-indigo/10 px-6 py-2 rounded-xl border border-brand-indigo/30 text-brand-cyan font-black mb-12 animate-pulse flex items-center gap-2">
                  <Timer className="w-5 h-5" /> أسرع واكتب في الشات!
                </div>
                
                <div className="flex flex-wrap justify-center gap-8 w-full max-w-5xl">
                  {gameRounds[currentRoundIndex].items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-zinc-900 border-2 border-white/10 rounded-3xl overflow-hidden flex flex-col w-64 shadow-2xl"
                    >
                      <div className="h-48 w-full relative bg-brand-black/50 flex items-center justify-center overflow-hidden">
                        {!item.image.startsWith('http') ? (
                            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                <span className="text-[120px] drop-shadow-2xl select-none leading-none">{item.image}</span>
                            </div>
                          ) : (
                            <img
                              src={item.image}
                              alt={item.text}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl text-white">⚠️</span>';
                              }}
                            />
                          )}
                      </div>
                      <div className="p-4 bg-zinc-900 text-center border-t border-white/10">
                        <span className="text-2xl font-black text-white">{item.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Hint System */}
                <div className="mt-12 flex flex-col items-center">
                  {!showHint ? (
                    <button
                      onClick={() => setShowHint(true)}
                      className="bg-brand-indigo/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-indigo/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                    >
                      <Lightbulb className="w-5 h-5" /> إظهار تلميح
                    </button>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/10 border border-white/20 px-8 py-4 rounded-2xl text-center"
                    >
                      <p className="text-zinc-400 text-sm mb-2">عدد الأحرف المكونة للكلمة:</p>
                      <div className="flex gap-2 justify-center" dir="ltr">
                        {gameRounds[currentRoundIndex].answer[0].split('').map((char, i) => (
                          <div key={i} className="w-8 h-10 border-b-2 border-brand-cyan flex items-center justify-center text-xl font-bold bg-brand-black/50 rounded-t-sm">
                            {char === ' ' ? ' ' : ''}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

              </motion.div>
            )}

            {phase === 'round_winner' && roundWinner && currentRoundIndex < gameRounds.length && (
              <motion.div
                key="round_winner"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center text-center bg-brand-black/80 p-12 rounded-[40px] border-2 border-brand-cyan shadow-[0_0_50px_rgba(0, 229, 255,0.2)]"
              >
                <h2 className="text-3xl font-bold text-white mb-6">الرابط هو: <span className="text-brand-pink font-black">{gameRounds[currentRoundIndex].answer[0]}</span></h2>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-brand-cyan overflow-hidden mb-6 mx-auto shadow-2xl relative z-10">
                    <img src={roundWinner.avatar} alt={roundWinner.username} className="w-full h-full object-cover" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -bottom-4 -right-4 bg-brand-cyan text-brand-black p-3 rounded-full border-4 border-black z-20"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{roundWinner.username}</h3>
                <p className="text-brand-cyan font-bold text-xl">أول من أجاب بشكل صحيح! +1 نقطة</p>
              </motion.div>
            )}

            {phase === 'game_over' && (
              <motion.div
                key="game_over"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center max-w-2xl bg-brand-black/80 p-12 rounded-[40px] border border-brand-cyan/30"
              >
                <Trophy className="w-32 h-32 text-brand-indigo mb-8 drop-shadow-[0_0_30px_rgba(0, 229, 255,0.5)]" />
                <h1 className="text-5xl font-black text-white mb-4">انتهت اللعبة!</h1>
                {getWinner() ? (
                  <>
                    <h2 className="text-3xl font-bold text-zinc-300 mb-8">الفائز الأول</h2>
                    <div className="w-40 h-40 rounded-full border-[6px] border-brand-cyan overflow-hidden mb-6 mx-auto shadow-[0_0_50px_rgba(0, 229, 255,0.4)] relative">
                       <img src={getWinner()?.avatar} alt={getWinner()?.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-5xl font-black text-brand-pink mb-2">{getWinner()?.username}</div>
                    <div className="text-2xl text-white font-bold bg-white/10 px-6 py-2 rounded-xl inline-block">{getWinner()?.score} نقاط</div>
                  </>
                ) : (
                  <p className="text-2xl text-zinc-400">لا يوجد فائزين</p>
                )}
                <button
                  onClick={() => {
                    setPlayers([]);
                    setPhase('lobby');
                  }}
                  className="mt-12 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all text-lg flex items-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" /> عودة للردهة
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sidebar Leaderboard */}
      <div className={`w-[350px] flex flex-col gap-4 transition-all duration-300 ${!showChat ? 'w-[500px]' : ''}`}>
        <div className="bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <Users className="w-6 h-6 text-brand-cyan" />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-brand-cyan to-yellow-200">
              اللاعبين والمراكز
            </span>
          </h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 relative z-10">
            {[...players].sort((a,b) => b.score - a.score).map((p, i) => (
              <motion.div 
                layout
                key={p.username} 
                className={`p-3 rounded-2xl flex items-center gap-4 border transition-all ${
                  i === 0 && p.score > 0
                    ? 'bg-brand-indigo/10 border-brand-indigo shadow-[0_0_15px_rgba(0, 229, 255,0.1)]' 
                    : 'bg-brand-black/40 border-white/5'
                }`}
              >
                <div className={`font-black text-lg w-6 text-center ${i === 0 && p.score > 0 ? 'text-brand-cyan' : 'text-zinc-500'}`}>
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 relative ${i===0 && p.score > 0 ? 'border-brand-cyan' : 'border-white/10'}`}>
                  <img src={p.avatar} alt="avatar" className="w-full h-full object-cover" />
                  {i === 0 && p.score > 0 && (
                    <div className="absolute -top-2 -right-2 text-brand-cyan drop-shadow-md">
                      <Crown className="w-5 h-5 fill-brand-cyan" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{p.username}</div>
                  <div className="text-brand-cyan/70 text-xs font-bold mt-0.5">{p.score} نقاط</div>
                </div>
              </motion.div>
            ))}
            
            {players.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 opacity-50">
                <Users className="w-12 h-12 mb-4" />
                <p>لا يوجد لاعبين</p>
                <p className="text-xs mt-1">بانتظار انضمام اللاعبين...</p>
              </div>
            )}
          </div>
        </div>

        {showChat && (
          <div className="h-[400px] bg-brand-black/80 rounded-[40px] border border-brand-cyan/20 overflow-hidden shadow-2xl relative flex flex-col pt-16">
            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-brand-black/80 to-transparent z-10 flex items-center px-6">
              <MessageSquare className="w-5 h-5 text-brand-cyan ml-2" />
              <span className="text-white font-bold">الشات المباشر</span>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col-reverse p-4 pt-20 custom-scrollbar relative z-0">
              <AnimatePresence>
                {messages.slice().reverse().map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="mb-3 bg-white/5 rounded-2xl p-3 border border-white/5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-brand-cyan/20 flex items-center justify-center text-xs relative">
                        <img 
                          src={`https://decapi.me/twitch/avatar/${msg.username}`} 
                          alt={msg.username}
                          className="w-full h-full object-cover absolute inset-0 z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span className="relative z-0">{msg.username.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: msg.color || '#fff' }}>
                        {msg.username}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm pl-8 font-arabic break-words">{msg.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
