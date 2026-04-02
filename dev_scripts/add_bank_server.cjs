const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const bankTypes = `
// --- BANK ROBBERY (AVALON LOGIC) STATE ---
interface BankPlayer {
  id: string; // socketId
  name: string;
  role: 'cop' | 'robber' | 'boss';
  isConnected: boolean;
}

interface BankGameState {
  players: BankPlayer[];
  status: 'lobby' | 'team_building' | 'voting' | 'mission' | 'result' | 'assassinate' | 'game_over';
  round: number; // 0 to 4 (5 rounds)
  missionHistory: ('success' | 'fail' | null)[]; // length 5
  historyDetails: {team: string[], successes: number, fails: number}[];
  currentLeaderIndex: number;
  proposedTeam: string[]; // player ids
  votes: Record<string, 'approve' | 'reject'>; // id -> vote
  missionVotes: Record<string, 'steal' | 'alarm'>;
  missionFailsNeeded: number;
  missionSize: number;
  winner: 'robbers' | 'cops' | null;
  winReason: string | null;
  rejectTracker: number; // how many proposed teams rejected this round
}

const bankRooms = new Map<string, BankGameState>();

const getMissionConfig = (playerCount: number, round: number) => {
  // players: 4, 5, 6, 7, 8, 9, 10
  const configs: Record<number, {sizes: number[], failsNeeded: number[]}> = {
    4: { sizes: [2, 2, 2, 3, 3], failsNeeded: [1, 1, 1, 1, 1] },
    5: { sizes: [2, 3, 2, 3, 3], failsNeeded: [1, 1, 1, 1, 1] },
    6: { sizes: [2, 3, 4, 3, 4], failsNeeded: [1, 1, 1, 1, 1] },
    7: { sizes: [2, 3, 3, 4, 4], failsNeeded: [1, 1, 1, 2, 1] },
    8: { sizes: [3, 4, 4, 5, 5], failsNeeded: [1, 1, 1, 2, 1] },
    9: { sizes: [3, 4, 4, 5, 5], failsNeeded: [1, 1, 1, 2, 1] },
    10: { sizes: [3, 4, 4, 5, 5], failsNeeded: [1, 1, 1, 2, 1] },
  };
  const count = Math.max(4, Math.min(10, playerCount));
  return {
    size: configs[count].sizes[round] || 2,
    failsNeeded: configs[count].failsNeeded[round] || 1
  };
};
`;

if (!code.includes('BankGameState')) {
  code = code.replace('const teamRooms = new Map<string, TeamGameState>();', 'const teamRooms = new Map<string, TeamGameState>();\n' + bankTypes);
}

