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
      { text: 'تفاح', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/500px-Pink_lady_and_cross_section.jpg' },
      { text: 'برتقال', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/500px-Oranges_-_whole-halved-segment.jpg' },
      { text: 'موز', image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Bananavarieties.jpg' }
    ]
  },
  {
    answer: ['تواصل اجتماعي', 'سوشيال ميديا', 'برامج', 'تطبيقات'],
    items: [
      { text: 'تويتر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/X_%28formerly_Twitter%29_logo_late_2025.svg/500px-X_%28formerly_Twitter%29_logo_late_2025.svg.png' },
      { text: 'يوتيوب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Youtube_interface%2C_showing_search_results_of_Burger_Recipe.png/500px-Youtube_interface%2C_showing_search_results_of_Burger_Recipe.png' },
      { text: 'انستغرام', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/500px-Instagram_logo_2022.svg.png' }
    ]
  },
  {
    answer: ['عملات', 'عملة', 'فلوس', 'اموال', 'مال'],
    items: [
      { text: 'دولار', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/USDnotesNew.png/500px-USDnotesNew.png' },
      { text: 'يورو', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Flag_of_Europe.svg/500px-Flag_of_Europe.svg.png' },
      { text: 'بتكوين', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/500px-Bitcoin.svg.png' }
    ]
  },
  {
    answer: ['عواصم', 'عاصمة', 'مدن', 'مدينة'],
    items: [
      { text: 'لندن', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/London_Skyline_%28125508655%29.jpeg/500px-London_Skyline_%28125508655%29.jpeg' },
      { text: 'باريس', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/500px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg' },
      { text: 'طوكيو', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/500px-Skyscrapers_of_Shinjuku_2009_January.jpg' }
    ]
  },
  {
    answer: ['مطاعم', 'وجبات سريعة', 'فاست فود'],
    items: [
      { text: 'برجر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/RedDot_Burger.jpg/500px-RedDot_Burger.jpg' },
      { text: 'بطاطس', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/French_Fries.JPG/500px-French_Fries.JPG' },
      { text: 'بيتزا', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/500px-Pizza-3007395.jpg' }
    ]
  },
  {
    answer: ['كواكب', 'كوكب', 'فضاء'],
    items: [
      { text: 'المريخ', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png/500px-Mars_-_August_30_2021_-_Flickr_-_Kevin_M._Gill.png' },
      { text: 'القمر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/500px-FullMoon2010.jpg' },
      { text: 'الارض', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Meteosat-12-after-eqnx_04-b.jpg/500px-Meteosat-12-after-eqnx_04-b.jpg' }
    ]
  },
  {
    answer: ['مركبات', 'سيارات', 'مواصلات', 'وسائل نقل'],
    items: [
      { text: 'سيارة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/1925_Ford_Model_T_touring.jpg/500px-1925_Ford_Model_T_touring.jpg' },
      { text: 'دراجة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Left_side_of_Flying_Pigeon.jpg/500px-Left_side_of_Flying_Pigeon.jpg' },
      { text: 'قطار', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/%D0%9F%D0%BE%D0%B5%D0%B7%D0%B4_%D0%BD%D0%B0_%D1%84%D0%BE%D0%BD%D0%B5_%D0%B3%D0%BE%D1%80%D1%8B_%D0%A8%D0%B0%D1%82%D1%80%D0%B8%D1%89%D0%B5._%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6%D1%81%D0%BA%D0%B0%D1%8F_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C.jpg/500px-%D0%9F%D0%BE%D0%B5%D0%B7%D0%B4_%D0%BD%D0%B0_%D1%84%D0%BE%D0%BD%D0%B5_%D0%B3%D0%BE%D1%80%D1%8B_%D0%A8%D0%B0%D1%82%D1%80%D0%B8%D1%89%D0%B5._%D0%92%D0%BE%D1%80%D0%BE%D0%BD%D0%B5%D0%B6%D1%81%D0%BA%D0%B0%D1%8F_%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C.jpg' }
    ]
  },
  {
    answer: ['حيوانات', 'حيوان', 'حيوانات اليفة'],
    items: [
      { text: 'قطة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Cat_August_2010-4.jpg/500px-Cat_August_2010-4.jpg' },
      { text: 'كلب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Huskiesatrest.jpg/500px-Huskiesatrest.jpg' },
      { text: 'ارنب', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Oryctolagus_cuniculus_Rcdo.jpg/500px-Oryctolagus_cuniculus_Rcdo.jpg' }
    ]
  },
  {
    answer: ['رياضات', 'رياضة', 'العاب رياضية'],
    items: [
      { text: 'كرة قدم', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Football_in_Bloomington%2C_Indiana%2C_1995.jpg/500px-Football_in_Bloomington%2C_Indiana%2C_1995.jpg' },
      { text: 'سلة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Steph_Curry_%2851915116957%29.jpg/500px-Steph_Curry_%2851915116957%29.jpg' },
      { text: 'تنس', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/2013_Australian_Open_-_Guillaume_Rufin.jpg/500px-2013_Australian_Open_-_Guillaume_Rufin.jpg' }
    ]
  },
  {
    answer: ['ملابس', 'ملبس', 'ازياء', 'أزياء'],
    items: [
      { text: 'قميص', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Leipzig2012.jpg/500px-Leipzig2012.jpg' },
      { text: 'بنطال', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Trousers-colourisolated.jpg/500px-Trousers-colourisolated.jpg' },
      { text: 'حذاء', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Skor_fr%C3%A5n_1700-_till_1960-talet_-_Nordiska_Museet_-_NMA.0056302.jpg/500px-Skor_fr%C3%A5n_1700-_till_1960-talet_-_Nordiska_Museet_-_NMA.0056302.jpg' }
    ]
  },
  {
    answer: ['مشروبات', 'مشروب', 'سوائل'],
    items: [
      { text: 'قهوة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/500px-Latte_and_dark_coffee.jpg' },
      { text: 'شاي', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Longjing_tea_steeping_in_gaiwan.jpg/500px-Longjing_tea_steeping_in_gaiwan.jpg' },
      { text: 'عصير', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Orange_juice_1.jpg/500px-Orange_juice_1.jpg' }
    ]
  },
  {
    answer: ['ادوات مدرسية', 'مدرسة', 'قرطاسية', 'أدوات مكتبية'],
    items: [
      { text: 'قلم', image: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Carandache_Ecridor.jpg' },
      { text: 'دفتر', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Notebooks.jpg/500px-Notebooks.jpg' },
      { text: 'شنطة', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Rucksack1.jpg/500px-Rucksack1.jpg' }
        ]
  },
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
      <div className="flex-1 bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header */}
        <div className="h-20 border-b border-brand-gold/10 flex items-center justify-between px-8 bg-black/20">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter">
              الرابط <span className="text-brand-gold">العجيب</span>
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
                <div className="w-32 h-32 bg-brand-gold/10 rounded-3xl flex items-center justify-center border-2 border-brand-gold mb-8 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                  <BrainCircuit className="w-16 h-16 text-brand-gold" />
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tight">ابحث عن الرابط المشترك!</h1>
                
                <div className="bg-brand-gold/5 border border-brand-gold/20 rounded-2xl p-6 text-right mb-8 w-full">
                    <h3 className="text-xl font-bold text-brand-gold mb-3 flex items-center gap-2">
                          <Tag className="w-5 h-5" /> كيف تلعب؟
                      </h3>
                      <ul className="text-zinc-300 space-y-2 text-sm">
                          <li>1. اكتب <span className="text-brand-gold font-bold">!join</span> لدخول الردهة الآن.</li>
                          <li>2. ستظهر مجموعة من الكلمات والصور على الشاشة تبدو مختلفة (3 صور).</li>
                          <li>3. فكر بسرعة! ما هو <span className="text-brand-gold font-bold">الرابط العجيب التصنيفي أو المشترك</span> بينهم؟</li>
                          <li>4. أول شخص يكتب الإجابة المطلوبة الصحيحة في الشات سيفوز بنقطة الجولة!</li>
                      </ul>
                  </div>
                
                <div className="flex items-center gap-6 mb-12">
                  <div className="bg-black/50 border border-white/10 px-8 py-4 rounded-2xl flex flex-col items-center">
                    <span className="text-3xl font-black text-brand-gold mb-1">{players.length}</span>
                    <span className="text-sm font-bold text-zinc-500">عدد اللاعبين</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={startGame}
                    disabled={players.length === 0}
                    className="bg-brand-gold hover:bg-brand-gold-light disabled:opacity-50 disabled:cursor-not-allowed text-black font-black px-12 py-5 rounded-2xl text-xl transition-all shadow-lg flex items-center gap-3"
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
                <div className="text-9xl font-black text-brand-gold drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]">
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
                <div className="bg-brand-gold/10 px-6 py-2 rounded-xl border border-brand-gold/30 text-brand-gold font-black mb-12 animate-pulse flex items-center gap-2">
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
                      <div className="h-48 w-full relative bg-black/50 flex items-center justify-center overflow-hidden">
                        <img 
                            src={item.image} 
                            alt={item.text} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl">❓</span>';
                            }}
                        />
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
                      className="bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
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
                          <div key={i} className="w-8 h-10 border-b-2 border-brand-gold flex items-center justify-center text-xl font-bold bg-black/50 rounded-t-sm">
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
                className="flex flex-col items-center text-center bg-black/80 p-12 rounded-[40px] border-2 border-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.2)]"
              >
                <h2 className="text-3xl font-bold text-white mb-6">الرابط هو: <span className="text-brand-gold font-black">{gameRounds[currentRoundIndex].answer[0]}</span></h2>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-brand-gold overflow-hidden mb-6 mx-auto shadow-2xl relative z-10">
                    <img src={roundWinner.avatar} alt={roundWinner.username} className="w-full h-full object-cover" />
                  </div>
                  <motion.div 
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="absolute -bottom-4 -right-4 bg-brand-gold text-black p-3 rounded-full border-4 border-black z-20"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                </div>
                <h3 className="text-4xl font-black text-white mb-2">{roundWinner.username}</h3>
                <p className="text-brand-gold font-bold text-xl">أول من أجاب بشكل صحيح! +1 نقطة</p>
              </motion.div>
            )}

            {phase === 'game_over' && (
              <motion.div
                key="game_over"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center text-center max-w-2xl bg-black/80 p-12 rounded-[40px] border border-brand-gold/30"
              >
                <Trophy className="w-32 h-32 text-brand-gold mb-8 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
                <h1 className="text-5xl font-black text-white mb-4">انتهت اللعبة!</h1>
                {getWinner() ? (
                  <>
                    <h2 className="text-3xl font-bold text-zinc-300 mb-8">الفائز الأول</h2>
                    <div className="w-40 h-40 rounded-full border-[6px] border-brand-gold overflow-hidden mb-6 mx-auto shadow-[0_0_50px_rgba(212,175,55,0.4)] relative">
                       <img src={getWinner()?.avatar} alt={getWinner()?.username} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-5xl font-black text-brand-gold mb-2">{getWinner()?.username}</div>
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
        <div className="bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Trophy className="w-32 h-32" />
          </div>
          
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 relative z-10">
            <Users className="w-6 h-6 text-brand-gold" />
            <span className="bg-clip-text text-transparent bg-gradient-to-l from-brand-gold to-yellow-200">
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
                    ? 'bg-brand-gold/10 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'bg-black/40 border-white/5'
                }`}
              >
                <div className={`font-black text-lg w-6 text-center ${i === 0 && p.score > 0 ? 'text-brand-gold' : 'text-zinc-500'}`}>
                  {i + 1}
                </div>
                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden flex-shrink-0 relative ${i===0 && p.score > 0 ? 'border-brand-gold' : 'border-white/10'}`}>
                  <img src={p.avatar} alt="avatar" className="w-full h-full object-cover" />
                  {i === 0 && p.score > 0 && (
                    <div className="absolute -top-2 -right-2 text-brand-gold drop-shadow-md">
                      <Crown className="w-5 h-5 fill-brand-gold" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{p.username}</div>
                  <div className="text-brand-gold/70 text-xs font-bold mt-0.5">{p.score} نقاط</div>
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
          <div className="h-[400px] bg-black/80 rounded-[40px] border border-brand-gold/20 overflow-hidden shadow-2xl relative flex flex-col pt-16">
            <div className="absolute top-0 right-0 left-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-6">
              <MessageSquare className="w-5 h-5 text-brand-gold ml-2" />
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
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-brand-gold/20 flex items-center justify-center text-xs relative">
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
