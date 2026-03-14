import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Dices, Brain, Medal, Timer, Rocket, CheckCircle2, XCircle, ArrowRight, Play, Users } from 'lucide-react';

interface Message {
  id: string;
  username: string;
  message: string;
  color?: string;
}

interface Player {
  username: string;
  position: number;
  tokens: string[];
  score2: number;
  s1C?: number; s1W?: number; s1P?: number;
  s2C?: number; s2W?: number; s2P?: number;
  s3C?: number; s3W?: number; s3P?: number;
  s4C?: number; s4W?: number; s4P?: number;
  s5C?: number; s5W?: number; s5P?: number;
  totalPoints?: number;
  color: string;
  avatar?: string;
}interface TrivialPursuitGameProps {
  channelName: string;
  messages: Message[];
  onLeave: () => void;
}

const CATEGORIES = [
  { id: 'history', name: 'التاريخ', color: 'bg-indigo-900/50 border-indigo-500/50', icon: Trophy, tokenColor: 'bg-indigo-500', iconColor: 'text-indigo-400' },
  { id: 'science', name: 'العلوم', color: 'bg-emerald-900/50 border-emerald-500/50', icon: Brain, tokenColor: 'bg-emerald-500', iconColor: 'text-emerald-400' },
  { id: 'sports', name: 'الرياضة', color: 'bg-rose-900/50 border-rose-500/50', icon: Medal, tokenColor: 'bg-rose-500', iconColor: 'text-rose-400' },
  { id: 'entertainment', name: 'الترفيه', color: 'bg-amber-900/50 border-amber-500/50', icon: Rocket, tokenColor: 'bg-amber-500', iconColor: 'text-amber-400' },
];

const BOARD_SIZE = 24;
const BOARD_TILES = Array.from({ length: BOARD_SIZE }).map((_, i) => CATEGORIES[i % 4]);

const QUESTIONS: Record<string, {q: string, options: string[], a: number}[]> = {
  history: [
    { q: 'من هو مؤسس علم الجبر؟', options: ['الخوارزمي', 'ابن سينا', 'جابر بن حيان', 'الكندي'], a: 1 },
    { q: 'في أي عام بدأت الحرب العالمية الثانية؟', options: ['1935', '1939', '1941', '1945'], a: 2 },
    { q: 'عاصمة الدولة الأموية القديمة؟', options: ['الكوفة', 'بغداد', 'دمشق', 'القاهرة'], a: 3 },
    { q: 'ما هو الاسم القديم للمدينة المنورة؟', options: ['يثرب', 'بكة', 'صنعاء', 'مكة'], a: 1 },
    { q: 'من بنى مدينة القاهرة؟', options: ['صلاح الدين', 'جوهر الصقلي', 'قطز', 'عمرو بن العاص'], a: 2 },
    { q: 'مكتشف قارة أمريكا؟', options: ['فاسكو دا غاما', 'ماجلان', 'كولومبوس', 'جيمس كوك'], a: 3 },
    { q: 'من أين انطلقت الثورة الصناعية؟', options: ['فرنسا', 'بريطانيا', 'ألمانيا', 'أمريكا'], a: 2 },
    { q: 'الدولة التي أهدت تمثال الحرية لأمريكا؟', options: ['بريطانيا', 'ألمانيا', 'إيطاليا', 'فرنسا'], a: 4 },
    { q: 'أقدم مدينة مأهولة في التاريخ؟', options: ['دمشق', 'أريحا', 'القدس', 'بغداد'], a: 1 },
    { q: 'القائد المسلم الذي فتح الأندلس؟', options: ['طارق بن زياد', 'عقبة بن نافع', 'خالد بن الوليد', 'موسى بن نصير'], a: 1 }
  ],
  science: [
    { q: 'ما هو الكوكب الأحمر؟', options: ['الزهرة', 'المريخ', 'المشتري', 'عطارد'], a: 2 },
    { q: 'أثقل عضو في جسم الإنسان؟', options: ['القلب', 'الرئتان', 'الكبد', 'الدماغ'], a: 3 },
    { q: 'الغاز اللازم للتنفس؟', options: ['هيدروجين', 'نيتروجين', 'ثاني أكسيد الكربون', 'الأكسجين'], a: 4 },
    { q: 'أسرع حيوان بري في العالم؟', options: ['الفهد', 'الغزال', 'الأسد', 'النمر'], a: 1 },
    { q: 'ما هو العنصر الأكثر تواجداً في الكون؟', options: ['الأكسجين', 'الهيليوم', 'الهيدروجين', 'الكربون'], a: 3 },
    { q: 'وحدة قياس القوة؟', options: ['الجول', 'الواط', 'الكلفن', 'النيوتن'], a: 4 },
    { q: 'أبعد كوكب في مجموعتنا الشمسية؟', options: ['زحل', 'أورانوس', 'نبتون', 'بلوتو'], a: 3 },
    { q: 'مخترع المصباح الكهربائي؟', options: ['أينشتاين', 'تيسلا', 'توماس إديسون', 'ماري كوري'], a: 3 },
    { q: 'المادة المسؤولة عن لون الجلد؟', options: ['الميلانين', 'الكيراتين', 'الهيموغلوبين', 'الكولاجين'], a: 1 },
    { q: 'الفيتامين الذي يأخذه الجسم من أشعة الشمس؟', options: ['A', 'B', 'C', 'D'], a: 4 }
  ],
  sports: [
    { q: 'من فاز بكأس العالم 2022؟', options: ['فرنسا', 'البرازيل', 'الأرجنتين', 'ألمانيا'], a: 3 },
    { q: 'كم عدد لاعبي السلة للفرق الواحد بالملعب؟', options: ['5', '6', '7', '11'], a: 1 },
    { q: 'الدولة التي فازت بأول كأس عالم؟', options: ['البرازيل', 'إيطاليا', 'الأوروغواي', 'الأرجنتين'], a: 3 },
    { q: 'أين أقيمت أولمبياد 2020؟', options: ['بكين', 'طوكيو', 'لندن', 'باريس'], a: 2 },
    { q: 'اللاعب الأكثر تتويجاً بالكرة الذهبية؟', options: ['كريستيانو رونالدو', 'ليونيل ميسي', 'زين الدين زيدان', 'ميشيل بلاتيني'], a: 2 },
    { q: 'ماذا تعني كلمة كاراتيه؟', options: ['اليد الخالية', 'القدم السريعة', 'القوة القصوى', 'الدفاع القوي'], a: 1 },
    { q: 'أين نشأت رياضة التايكوندو؟', options: ['اليابان', 'كوريا الجنوبية', 'الصين', 'تايلند'], a: 2 },
    { q: 'كم حفرة أساسية في ملعب الجولف؟', options: ['12', '15', '18', '21'], a: 3 },
    { q: 'لون حزام المبتدئ بالكاراتيه؟', options: ['أبيض', 'أصفر', 'أحمر', 'أزرق'], a: 1 },
    { q: 'مدة شوط كرة السلة الواحد في الـ NBA؟', options: ['10 دقائق', '12 دقيقة', '15 دقيقة', '20 دقيقة'], a: 2 }
  ],
  entertainment: [
    { q: 'فيلم كرتون عن سمكة ضائعة يبحث عنها والدها؟', options: ['القرش', 'نيمو', 'بونيو', 'أريل'], a: 2 },
    { q: 'ما هو اللون الأساسي لشخصية سبونج بوب؟', options: ['أحمر', 'أخضر', 'أصفر', 'أزرق'], a: 3 },
    { q: 'بطل سلسلة أفلام قراصنة الكاريبي جاك..؟', options: ['ويل', 'باربوسا', 'سبارو', 'بلاك بيرد'], a: 3 },
    { q: 'بطل الأنيمي الشهير "المحقق..."؟', options: ['سينشي', 'كونان', 'هيجي', 'توغوموري'], a: 2 },
    { q: 'المسلسل الشهير Game of ...؟', options: ['Cards', 'Thrones', 'Kings', 'Swords'], a: 2 },
    { q: 'ماهو اسم الفأر في توم وجيري؟', options: ['ميكي', 'توم', 'جيري', 'سبايك'], a: 3 },
    { q: 'الشركة المنتجة لأفلام آيرون مان وأفنجرز؟', options: ['دي سي', 'بيكسار', 'مارفل', 'ديزني'], a: 3 },
    { q: 'سلسلة أفلام حرب النجوم تسمى بالإنجليزية؟', options: ['حرب العوالم', 'ستار تريك', 'ستار وورز', 'الفضائيون'], a: 3 },
    { q: 'أين تقع هوليوود سينمائياً؟', options: ['تكساس', 'نيويورك', 'فلوريدا', 'لوس أنجلوس'], a: 4 },
    { q: 'ماذا كانت تأكل سلاحف النينجا دائماً؟', options: ['بيتزا', 'معكرونة', 'شطائر', 'همبرغر'], a: 1 }
  ]
};

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#f97316', '#06b6d4', '#8b5cf6'];

