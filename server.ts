import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());


// How Many Can You Name Game State
interface HowManyGameState {
  players: {
    id: string;
    name: string;
    isEliminated: boolean;
    isWebJoined: boolean;
    socketId: string | null;
  }[];
  status: 'waiting' | 'matchmaking' | 'category_selection' | 'gambling' | 'naming' | 'review' | 'result' | 'game_over';
  currentMatch: [string, string] | null;
  categories: string[];
  selectedCategory: string | null;
  gamblerId: string | null;
  targetCount: number;
  currentCount: number;
  timer: number;
  answers: string[];
  winner: string | null;
  turn: string | null; // whose turn to bid
  bid: number;
}

const howManyRooms = new Map<string, HowManyGameState>();

// Team Games State
interface TeamGameState {
  players: {
    id: string;
    name: string;
    team: 'gold' | 'black' | null;
  }[];
  status: 'waiting' | 'buzzer' | 'playing' | 'results';
  gameType: 'teamfeud' | 'codenames' | 'bombrelay';
  // Game specific data
  data: any;
}

const teamRooms = new Map<string, TeamGameState>();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);


  // How Many Can You Name Events
  socket.on("join_howmany_lobby", ({ roomId, name }) => {
    socket.join(roomId);
    if (!howManyRooms.has(roomId)) {
      howManyRooms.set(roomId, {
        players: [],
        status: 'waiting',
        currentMatch: null,
        categories: [],
        selectedCategory: null,
        gamblerId: null,
        targetCount: 0,
        currentCount: 0,
        timer: 30,
        answers: [],
        winner: null,
        turn: null,
        bid: 0
      });
    }
    const state = howManyRooms.get(roomId)!;
    if (!state.players.find(p => p.id === socket.id)) {
      state.players.push({
        id: socket.id,
        name: name || `Player ${state.players.length + 1}`,
        isEliminated: false,
        isWebJoined: true,
        socketId: socket.id
      });
    }
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("twitch_join", ({ roomId, username }) => {
    if (!howManyRooms.has(roomId)) return;
    const state = howManyRooms.get(roomId)!;
    if (!state.players.find(p => p.name === username)) {
      state.players.push({
        id: `twitch_${username}`,
        name: username,
        isEliminated: false,
        isWebJoined: false,
        socketId: null
      });
    }
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("start_howmany", (roomId) => {
    const state = howManyRooms.get(roomId);
    if (!state || state.players.length < 2) return;
    state.status = 'matchmaking';
    
    // Simple 1v1 matchmaking
    const active = state.players.filter(p => !p.isEliminated);
    if (active.length >= 2) {
      state.currentMatch = [active[0].id, active[1].id];
    } else {
      state.status = 'game_over';
      state.winner = active[0]?.name || "No one";
    }
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("select_categories", ({ roomId, categories }) => {
    const state = howManyRooms.get(roomId);
    if (!state) return;
    state.categories = categories;
    state.status = 'category_selection';
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("choose_category", ({ roomId, category }) => {
    const state = howManyRooms.get(roomId);
    if (!state) return;
    state.selectedCategory = category;
    state.status = 'gambling';
    state.turn = state.currentMatch![0];
    state.bid = 0;
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("place_bid", ({ roomId, amount }) => {
    const state = howManyRooms.get(roomId);
    if (!state || state.status !== 'gambling') return;
    state.bid = amount;
    state.turn = state.currentMatch!.find(id => id !== state.turn)!;
    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("call_liar_howmany", (roomId) => {
    const state = howManyRooms.get(roomId);
    if (!state || state.status !== 'gambling') return;
    
    // The person who was just bid on is the gambler
    state.gamblerId = state.currentMatch!.find(id => id !== state.turn)!;
    state.targetCount = state.bid;
    state.currentCount = 0;
    state.answers = [];
    state.status = 'naming';
    state.timer = 30;
    
    io.to(roomId).emit("howmany_state", state);

    const interval = setInterval(() => {
      state.timer--;
      if (state.timer <= 0) {
        clearInterval(interval);
        state.status = 'review';
        io.to(roomId).emit("howmany_state", state);
      } else {
        io.to(roomId).emit("howmany_timer", state.timer);
      }
    }, 1000);
  });

  socket.on("howmany_decision", ({ roomId, passed }) => {
    const state = howManyRooms.get(roomId);
    if (!state || state.status !== 'review') return;
    state.status = 'result';

    if (passed) {
      state.currentCount = state.targetCount;
    } else {
      if (state.currentCount >= state.targetCount) {
        state.currentCount = state.targetCount - 1;
      }
    }

    const loserId = passed
      ? state.currentMatch!.find(id => id !== state.gamblerId)!
      : state.gamblerId!;
    const loser = state.players.find(p => p.id === loserId);
    if (loser) loser.isEliminated = true;

    io.to(roomId).emit("howmany_state", state);
  });

  socket.on("submit_answer", ({ roomId, answer }) => {
    const state = howManyRooms.get(roomId);
    if (!state || state.status !== 'naming') return;
    if (!state.answers.includes(answer.toLowerCase())) {
      state.answers.push(answer.toLowerCase());
      state.currentCount++;
      io.to(roomId).emit("howmany_state", state);
    }
  });

  socket.on("next_round_howmany", (roomId) => {
    const state = howManyRooms.get(roomId);
    if (!state) return;
    
    const active = state.players.filter(p => !p.isEliminated);
    if (active.length <= 1) {
      state.status = 'game_over';
      state.winner = active[0]?.name || "No one";
    } else {
      state.status = 'matchmaking';
      state.currentMatch = [active[0].id, active[1].id];
    }
    io.to(roomId).emit("howmany_state", state);
  });

  // --- Team Games Handlers ---
  socket.on("join_team_game", ({ roomId, name, gameType }) => {
    socket.join(roomId);
    let room = teamRooms.get(roomId);
    if (!room) {
      room = {
        players: [],
        status: 'waiting',
        gameType,
        data: {}
      };
      teamRooms.set(roomId, room);
    }
    
    const existingPlayer = room.players.find(p => p.name === name);
    if (existingPlayer) {
      existingPlayer.id = socket.id;
    } else {
      room.players.push({ id: socket.id, name, team: null });
    }
    
    io.to(roomId).emit("team_game_state", room);
  });

  socket.on("switch_team", ({ roomId, playerId, team, name }) => {
    const room = teamRooms.get(roomId);
    if (room) {
      let player = room.players.find(p => p.id === playerId || (name && p.name === name));
      if (player) {
        player.team = team;
        if (playerId) player.id = playerId;
      } else if (name) {
        room.players.push({ id: playerId || `chat_${name}`, name, team });
      }
      io.to(roomId).emit("team_game_state", room);
    }
  });

  socket.on("start_team_game", (roomId) => {
    const room = teamRooms.get(roomId);
    if (room) {
      room.status = 'playing';
      
      if (room.gameType === 'teamfeud') {
        const questions = [
          {
            question: "أشياء تفعلها عند الاستيقاظ",
            answers: [
              { text: "غسل الوجه", points: 35, revealed: false },
              { text: "شرب القهوة", points: 25, revealed: false },
              { text: "تفقد الهاتف", points: 20, revealed: false },
              { text: "الصلاة", points: 15, revealed: false },
              { text: "الاستحمام", points: 5, revealed: false }
            ]
          },
          {
            question: "أشياء تجدها في المطبخ",
            answers: [
              { text: "سكين", points: 30, revealed: false },
              { text: "ثلاجة", points: 25, revealed: false },
              { text: "فرن", points: 20, revealed: false },
              { text: "صحن", points: 15, revealed: false },
              { text: "ملعقة", points: 10, revealed: false }
            ]
          },
          {
            question: "دول عربية مشهورة",
            answers: [
              { text: "مصر", points: 30, revealed: false },
              { text: "السعودية", points: 25, revealed: false },
              { text: "المغرب", points: 20, revealed: false },
              { text: "الجزائر", points: 15, revealed: false },
              { text: "الأردن", points: 10, revealed: false }
            ]
          },
          {
            question: "أشياء تفعلها قبل النوم",
            answers: [
              { text: "تفريش الأسنان", points: 30, revealed: false },
              { text: "ضبط المنبه", points: 25, revealed: false },
              { text: "قراءة كتاب", points: 20, revealed: false },
              { text: "شرب الماء", points: 15, revealed: false },
              { text: "تصفح الجوال", points: 10, revealed: false }
            ]
          },
          {
            question: "حيوانات تعيش في الصحراء",
            answers: [
              { text: "الجمل", points: 35, revealed: false },
              { text: "الثعلب", points: 28, revealed: false },
              { text: "العقرب", points: 22, revealed: false },
              { text: "الأفعى", points: 15, revealed: false }
            ]
          },
          {
            question: "أشهر الأكلات الشعبية السعودية",
            answers: [
              { text: "الكبسة", points: 40, revealed: false },
              { text: "الجريش", points: 25, revealed: false },
              { text: "المرقوق", points: 20, revealed: false },
              { text: "المطازيز", points: 15, revealed: false }
            ]
          },
          {
            question: "ماركات سيارات مشهورة",
            answers: [
              { text: "تويوتا", points: 30, revealed: false },
              { text: "هيونداي", points: 25, revealed: false },
              { text: "فورد", points: 20, revealed: false },
              { text: "مرسيدس", points: 15, revealed: false },
              { text: "بي إم دبليو", points: 10, revealed: false }
            ]
          },
          {
            question: "أشياء تجدها في حقيبة السفر",
            answers: [
              { text: "ملابس", points: 40, revealed: false },
              { text: "شاحن", points: 20, revealed: false },
              { text: "عطر", points: 15, revealed: false },
              { text: "جواز سفر", points: 15, revealed: false },
              { text: "فرشاة أسنان", points: 10, revealed: false }
            ]
          },
          {
            question: "هوايات يمارسها الناس",
            answers: [
              { text: "القراءة", points: 30, revealed: false },
              { text: "الرياضة", points: 25, revealed: false },
              { text: "الرسم", points: 20, revealed: false },
              { text: "الطبخ", points: 15, revealed: false },
              { text: "السفر", points: 10, revealed: false }
            ]
          },
          {
            question: "أشياء تشتريها من الصيدلية",
            answers: [
              { text: "بندول", points: 35, revealed: false },
              { text: "كمامات", points: 20, revealed: false },
              { text: "شامبو", points: 15, revealed: false },
              { text: "فيتامينات", points: 15, revealed: false },
              { text: "معجون أسنان", points: 15, revealed: false }
            ]
          },
          {
            question: "فواكه صيفية",
            answers: [
              { text: "رقي", points: 40, revealed: false },
              { text: "مانجو", points: 25, revealed: false },
              { text: "عنب", points: 15, revealed: false },
              { text: "تين", points: 10, revealed: false },
              { text: "خوخ", points: 10, revealed: false }
            ]
          }
        ];
        const selected = questions[Math.floor(Math.random() * questions.length)];
        const currentLeaders = room.data.leaders || { gold: null, black: null };
        room.data = {
          question: selected.question,
          answers: selected.answers,
          strikes: { gold: 0, black: 0 },
          scores: room.data.scores || { gold: 0, black: 0 },
          currentTurn: 'gold',
          roundPoints: 0,
          isStealOpportunity: false,
          leaders: currentLeaders,
          buzzerTimer: 3,
          buzzerActive: false
        };
        room.status = 'buzzer';

        const buzzerInterval = setInterval(() => {
          const r = teamRooms.get(roomId);
          if (r && r.status === 'buzzer' && r.gameType === 'teamfeud') {
            r.data.buzzerTimer--;
            if (r.data.buzzerTimer <= 0) {
              r.data.buzzerActive = true;
              clearInterval(buzzerInterval);
            }
            io.to(roomId).emit("team_game_state", r);
          } else {
            clearInterval(buzzerInterval);
          }
        }, 1000);
      } else if (room.gameType === 'codenames') {
        const wordsPool = ["تفاحة", "سيارة", "بيت", "بحر", "شمس", "قمر", "كتاب", "قلم", "مكتب", "كرسي", "نافذة", "باب", "طائرة", "قطار", "دراجة", "هاتف", "حاسوب", "ساعة", "نظارة", "حقيبة", "حذاء", "قميص", "بنطال", "قبعة", "وشاح", "أسد", "نمر", "فيل", "زرافة", "قرد", "كلب", "قطة", "عصفور", "سمكة", "وردة", "شجرة", "جبل", "نهر", "صحراء", "ثلج", "نار", "ماء", "خبز", "حليب", "قهوة", "شاي", "سكر", "ملح", "فلفل", "ليمون"];
        const shuffledWords = wordsPool.sort(() => 0.5 - Math.random()).slice(0, 25);
          const board = shuffledWords.map((word, i) => ({
            word,
            type: i < 9 ? 'gold' : i < 17 ? 'black' : i === 17 ? 'assassin' : 'neutral',
            revealed: false,
            votes: []
          })).sort(() => 0.5 - Math.random());        const currentSpymasters = room.data?.spymasters || { gold: null, black: null };
        room.data = {
          board,
          currentTurn: 'gold',
          scores: { gold: 9, black: 8 },
          spymasters: currentSpymasters
        };
      } else if (room.gameType === 'bombrelay') {
        const taskPool = [
          { text: "اكتب 'تفكيك' 5 مرات", target: 5 },
          { text: "حل المسألة: 15 + 27", answer: "42" },
          { text: "اكتب 'بوم' 3 مرات", target: 3 },
          { text: "حل المسألة: 12 * 4", answer: "48" },
          { text: "اكتب 'سرعة' 4 مرات", target: 4 },
          { text: "حل المسألة: 100 - 37", answer: "63" }
        ];
        const selectedTasks = taskPool.sort(() => 0.5 - Math.random()).slice(0, 3).map((t, i) => ({
          id: i + 1,
          ...t,
          count: t.target ? 0 : undefined,
          completed: false
        }));

        room.data = {
          timer: 60,
          tasks: selectedTasks,
          isDefused: false,
          isExploded: false
        };
        
        const interval = setInterval(() => {
          const r = teamRooms.get(roomId);
          if (r && r.status === 'playing' && r.gameType === 'bombrelay') {
            r.data.timer--;
            if (r.data.timer <= 0) {
              r.data.isExploded = true;
              r.status = 'results';
              clearInterval(interval);
            }
            io.to(roomId).emit("team_game_state", r);
          } else {
            clearInterval(interval);
          }
        }, 1000);
      }
      
      io.to(roomId).emit("team_game_state", room);
    }
  });

  socket.on("reset_team_game", (roomId) => {
    const room = teamRooms.get(roomId);
    if (room) {
      room.status = 'waiting';
      room.data = {};
      io.to(roomId).emit("team_game_state", room);
    }
  });

  socket.on("submit_team_action", ({ roomId, action, payload }) => {
    const room = teamRooms.get(roomId);
    if (!room) return;

    if (room.gameType === 'teamfeud') {
      if (action === 'set_leader') {
        if (!room.data.leaders) room.data.leaders = { gold: null, black: null };
        room.data.leaders[payload.team] = payload.playerId;
        io.to(roomId).emit("team_game_state", room);
        return;
      }

      if (action === 'buzz' && room.status === 'buzzer' && room.data.buzzerActive) {
        room.status = 'playing';
        room.data.currentTurn = payload.team;
        room.data.buzzerActive = false;
        io.to(roomId).emit("team_game_state", room);
        return;
      }

      if (room.status !== 'playing') return;
      if (action === 'guess') {
        const answer = room.data.answers.find((a: any) => a.text === payload.guess);
        if (answer && !answer.revealed) {
          answer.revealed = true;
          room.data.roundPoints += answer.points;
          
          if (room.data.isStealOpportunity) {
            // Steal successful
            room.data.scores[room.data.currentTurn] += room.data.roundPoints;
            room.data.roundPoints = 0;
            room.status = 'results';
          } else {
            // Check if all answers revealed
            if (room.data.answers.every((a: any) => a.revealed)) {
              room.data.scores[room.data.currentTurn] += room.data.roundPoints;
              room.data.roundPoints = 0;
              room.status = 'results';
            }
          }
        } else {
          room.data.strikes[room.data.currentTurn]++;
          
          if (room.data.isStealOpportunity) {
            // Steal failed, original team gets points
            const originalTeam = room.data.currentTurn === 'gold' ? 'black' : 'gold';
            room.data.scores[originalTeam] += room.data.roundPoints;
            room.data.roundPoints = 0;
            room.status = 'results';
          } else if (room.data.strikes[room.data.currentTurn] >= 3) {
            // 3 strikes, other team gets a chance to steal
            room.data.isStealOpportunity = true;
            room.data.currentTurn = room.data.currentTurn === 'gold' ? 'black' : 'gold';
            room.data.strikes[room.data.currentTurn] = 0; // Reset strikes for stealing team (they get 1 strike)
          }
        }
      }
    } else if (room.gameType === 'codenames') {
      if (action === 'set_spymaster') {
        if (!room.data.spymasters) room.data.spymasters = { gold: null, black: null };
        room.data.spymasters[payload.team] = payload.playerId;
        io.to(roomId).emit("team_game_state", room);
        return;
      }

      if (action === 'give_hint') {
        room.data.currentHint = { word: payload.word, count: payload.count };
        io.to(roomId).emit("team_game_state", room);
        return;
      }
      
      if (action === 'vote') {
        const card = room.data.board[payload.index];
        if (!card.revealed) {
          if (!card.votes) card.votes = [];
          const voteIndex = card.votes.indexOf(payload.playerId);
          if (voteIndex === -1) {
            card.votes.push(payload.playerId);
          } else {
            card.votes.splice(voteIndex, 1);
          }
          io.to(roomId).emit("team_game_state", room);
        }
        return;
      }

      if (action === 'reveal') {
        const card = room.data.board[payload.index];
        if (!card.revealed) {
          card.revealed = true;
          
          if (card.type === 'gold' || card.type === 'black') {
            room.data.scores[card.type]--;
          }
          
          if (room.data.scores.gold <= 0) {
            room.status = 'results';
            room.data.winner = 'gold';
          } else if (room.data.scores.black <= 0) {
            room.status = 'results';
            room.data.winner = 'black';
          } else if (card.type === 'assassin') {
            room.status = 'results';
            room.data.winner = room.data.currentTurn === 'gold' ? 'black' : 'gold';
          } else if (card.type !== room.data.currentTurn) {
            room.data.currentTurn = room.data.currentTurn === 'gold' ? 'black' : 'gold';
            room.data.currentHint = null; // Clear hint on turn change
          }
        }
      }
    } else if (room.gameType === 'bombrelay') {
      if (action === 'task_progress') {
        const task = room.data.tasks.find((t: any) => t.id === payload.taskId);
        if (task && !task.completed) {
          if (task.target) {
            task.count++;
            if (task.count >= task.target) task.completed = true;
          } else if (task.answer === payload.answer) {
            task.completed = true;
          }
          
          if (room.data.tasks.every((t: any) => t.completed)) {
            room.data.isDefused = true;
            room.status = 'results';
          }
        }
      }
    }
    
    io.to(roomId).emit("team_game_state", room);
  });



  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Twitch OAuth URL Helper
app.get("/api/auth/url", (req, res) => {
  const host = req.get('host');
  const protocol = host?.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/auth/callback`;
  
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'chat:read chat:edit whispers:read whispers:edit',
  });

  res.json({ url: `https://id.twitch.tv/oauth2/authorize?${params.toString()}` });
});

// OAuth Callback
app.get("/auth/callback", (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>Authentication successful. This window will close automatically.</p>
      </body>
    </html>
  `);
});

// 404 handler for API routes
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.url}`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

startServer();
