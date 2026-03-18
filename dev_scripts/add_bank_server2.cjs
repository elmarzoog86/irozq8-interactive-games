const fs = require('fs');
const path = require('path');

const serverFile = path.resolve(__dirname, '../server.ts');
let content = fs.readFileSync(serverFile, 'utf8');

// 1. Add bankRobberyRooms map
if (!content.includes('const bankRobberyRooms =')) {
  content = content.replace(
    /const howManyRooms = new Map\(\);/g,
    "const howManyRooms = new Map();\nconst bankRobberyRooms = new Map();"
  );
}

// 2. Add Socket endpoints before disconnect
const socketLogic = `
  // --- BANK ROBBERY GAME ---
  socket.on("br_host_lobby", ({ roomId }) => {
    socket.join(roomId);
    if (!bankRobberyRooms.has(roomId)) {
      bankRobberyRooms.set(roomId, {
        roomId,
        status: 'lobby',
        players: [],
        readyPlayers: new Set(),
        mastermindId: null,
        currentTeam: [],
        votes: {},
        roundHeists: [],
        heistResults: [],
        mafiaTarget: null,
        mafiaStatus: null // 'won' | 'lost' | null
      });
    }
    io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
  });

  socket.on("br_join_game", ({ roomId, name }) => {
    socket.join(roomId);
    const room = bankRobberyRooms.get(roomId);
    if (room && room.status === 'lobby') {
      room.players.push({
        id: socket.id,
        name,
        role: null, // assigned when game starts
        benched: false 
      });
      io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
    }
  });

  socket.on("br_start_game", (roomId) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room) return;
    
    // Assign roles (Mafia Boss, Cops, Robbers)
    const playerCount = room.players.length;
    let numCops = Math.max(1, Math.floor(playerCount / 3));
    let numBoss = 1;
    let numRobbers = playerCount - numCops - numBoss;

    const roles = [];
    for(let i=0; i<numCops; i++) roles.push('cop');
    for(let i=0; i<numBoss; i++) roles.push('boss');
    for(let i=0; i<numRobbers; i++) roles.push('robber');
    
    roles.sort(() => Math.random() - 0.5);

    room.players.forEach((p, index) => {
      p.role = roles[index];
    });

    room.status = 'role_reveal';
    room.mastermindId = room.players[Math.floor(Math.random() * room.players.length)].id;
    io.to(roomId).emit("br_state_update", getBrSafeState(roomId));

    // Send private roles
    room.players.forEach(p => {
      const isBoss = p.role === 'boss';
      const copList = isBoss || p.role === 'cop' ? room.players.filter(b => b.role === 'cop').map(b=>b.id) : [];
      io.to(p.id).emit("br_private_role", { role: p.role, copList });
    });
  });
  
  socket.on("br_ready_next", ({ roomId }) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room) return;
    room.readyPlayers.add(socket.id);
    if(room.readyPlayers.size >= room.players.length) {
       room.status = 'planning';
       room.currentTeam = [];
       room.votes = {};
       room.readyPlayers.clear();
       io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
    }
  });

  socket.on("br_propose_team", ({ roomId, proposedTeamIds }) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room) return;
    room.currentTeam = proposedTeamIds;
    room.status = 'voting';
    room.votes = {};
    io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
  });

  socket.on("br_submit_vote", ({ roomId, vote }) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room || room.status !== 'voting') return;
    
    room.votes[socket.id] = vote;
    
    if (Object.keys(room.votes).length === room.players.length) {
      // Tally votes
      let yes = 0, no = 0;
      Object.values(room.votes).forEach(v => v === 'approve' ? yes++ : no++);
      
      if (yes > no) { // Majority wins
        room.status = 'heist';
        room.heistVotes = {}; // New tracking for Actions
      } else {
        // Next Mastermind
        let mIndex = room.players.findIndex(p => p.id === room.mastermindId);
        room.mastermindId = room.players[(mIndex + 1) % room.players.length].id;
        room.status = 'planning';
        room.currentTeam = [];
        room.votes = {};
      }
      io.to(roomId).emit("br_vote_result", { yes, no });
      setTimeout(() => {
        io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
      }, 3000);
    } else {
      io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
    }
  });

  socket.on("br_submit_heist_action", ({ roomId, action }) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room || room.status !== 'heist') return;

    room.heistVotes[socket.id] = action; // 'steal' or 'alarm'
    
    if(Object.keys(room.heistVotes).length === room.currentTeam.length) {
      let alarms = 0;
      Object.values(room.heistVotes).forEach(v => v === 'alarm' ? alarms++ : 0);
      
      const success = alarms === 0;
      room.roundHeists.push(success);
      room.heistResults.push(alarms);
      
      // Check win conditions
      const successes = room.roundHeists.filter(h => h === true).length;
      const fails = room.roundHeists.filter(h => h === false).length;

      if (successes >= 3) {
         room.status = 'assassination'; // Cops get 1 chance
      } else if (fails >= 3) {
         room.status = 'cops_won';
      } else {
         room.status = 'planning';
         let mIndex = room.players.findIndex(p => p.id === room.mastermindId);
         room.mastermindId = room.players[(mIndex + 1) % room.players.length].id;
         room.currentTeam = [];
         room.votes = {};
         room.heistVotes = {};
      }
      
      io.to(roomId).emit("br_heist_result", { alarms, success, totalSuccess: successes, totalFails: fails });
      setTimeout(() => {
         io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
      }, 5000);
    }
  });

  socket.on("br_assassinate", ({ roomId, targetId }) => {
    const room = bankRobberyRooms.get(roomId);
    if (!room || room.status !== 'assassination') return;

    const target = room.players.find(p => p.id === targetId);
    if(target && target.role === 'boss') {
       room.status = 'cops_won_assassination';
    } else {
       room.status = 'robbers_won';
    }
    io.to(roomId).emit("br_state_update", getBrSafeState(roomId));
  });

`;

const safeStateFunc = `
function getBrSafeState(roomId) {
  const room = bankRobberyRooms.get(roomId);
  if (!room) return null;
  return {
    roomId: room.roomId,
    status: room.status,
    players: room.players.map(p => ({ id: p.id, name: p.name, benched: p.benched })), // hide roles
    mastermindId: room.mastermindId,
    currentTeam: room.currentTeam,
    votes: room.votes,
    heistVotesCount: Object.keys(room.heistVotes || {}).length,
    roundHeists: room.roundHeists,
    heistResults: room.heistResults
  };
}
`;

if (!content.includes('function getBrSafeState')) {
  // Inject function outside io.on
  content = content.replace("io.on(\"connection\"", safeStateFunc + "\n\nio.on(\"connection\"");
}

if (!content.includes('socket.on("br_host_lobby"')) {
  content = content.replace(
    /socket\.on\("disconnect"/g,
    socketLogic + '\n  socket.on("disconnect"'
  );
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('Appended bank robbery logic correctly to server.ts');