export default function TrivialPursuitGame({ channelName, messages, onLeave }: TrivialPursuitGameProps) {
  const [gameState, setGameState] = useState<'lobby' | 'turn_start' | 'rolling' | 'answering' | 'result' | 'stage2_intro' | 'stage2_playing' | 'stage2_result' | 'stage3_intro' | 'stage3_category_pick' | 'stage3_playing' | 'stage3_result' | 'stage4_intro' | 'stage4_playing' | 'stage4_result' | 'stage1_leaderboard' | 'stage2_leaderboard' | 'stage3_leaderboard' | 'stage4_leaderboard' | 'stage5_intro' | 'stage5_playing' | 'stage5_result' | 'game_over'>('lobby');
  const [stage2QuestionCount, setStage2QuestionCount] = useState(0);
  const [stage2Q, setStage2Q] = useState<{q: string, options: string[], a: number} | null>(null);
  const [stage2Winner, setStage2Winner] = useState<string | null>(null);
  const [stage5QuestionCount, setStage5QuestionCount] = useState(0);
  const [stage5Q, setStage5Q] = useState<{q: string, options: string[], a: number} | null>(null);
  const [stage5Winner, setStage5Winner] = useState<string | null>(null);

  // Stage 3 State
  const [stage3ActivePlayerIndex, setStage3ActivePlayerIndex] = useState(0);
  const [stage3Categories, setStage3Categories] = useState<string[]>([]);
  const [stage3Eliminated, setStage3Eliminated] = useState<string[]>([]);
  const [stage3CurrentCategory, setStage3CurrentCategory] = useState<string | null>(null);
  const [stage3QuestionCount, setStage3QuestionCount] = useState(0);
  const [stage3Q, setStage3Q] = useState<{q: string, options: string[], a: number} | null>(null);

  // Stage 4 State
  const [stage4ActivePlayerIndex, setStage4ActivePlayerIndex] = useState(0);
  const [stage4Eliminated, setStage4Eliminated] = useState<string[]>([]);
  const [stage4Guessed, setStage4Guessed] = useState<string[]>([]);
  
  const STAGE4_Q = {
    title: 'عواصم الدول العربية',
    answers: ['الرياض', 'الكويت', 'مقط', 'مسقط', 'ابوظبي', 'أبوظبي', 'الدوحة', 'المنامة', 'بغداد', 'دمشق', 'بيروت', 'عمان', 'القدس', 'صنعاء', 'القاهرة', 'الخرطوم', 'طرابلس', 'تونس', 'الجزائر', 'الرباط', 'مقديشو', 'موروني', 'جيبوتي', 'نواكشوط']
  };

  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string, options: string[], a: number, categoryId: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultInfo, setResultInfo] = useState<{status: 'correct' | 'wrong' | 'timeout' | 'skipped', selected?: number} | null>(null);
  
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Layout calculations for 7x7 outer grid (24 tiles total)
  const getBoardCoordinates = (index: number) => {
    if(index <= 6) return { row: 0, col: index };
    if(index <= 12) return { row: index - 6, col: 6 };
    if(index <= 18) return { row: 6, col: 6 - (index - 12) };
    return { row: 6 - (index - 18), col: 0 };
  };

  useEffect(() => {
    if (messages.length === 0) return;

    messages.forEach(msg => {
      if (processedMessagesRef.current.has(msg.id)) return;
      processedMessagesRef.current.add(msg.id);

      const text = msg.message.trim();
      const username = msg.username;

      // Lobby: Joining
      if (gameState === 'lobby') {
        if (text.toLowerCase() === '!join' || text === '!دخول' || text === '1') {
          setPlayers(prev => {
              if (prev.find(p => p.username === username) || prev.length >= 8) return prev;
              
              fetch(`https://decapi.me/twitch/avatar/${username}`)
                .then(res => res.text())
                .then(avatarUrl => {
                  if (avatarUrl && !avatarUrl.includes('User not found')) {
                     setPlayers(p => p.map(pl => pl.username === username ? { ...pl, avatar: avatarUrl } : pl));
                  }
                }).catch(() => {});

              return [...prev, {
                username,
                position: 0,
                score2: 0,
                tokens: [],
                color: PLAYER_COLORS[prev.length]
              }];
            });
        }
      }

      // Turn Start: Rolling
      if (gameState === 'turn_start' && players[currentPlayerIndex]) {
        if (username === players[currentPlayerIndex].username) {
          if (text.toLowerCase() === '!roll' || text === '!رول' || text === 'رول') {
            handleRoll();
          }
        }
      }

      
        
        // Stage 3 Category Pick
        if (gameState === 'stage3_category_pick' && players[stage3ActivePlayerIndex]?.username === username) {
             const num = parseInt(text);
             if (!isNaN(num) && num >= 1 && num <= 3) {
                 selectStage3Category(stage3Categories[num - 1]);
             }
        }

        // Stage 3 Answering
        if (gameState === 'stage3_playing' && stage3Q && !stage3Eliminated.includes(username)) {
           const num = parseInt(text);
           if (!isNaN(num) && num >= 1 && num <= 4) {
              if (num !== stage3Q.a) {
                // wrong answer -> eliminated for round
                setStage3Eliminated(prev => [...prev, username]);
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, s3W: (p.s3W || 0) + 1 } : p));
                // if active player is eliminated, fast forward turn? 
                // prompt says: "if someone gets the answer wrong they get eliminated for that round"
                // Everyone plays together in phase 3? Wait, prompt says: "every player choses a between 3 categories... when the question appears the players choose... if someone gets answer wrong they get eliminated for that round... when all 5 questions are answered the turn goes for the next player to choose a category..."
                // So all players answer simultaneously.
              } else {
                setPlayers(prev => prev.map(p => p.username === username ? { ...p, s3C: (p.s3C || 0) + 1, s3P: (p.s3P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
              }
           }
        }

        
        // Stage 5 Answering
        if (gameState === 'stage5_playing' && stage5Q) {
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 4) {
             if (num === stage5Q.a && !stage5Winner) {
              setStage5Winner(username);
              setPlayers(prev => prev.map(p => p.username === username ? { ...p, s5C: (p.s5C || 0) + 1, s5P: (p.s5P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
              setGameState('stage5_result');
              if (timerRef.current) clearInterval(timerRef.current);
              
              setTimeout(() => {
                if (stage5QuestionCount + 1 >= 15) {
                  setGameState('game_over');
                } else {
                  setStage5QuestionCount(prev => prev + 1);
                  startStage5Question();
                }
              }, 4000);
            }
          }
        }

        // Stage 4 Answering
        if (gameState === 'stage4_playing' && players[stage4ActivePlayerIndex]?.username === username) {
           const val = text.trim();
           const isExact = STAGE4_Q.answers.some(a => val.includes(a) || a.includes(val)) && !stage4Guessed.includes(val);
           if (isExact) {
              setStage4Guessed(prev => [...prev, val]);
              endStage4Turn('correct', stage4ActivePlayerIndex);
           } else {
              endStage4Turn('wrong', stage4ActivePlayerIndex);
           }
        }

        // Stage 2 Answering
        if (gameState === 'stage2_playing' && stage2Q) {
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 4) {
             if (num === stage2Q.a && !stage2Winner) {
              setStage2Winner(username);
              setPlayers(prev => prev.map(p => p.username === username ? { ...p, score2: (p.score2 || 0) + 1, s2C: (p.s2C || 0) + 1, s2P: (p.s2P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
              setGameState('stage2_result');
              if (timerRef.current) clearInterval(timerRef.current);
              
              setTimeout(() => {
                if (stage2QuestionCount + 1 >= 10) {
                                   setGameState('stage2_leaderboard');
                  setTimeout(() => {
                    setGameState('stage3_intro');
                    setTimeout(() => startStage3Turn(0), 5000);
                  }, 10000);
                } else {
                  setStage2QuestionCount(prev => prev + 1);
                  startStage2Question();
                }
              }, 4000);
            }
          }
        }

        // Answering
      if (gameState === 'answering' && currentQuestion && players[currentPlayerIndex]) {
        if (username === players[currentPlayerIndex].username) {
          const num = parseInt(text);
          if (!isNaN(num) && num >= 1 && num <= 4) {
             handleAnswerResult(num === currentQuestion.a ? 'correct' : 'wrong', num);
          }
        }
      }
    });
  }, [messages, gameState, players, currentPlayerIndex, currentQuestion]);

  
  const startStage3Turn = (playerIndex: number) => {
    // Check if we did all players
    if (playerIndex >= players.length) {
            setGameState('stage3_leaderboard');
      setTimeout(() => {
        setGameState('stage4_intro');
        setTimeout(() => startStage4(0), 5000);
      }, 10000);
      return;
    }
    setStage3ActivePlayerIndex(playerIndex);
    setGameState('stage3_category_pick');
    setStage3Eliminated([]);
    
    // Pick 3 random categories out of our main categories
    const allCats = ['history', 'science', 'sports', 'entertainment'];
    const shuffled = allCats.sort(() => 0.5 - Math.random());
    setStage3Categories(shuffled.slice(0, 3));
    setTimeLeft(15);
  };

  const selectStage3Category = (catId: string) => {
    setStage3CurrentCategory(catId);
    setStage3QuestionCount(0);
    // nextStage3Question safely
    const qList = QUESTIONS[catId];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage3Q(rq);
    setGameState('stage3_playing');
    setTimeLeft(15);
  };

  const nextStage3Question = (catId: string, qIndex: number) => {
    if (qIndex >= 5) {
      // next player's turn
      setGameState('stage3_result');
      setTimeout(() => {
         startStage3Turn(stage3ActivePlayerIndex + 1);
      }, 3000);
      return;
    }
    const qList = QUESTIONS[catId];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage3Q(rq);
    setGameState('stage3_playing');
    setTimeLeft(15);
  };

  const startStage4 = (pIndex: number) => {
    setGameState('stage4_playing');
    setStage4ActivePlayerIndex(pIndex);
    setTimeLeft(15);
  };
  
  const endStage4Turn = (status: 'correct' | 'wrong' | 'timeout', pIndex: number) => {
    setGameState('stage4_result');
    if (status === 'wrong' || status === 'timeout') {
      setStage4Eliminated(prev => [...prev, players[pIndex].username]);
      setPlayers(prev => prev.map(p => p.username === players[pIndex].username ? { ...p, s4W: (p.s4W || 0) + 1 } : p));
    } else {
      setPlayers(prev => prev.map(p => p.username === players[pIndex].username ? { ...p, s4C: (p.s4C || 0) + 1, s4P: (p.s4P || 0) + 1, totalPoints: (p.totalPoints || 0) + 1 } : p));
    }
    
    setTimeout(() => {
      // check if 1 player left or all answered
      setPlayers(latestPlayers => {
        setStage4Eliminated(latestEliminated => {
            const stillIn = latestPlayers.filter((p, i) => !latestEliminated.includes(p.username));
            if (stillIn.length <= 1) {
               if (stillIn.length === 1) {
                  latestPlayers = latestPlayers.map(p => p.username === stillIn[0].username ? { ...p, s4P: (p.s4P || 0) + 5, totalPoints: (p.totalPoints || 0) + 5 } : p);
               }
               setGameState('stage4_leaderboard');
               setTimeout(() => {
                   checkTieBreaker(latestPlayers);
               }, 10000);
               return latestEliminated;
            } else {
               let nextIdx = (pIndex + 1) % latestPlayers.length;
               while (latestEliminated.includes(latestPlayers[nextIdx].username) && stillIn.length > 1) {
                  nextIdx = (nextIdx + 1) % latestPlayers.length;
               }
               startStage4(nextIdx);
               return latestEliminated;
            }
        });
        return latestPlayers;
      });
    }, 4000);
  };

  
  
  const startStage2Question = () => {
    setGameState('stage2_playing');
    setStage2Winner(null);
    setTimeLeft(15);
    const cats = ['history', 'science', 'sports', 'entertainment'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const qList = QUESTIONS[randomCat];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage2Q(rq);
  };

  const checkTieBreaker = (currentPlayers: Player[]) => {
      const maxScore = Math.max(...currentPlayers.map(p => p.totalPoints || 0));
      const leaders = currentPlayers.filter(p => (p.totalPoints || 0) === maxScore);
      
      if (leaders.length > 1) {
         setGameState('stage5_intro');
         setTimeout(() => {
            setStage5QuestionCount(0);
            startStage5Question();
         }, 5000);
      } else {
         setGameState('game_over');
      }
  };

  const startStage5Question = () => {
    setGameState('stage5_playing');
    setStage5Winner(null);
    setTimeLeft(15);
    const cats = ['history', 'science', 'sports', 'entertainment'];
    const randomCat = cats[Math.floor(Math.random() * cats.length)];
    const qList = QUESTIONS[randomCat];
    const rq = qList[Math.floor(Math.random() * qList.length)];
    setStage5Q(rq);
  };

  const startGame = () => {
    if (players.length < 1) return;
    setGameState('turn_start');
    setCurrentPlayerIndex(0);
    setTimeLeft(30);
  };

  const handleRoll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setGameState('rolling');
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 15) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        
        setTimeout(() => {
           animateMove(currentPlayerIndex, players[currentPlayerIndex]?.position || 0, finalRoll);
        }, 600);
      }
    }, 80);
  };

  const animateMove = (pIdx: number, currentPos: number, remainingSpaces: number) => {
    if (remainingSpaces <= 0) {
      setTimeout(showQuestion, 400); 
      return;
    }
    
    const nextPos = (currentPos + 1) % BOARD_SIZE;
    
    setPlayers(prev => prev.map((p, i) => {
      if (i === pIdx) {
        return { ...p, position: nextPos };
      }
      return p;
    }));

    setTimeout(() => {
      animateMove(pIdx, nextPos, remainingSpaces - 1);
    }, 350); 
  };

  const showQuestion = () => {
    setPlayers(prev => {
      const currentPlayer = prev[currentPlayerIndex];
      const category = BOARD_TILES[currentPlayer.position];

      if (currentPlayer.tokens.includes(category.id)) {
        setTimeout(() => {
          setGameState('result');
          setResultInfo({ status: 'skipped' });
          setTimeout(() => {
            checkWinOrNextTurn();
          }, 3500);
        }, 0);
        return prev;
      }

      const categoryQuestions = QUESTIONS[category.id];
      const randomQ = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
      
      setTimeout(() => {
        setGameState('answering');
        setCurrentQuestion({ ...randomQ, categoryId: category.id });
        setTimeLeft(45);
      }, 0);

      return prev;
    });
  };

  const handleAnswerResult = (status: 'correct' | 'wrong' | 'timeout' | 'skipped', selected?: number) => {
    setGameState('result');
    setResultInfo({ status, selected });
    if (timerRef.current) clearInterval(timerRef.current);

    if (status === 'correct' && currentQuestion) {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const p = { ...newPlayers[currentPlayerIndex] };
        p.s1C = (p.s1C || 0) + 1;
        if (!p.tokens.includes(currentQuestion.categoryId)) {
          p.tokens = [...p.tokens, currentQuestion.categoryId];
        }
        newPlayers[currentPlayerIndex] = p;
        return newPlayers;
      });
    } else if (status === 'wrong' || status === 'timeout') {
      setPlayers(prev => {
        const newPlayers = [...prev];
        const p = { ...newPlayers[currentPlayerIndex] };
        p.s1W = (p.s1W || 0) + 1;
        newPlayers[currentPlayerIndex] = p;
        return newPlayers;
      });
    }

    setTimeout(() => {
      checkWinOrNextTurn();
    }, 4500);
  };  const checkWinOrNextTurn = () => {
    setCurrentQuestion(null);
    setResultInfo(null);

    setPlayers(prev => {
      const newPlayers = [...prev];
      const p = { ...newPlayers[currentPlayerIndex] };
      
      if (p.tokens.length >= 4) {
        p.s1P = (p.s1P || 0) + 1;
        p.totalPoints = (p.totalPoints || 0) + 1;
        newPlayers[currentPlayerIndex] = p;
        
        setGameState('stage1_leaderboard');
        setTimeout(() => {
          setGameState('stage2_intro');
          setTimeout(() => {
            setStage2QuestionCount(0);
            startStage2Question();
          }, 5000);
        }, 10000);
        return newPlayers;
      } else {
        setCurrentPlayerIndex((currentPlayerIndex + 1) % prev.length);
        setGameState('turn_start');
        setTimeLeft(30);
        return prev;
      }
    });
  };  useEffect(() => {
    if (gameState === 'turn_start' || gameState === 'answering') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (gameState === 'turn_start') {
              handleRoll();
            } else if (gameState === 'answering') {
              handleAnswerResult('timeout');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);


  return (
    <div className="flex-1 flex flex-col items-center p-8 bg-[#0a0a0a] relative overflow-hidden h-full">
      <button
        onClick={onLeave}
        className="absolute top-6 right-6 text-zinc-500 hover:text-brand-gold transition-colors flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-full z-50"
      >
        <ArrowRight className="w-5 h-5" />
        العودة للرئيسية
      </button>

      <div className="flex w-full max-w-[1400px] h-full gap-8">
        
        {/* Left Sidebar: Players */}
        <div className="w-[320px] flex flex-col gap-3 shrink-0">
          <div className="bg-brand-gold/10 border border-brand-gold/20 rounded-2xl p-4 mb-2">
            <h2 className="text-xl font-bold text-brand-gold flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              اللاعبين والميداليات
            </h2>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2 pb-8">
            {players.map((p, idx) => (
              <motion.div 
                key={p.username}
                animate={{ scale: idx === currentPlayerIndex && gameState !== 'lobby' ? 1.03 : 1 }}
                className={`bg-white/5 border rounded-2xl p-4 transition-all duration-300 ${
                  idx === currentPlayerIndex && gameState !== 'lobby' 
                  ? 'border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.2)] bg-gradient-to-br from-brand-gold/10 to-transparent' 
                  : 'border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: p.color }}
                  >
                     <img 
                        src={p.avatar || `https://ui-avatars.com/api/?name=${p.username}&background=random`} 
                        alt={p.username}
                        className="w-full h-full object-cover absolute inset-0 z-10"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.username}&background=random`; }}
                      />
                     
                  </div>
                  <span className="font-bold text-white text-lg truncate flex-1">{p.username}</span>
                </div>
                
                {/* Tokens */}
                <div className="flex gap-2 justify-between px-1">
                   {CATEGORIES.map(cat => (
                     <div 
                       key={cat.id} 
                       className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden shadow-inner border border-white/10 ${
                         p.tokens.includes(cat.id) ? cat.tokenColor : 'bg-black/80 opacity-40'
                       }`}
                     >
                       <cat.icon className={`w-5 h-5 ${p.tokens.includes(cat.id) ? 'text-white' : 'text-zinc-600'}`} />
                     </div>
                   ))}
                </div>
              </motion.div>
            ))}
            
            {players.length === 0 && (
              <div className="text-zinc-600 text-center mt-10">اكتب <span className="text-brand-gold">1</span> أو <span className="text-brand-gold">!join</span> للعب</div>
            )}
          </div>
        </div>

        {/* Right Content: Board & Actions */}
        <div className="flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 relative">
          
          {gameState === 'lobby' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Brain className="w-32 h-32 text-brand-gold mb-6 opacity-80" />
              <h1 className="text-5xl font-black text-white mb-4 tracking-tight">مسار <span className="text-brand-gold">المعرفة</span></h1>
              <p className="text-xl text-zinc-400 mb-8 max-w-md leading-relaxed">
                لعبة لوحية هادئة بأسئلة ثقافية. اجمع 4 ميداليات من تصنيفات مختلفة لتفوز!
              </p>
              
              <div className="bg-black/50 border border-brand-gold/30 rounded-2xl p-6 px-12 mb-8 inline-block shadow-2xl">
                <p className="text-brand-gold text-sm font-bold mb-2 uppercase tracking-widest">للانضمام بالشات</p>
                <div className="flex items-center gap-4">
                  <p className="text-3xl text-white font-mono">!join</p>
                  <span className="text-zinc-500">أو</span>
                  <p className="text-3xl text-white font-mono">1</p>
                </div>
              </div>

              {players.length > 0 && (
                <button
                  onClick={startGame}
                  className="bg-brand-gold hover:bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold flex items-center gap-3 text-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  <Play className="w-6 h-6" />
                  بدء اللعبة ({players.length})
                </button>
              )}
            </div>
          ) : gameState === 'game_over' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
               <Trophy className="w-40 h-40 text-brand-gold mx-auto mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.6)]" />
               <h2 className="text-5xl font-bold text-white mb-2">انتهت اللعبة!</h2>
               <p className="text-2xl text-brand-gold mb-8">الناجي الأخير والمنتصر باللعبة</p>
               
               <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-3xl p-8 mb-8">
                 <p className="text-4xl font-black text-white">{players.find(p => !stage4Eliminated.includes(p.username))?.username || [...players].sort((a,b) => (b.score2 || 0) - (a.score2 || 0))[0]?.username || "لا أحد"}</p>
               </div>

               <button
                  onClick={() => setGameState('lobby')}
                  className="bg-brand-gold/20 text-brand-gold border border-brand-gold hover:bg-brand-gold hover:text-black transition-all px-8 py-3 rounded-full font-bold text-lg"
                >
                  العودة للوبي
                </button>
            </div>
          ) : (
            <>
              {/* Active Player Status Header */}
              <div className="flex items-center justify-between bg-black/60 rounded-2xl p-4 border border-white/10 mb-6 shrink-0 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]" style={{ backgroundColor: players[currentPlayerIndex]?.color }}>
                     <img src={players[currentPlayerIndex]?.avatar || `https://ui-avatars.com/api/?name=${players[currentPlayerIndex]?.username}&background=random`} alt="" className="w-full h-full object-cover bg-black" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${players[currentPlayerIndex]?.username}&background=random`; }} />
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm mb-1">دور اللاعب</p>
                    <p className="text-2xl font-bold text-white">{players[currentPlayerIndex]?.username}</p>
                  </div>
                </div>

                {(gameState === 'turn_start' || gameState === 'answering') && (
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-xl border border-white/5 shadow-inner">
                    <Timer className="w-6 h-6 text-brand-gold animate-pulse" />
                    <span className="text-2xl font-mono text-white min-w-[3ch] text-center">{timeLeft}</span>
                  </div>
                )}
              </div>

              {/* Game View Area (Board & Center) */}
              <div className="flex-1 flex items-center justify-center relative min-h-[500px]">
                 
                 {/* Rectangular Grid Board */}
                 <div className="w-full max-w-[800px] h-full max-h-[800px] aspect-square relative grid p-2"
                      style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', gap: '8px' }}
                 >
                    {/* The Outer Pathway Tiles */}
                    {BOARD_TILES.map((tile, i) => {
                        const rc = getBoardCoordinates(i);
                        const isCollected = players[currentPlayerIndex]?.tokens.includes(tile.id);
                        const tileStyle = isCollected && (gameState === 'turn_start' || gameState === 'rolling' || gameState === 'answering' || gameState === 'result') ? 'bg-zinc-900 border-zinc-800 opacity-40 grayscale' : tile.color;
                        return (
                          <div
                            key={i}
                            className={`relative rounded-[20%] border-2 flex items-center justify-center ${tileStyle} shadow-lg transition-all duration-500`}
                          style={{ gridColumn: rc.col + 1, gridRow: rc.row + 1 }}
                        >
                          <tile.icon className={`w-6 h-6 lg:w-8 h-8 ${tile.iconColor} opacity-70`} />
                          
                          {/* Player Avatar Markers */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-wrap w-[120%] justify-center items-center gap-1 z-30 pointer-events-none">
                             {players.map((p, pIdx) => p.position === i ? (
                               <motion.div 
                                 layoutId={`player_marker_${pIdx}`}
                                 key={p.username} 
                                 className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.8)] z-40 relative"
                                 style={{ backgroundColor: p.color }}
                                 transition={{ type: "spring", stiffness: 350, damping: 25 }}
                               >
                                  <img 
                                    src={p.avatar || `https://ui-avatars.com/api/?name=${p.username}&background=random`} 
                                    alt=""
                                    className="w-full h-full object-cover rounded-full absolute inset-0 z-10"
                                    onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${p.username}&background=random`; }}
                                  />
                               </motion.div>
                             ) : null)}
                          </div>
                        </div>
                      );
                    })}

                    {/* Center Action/Question Panel */}
                    <div className="col-start-2 col-end-7 row-start-2 row-end-7 m-3 bg-[#0f0f0f] border-4 border-white/5 rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col z-10">
                       <AnimatePresence mode="wait">
                          
                          {gameState === 'turn_start' && (
                            <motion.div key="roll_prompt" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex-1 flex flex-col items-center justify-center text-center p-8">
                              <Dices className="w-16 h-16 text-brand-gold mx-auto mb-4 opacity-70" />
                              <p className="text-zinc-400 mb-2">في انتظار رمي النرد...</p>
                              <p className="text-white text-2xl font-bold">اكتب <span className="text-brand-gold bg-brand-gold/20 px-3 py-1 rounded-lg mx-2 border border-brand-gold/30">!roll</span> أو <span className="text-brand-gold bg-brand-gold/20 px-3 py-1 rounded-lg mx-2 border border-brand-gold/30">رول</span> بالشات</p>
                            </motion.div>
                          )}
                          
                          {gameState === 'rolling' && (
                            <motion.div key="rolling" className="flex-1 flex items-center justify-center">
                               <div className="w-32 h-32 bg-brand-gold/20 rounded-3xl flex items-center justify-center border-4 border-brand-gold shadow-[0_0_50px_rgba(212,175,55,0.4)] animate-bounce">
                                 <span className="text-7xl font-black text-white">{diceValue}</span>
                               </div>
                            </motion.div>
                          )}

                          {gameState === 'answering' && currentQuestion && (
                            <motion.div 
                              key="question_card"
                              initial={{ y: 50, opacity: 0 }} 
                              animate={{ y: 0, opacity: 1 }} 
                              exit={{ y: -50, opacity: 0 }}
                              className="flex-1 flex flex-col w-full"
                            >
                               <div className={`h-2 w-full ${CATEGORIES.find(c => c.id === currentQuestion.categoryId)?.tokenColor}`} />
                               <div className="flex-1 flex flex-col justify-center p-6 text-center">
                                  <span className={`inline-block mx-auto mb-4 px-4 py-1 rounded-full text-sm font-bold border ${CATEGORIES.find(c => c.id === currentQuestion.categoryId)?.color}`}>
                                    {CATEGORIES.find(c => c.id === currentQuestion.categoryId)?.name}
                                  </span>
                                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 leading-normal px-2">
                                    {currentQuestion.q}
                                  </h3>
                                  
                                  <div className="grid grid-cols-2 gap-3 lg:gap-4 w-full px-2 sm:px-6"> {/* Multiple Choice Layout */}
                                    {currentQuestion.options.map((opt, idx) => (
                                       <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-2xl p-4 flex gap-4 items-center text-right shadow-lg">
                                          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-2xl shrink-0 border border-brand-gold/30 shadow-inner">
                                            {idx + 1}
                                          </div>
                                          <span className="text-white font-bold leading-tight text-lg lg:text-xl">{opt}</span>
                                       </div>
                                    ))}
                                  </div>

                                  <p className="text-zinc-400 mt-8">اكتب <span className="text-brand-gold font-bold text-lg">رقم الإجابة</span> فقط في الشات المباشر (1 - 4)</p>
                               </div>
                            </motion.div>
                          )}

                          
                            
                            {gameState === 'stage3_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Users className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الثالثة</h2>
                                <p className="text-2xl text-zinc-300">يختار كل لاعب موضوع لـ 5 أسئلة، الإجابة الخاطئة تقصيك للروند القادم!</p>
                              </motion.div>
                            )}
                            
                            {gameState === 'stage3_category_pick' && (
                              <motion.div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] z-50">
                                <h2 className="text-4xl font-black text-white mb-6">دور: <span className="text-brand-gold">{players[stage3ActivePlayerIndex]?.username}</span></h2>
                                <p className="text-zinc-400 mb-8 text-xl">اختر تصنيف عبر كتابة (1 - 3) في الشات</p>
                                <div className="flex gap-6 max-w-2xl mx-auto w-full justify-center">
                                   {stage3Categories.map((catId, i) => {
                                      const cat = CATEGORIES.find(c => c.id === catId);
                                      return (
                                        <div key={catId} className="bg-[#1a1a1a] p-8 rounded-3xl border-2 border-brand-gold/30 text-center flex-1">
                                          <div className="w-16 h-16 mx-auto bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold text-2xl font-bold mb-4">{i+1}</div>
                                          <div className="text-white font-bold text-2xl">{cat?.name}</div>
                                        </div>
                                      );
                                   })}
                                </div>
                              </motion.div>
                            )}

                            {gameState === 'stage3_playing' && stage3Q && (
                               <motion.div className="flex-1 flex flex-col p-8 bg-[#0a0a0a] z-50">
                                 <div className="flex justify-between items-center mb-6">
                                   <div className="bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-xl font-bold">سؤال {stage3QuestionCount + 1}/5 (تصنيف: {CATEGORIES.find(c => c.id === stage3CurrentCategory)?.name})</div>
                                   <div className="text-3xl font-mono text-white flex items-center gap-2"><Timer className="w-8 h-8 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 </div>
                                 <h2 className="text-3xl font-bold text-white text-center mb-8 bg-white/5 p-6 rounded-2xl border border-white/10">{stage3Q.q}</h2>
                                 <div className="grid grid-cols-2 gap-4">
                                   {stage3Q.options.map((opt, i) => (
                                     <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                       <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-brand-gold">{i + 1}</span>
                                       <span className="text-xl text-white font-bold">{opt}</span>
                                     </div>
                                   ))}
                                 </div>
                                 
                                 {/* Show who is Eliminated */}
                                 {stage3Eliminated.length > 0 && (
                                     <div className="mt-8 bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl text-center">
                                        <p className="text-rose-400 font-bold mb-2">تم إقصائهم لهذه الجولة:</p>
                                        <p className="text-white">{stage3Eliminated.join(' - ')}</p>
                                     </div>
                                 )}
                               </motion.div>
                            )}
                            
                            {gameState === 'stage3_result' && (
                              <motion.div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0a0a0a] z-50 text-center">
                                 <Trophy className="w-24 h-24 text-brand-gold mb-6" />
                                 <h2 className="text-4xl text-white font-black mb-4">انتهت الجولة!</h2>
                                 <p className="text-xl text-zinc-400">ينتقل الدور للاعب التالي لاختيار التصنيف...</p>
                              </motion.div>
                            )}

                            {gameState === 'stage4_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Trophy className="w-32 h-32 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الرابعة والأخيرة</h2>
                                <p className="text-2xl text-zinc-300">أجب نصياً! إجابة صحيحة = بقاء، خاطئة/تأخر = خروج للمركز الأخير.</p>
                              </motion.div>
                            )}

                            {gameState === 'stage4_playing' && (
                               <motion.div className="flex-1 flex flex-col p-8 items-center justify-center text-center bg-[#0a0a0a] z-50">
                                 <div className="text-4xl font-mono text-white flex items-center gap-2 mb-8"><Timer className="w-10 h-10 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 <h3 className="text-2xl text-brand-gold mb-2">دور اللاعب:</h3>
                                 <h2 className="text-6xl font-black text-white mb-8 border-b border-brand-gold/30 pb-4">{players[stage4ActivePlayerIndex]?.username}</h2>
                                 
                                 <div className="bg-white/5 border border-brand-gold/20 p-8 rounded-3xl w-full max-w-2xl mb-8">
                                    <p className="text-3xl font-bold text-white mb-4">{STAGE4_Q.title}</p>
                                    <p className="text-zinc-400">اكتب اسم واحد فقط باللغة العربية حصراً.</p>
                                 </div>
                                 
                                 <div className="flex gap-4 mb-4">
                                     <span className="text-rose-400 font-bold">تم إقصاء: ({stage4Eliminated.length})</span>
                                     <span className="text-emerald-400 font-bold">متبقي: ({players.length - stage4Eliminated.length})</span>
                                 </div>
                               </motion.div>
                            )}

                            {gameState === 'stage4_result' && (
                               <motion.div className="flex-1 flex items-center justify-center flex-col text-center p-8 bg-[#0a0a0a] z-50">
                                 <h2 className="text-4xl text-white font-black mb-6">جارٍ معالجة الإجابة...</h2>
                                 {stage4Eliminated.includes(players[stage4ActivePlayerIndex]?.username) ? (
                                    <>
                                        <XCircle className="w-20 h-20 text-rose-500 mb-4" />
                                        <p className="text-rose-400 font-bold text-3xl">تم إقصاء {players[stage4ActivePlayerIndex]?.username}!</p>
                                    </>
                                 ) : (
                                    <>
                                        <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4" />
                                        <p className="text-emerald-400 font-bold text-3xl">إجابة صحيحة! {players[stage4ActivePlayerIndex]?.username} يبقى في اللعبة.</p>
                                    </>
                                 )}
                               </motion.div>
                            )}

                            {gameState === 'stage2_intro' && (
                              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                <Rocket className="w-24 h-24 text-brand-gold mb-6 animate-bounce" />
                                <h2 className="text-5xl font-black text-white mb-4">المرحلة الثانية</h2>
                                <p className="text-2xl text-zinc-300">أسئلة السرعة! أسرع لاعب يجيب يكسب النقاط.</p>
                              </motion.div>
                            )}

                            {gameState === 'stage2_playing' && stage2Q && (
                              <motion.div key="s2_q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-8 bg-[#0a0a0a] z-50">
                                 <div className="flex justify-between items-center mb-6">
                                   <div className="bg-brand-gold/20 text-brand-gold px-4 py-2 rounded-xl font-bold">سؤال سريع {stage2QuestionCount + 1}/10</div>
                                   <div className="text-3xl font-mono text-white flex items-center gap-2"><Timer className="w-8 h-8 text-brand-red animate-pulse" /> {timeLeft}</div>
                                 </div>
                                 <h2 className="text-3xl font-bold text-white text-center mb-8 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">{stage2Q.q}</h2>
                                 <div className="grid grid-cols-2 gap-4">
                                   {stage2Q.options.map((opt, i) => (
                                     <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                       <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl font-black text-brand-gold">{i + 1}</span>
                                       <span className="text-xl text-white font-bold">{opt}</span>
                                     </div>
                                   ))}
                                 </div>
                              </motion.div>
                            )}

                            {gameState === 'stage2_result' && stage2Q && (
                              <motion.div key="s2_res" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0a0a0a] z-50">
                                {stage2Winner ? (
                                  <>
                                    <CheckCircle2 className="w-24 h-24 text-emerald-500 mb-6" />
                                    <h2 className="text-4xl font-black text-white mb-2">أسرع إجابة: {stage2Winner}</h2>
                                    <p className="text-2xl text-emerald-400">+1 نقطة</p>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-24 h-24 text-rose-500 mb-6" />
                                    <h2 className="text-4xl font-black text-white mb-2">انتهى الوقت!</h2>
                                    <p className="text-2xl text-rose-400">لم يجب أحد</p>
                                  </>
                                )}
                              </motion.div>
                            )}

                            {gameState === 'result' && resultInfo && (
                            <motion.div 
                              key="result_card"
                              initial={{ scale: 0.8, opacity: 0 }} 
                              animate={{ scale: 1, opacity: 1 }} 
                              exit={{ scale: 0.8, opacity: 0 }}
                              className={`flex-1 flex flex-col items-center justify-center p-8 text-center`}
                            >
                              {resultInfo.status === 'skipped' ? (
                                  <>
                                    <Medal className="w-32 h-32 text-zinc-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(161,161,170,0.5)]" />
                                    <h3 className="text-5xl font-bold text-white mb-4">لديك هذه الميدالية!</h3>
                                    <p className="text-2xl text-zinc-300">تم تخطي سؤال هذا التصنيف (انتقل الدور).</p>
                                  </>
                                ) : resultInfo.status === 'correct' ? (
                                <>
                                  <CheckCircle2 className="w-32 h-32 text-green-400 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                                  <h3 className="text-5xl font-bold text-white mb-4">إجابة صحيحة!</h3>
                                  <p className="text-2xl text-green-300">لقد حصلت على ميدالية التصنيف!</p>
                                </>
                              ) : (
                                <>
                                  {resultInfo.status === 'timeout' ? (
                                     <Timer className="w-32 h-32 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                  ) : (
                                     <XCircle className="w-32 h-32 text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                                  )}
                                  
                                  <h3 className="text-5xl font-bold text-white mb-4">
                                    {resultInfo.status === 'timeout' ? 'انتهى الوقت!' : 'إجابة خاطئة!'}
                                  </h3>
                                  <p className="text-xl text-red-300 mb-8">فرصة سعيدة في الدور القادم!</p>
                                  
                                  {currentQuestion && (
                                    <div className="bg-black/60 p-5 rounded-2xl inline-block text-center border border-green-500/30">
                                      <span className="text-zinc-400 text-sm block mb-2">الإجابة الصحيحة كانت رقم ({currentQuestion.a}):</span>
                                      <span className="text-3xl font-bold text-green-400">{currentQuestion.options[currentQuestion.a - 1]}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </motion.div>
                          )}
                          
                       </AnimatePresence>
                    </div>

                 </div>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