const bankListeners = `
  // --- BANK ROBBERY LOGIC ---
  socket.on("host_bank_lobby", ({ roomId }) => {
    socket.join(roomId);
    if (!bankRooms.has(roomId)) {
      bankRooms.set(roomId, {
        players: [],
        status: 'lobby',
        round: 0,
        missionHistory: [null, null, null, null, null],
        historyDetails: [],
        currentLeaderIndex: 0,
        proposedTeam: [],
        votes: {},
        missionVotes: {},
        missionFailsNeeded: 1,
        missionSize: 2,
        winner: null,
        winReason: null,
        rejectTracker: 0
      });
    }
    io.to(roomId).emit("bank_state_update", bankRooms.get(roomId));
  });

  socket.on("join_bank_lobby", ({ roomId, name }) => {
    socket.join(roomId);
    const room = bankRooms.get(roomId);
    if (room && room.status === 'lobby') {
      if (!room.players.find(p => p.id === socket.id)) {
        room.players.push({
          id: socket.id,
          name,
          role: 'robber',
          isConnected: true
        });
        io.to(roomId).emit("bank_state_update", room);
      }
    }
  });

  socket.on("bank_disconnect", ({ roomId }) => {
     const room = bankRooms.get(roomId);
     if (room) {
       const p = room.players.find(x => x.id === socket.id);
       if (p) {
         p.isConnected = false;
         io.to(roomId).emit("bank_state_update", room);
       }
     }
  });

  socket.on("start_bank_game", (roomId) => {
    const room = bankRooms.get(roomId);
    if (!room) return;
    
    // allow testing with 3 players technically, though best 4+
    const pCount = Math.max(4, room.players.length); 

    // Assign roles
    let numCops = 1;
    if (room.players.length >= 10) numCops = 4;
    else if (room.players.length >= 7) numCops = 3;
    else if (room.players.length >= 5) numCops = 2;

    let roles: ('cop'|'boss'|'robber')[] = ['boss'];
    for(let i=0; i<numCops; i++) roles.push('cop');
    while(roles.length < room.players.length) roles.push('robber');
    
    // Shuffle roles
    roles.sort(() => Math.random() - 0.5);
    
    room.players.forEach((p, i) => {
      p.role = roles[i];
    });

    // Shuffle players for turn order
    room.players.sort(() => Math.random() - 0.5);

    room.status = 'team_building';
    room.round = 0;
    room.rejectTracker = 0;
    room.currentLeaderIndex = 0;
    
    const config = getMissionConfig(room.players.length, 0);
    room.missionSize = config.size;
    room.missionFailsNeeded = config.failsNeeded;

    io.to(roomId).emit("bank_state_update", room);
  });

  socket.on("bank_propose_team", ({ roomId, teamIds }) => {
    const room = bankRooms.get(roomId);
    if (!room || room.status !== 'team_building') return;

    room.proposedTeam = teamIds;
    room.status = 'voting';
    room.votes = {};
    io.to(roomId).emit("bank_state_update", room);
  });

  socket.on("bank_vote_team", ({ roomId, vote }) => {
    const room = bankRooms.get(roomId);
    if (!room || room.status !== 'voting') return;

    room.votes[socket.id] = vote;
    
    const expectedVotes = room.players.filter(p => p.isConnected).length;
    
    // If everyone voted
    if (Object.keys(room.votes).length >= expectedVotes) {
      let approves = 0;
      let rejects = 0;
      Object.values(room.votes).forEach(v => v === 'approve' ? approves++ : rejects++);
      
      if (approves > rejects) {
        room.status = 'mission';
        room.missionVotes = {};
      } else {
        // rejected
        room.status = 'team_building';
        room.rejectTracker++;
        room.currentLeaderIndex = (room.currentLeaderIndex + 1) % room.players.length;
        room.proposedTeam = [];
      }
      io.to(roomId).emit("bank_state_update", room);
    } else {
      io.to(roomId).emit("bank_state_update", room);
    }
  });

  socket.on("bank_execute_mission", ({ roomId, vote }) => {
    const room = bankRooms.get(roomId);
    if (!room || room.status !== 'mission') return;

    // only proposed team can vote
    if (!room.proposedTeam.includes(socket.id)) return;

    room.missionVotes[socket.id] = vote;

    if (Object.keys(room.missionVotes).length >= room.missionSize) {
      // Tally results
      let fails = 0;
      Object.values(room.missionVotes).forEach(v => v === 'alarm' ? fails++ : 0);

      const isSuccess = fails < room.missionFailsNeeded;
      room.missionHistory[room.round] = isSuccess ? 'success' : 'fail';
      room.historyDetails.push({ 
        team: [...room.proposedTeam], 
        successes: room.missionSize - fails, 
        fails 
      });

      room.status = 'result';
      io.to(roomId).emit("bank_state_update", room);
    }
  });

  socket.on("bank_next_round", ({ roomId }) => {
    const room = bankRooms.get(roomId);
    if (!room) return;

    // Evaluate game over conditions
    let successes = room.missionHistory.filter(h => h === 'success').length;
    let fails = room.missionHistory.filter(h => h === 'fail').length;

    if (successes >= 3) {
      room.status = 'assassinate';
      io.to(roomId).emit("bank_state_update", room);
      return;
    }

    if (fails >= 3) {
      room.status = 'game_over';
      room.winner = 'cops';
      room.winReason = '3 Failed Heists';
      io.to(roomId).emit("bank_state_update", room);
      return;
    }

    room.round++;
    room.status = 'team_building';
    room.rejectTracker = 0;
    room.currentLeaderIndex = (room.currentLeaderIndex + 1) % room.players.length;
    room.proposedTeam = [];
    room.votes = {};
    room.missionVotes = {};
    
    const config = getMissionConfig(room.players.length, room.round);
    room.missionSize = config.size;
    room.missionFailsNeeded = config.failsNeeded;

    io.to(roomId).emit("bank_state_update", room);
  });

  socket.on("bank_assassinate", ({ roomId, targetId }) => {
    const room = bankRooms.get(roomId);
    if (!room || room.status !== 'assassinate') return;

    const target = room.players.find(p => p.id === targetId);
    if (target && target.role === 'boss') {
      room.winner = 'cops';
      room.winReason = 'The Mafia Boss was Assassinated';
    } else {
      room.winner = 'robbers';
      room.winReason = '3 Successful Heists & Boss Survived';
    }
    room.status = 'game_over';
    io.to(roomId).emit("bank_state_update", room);
  });
`;

if (!code.includes('host_bank_lobby')) {
  code = code.replace('io.on("connection", (socket) => {', 'io.on("connection", (socket) => {\n' + bankListeners);
}

fs.writeFileSync('server.ts', code, 'utf8');
console.log('Server updated!');