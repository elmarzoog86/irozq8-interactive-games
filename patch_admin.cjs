const fs = require('fs');

let adminContent = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

const stateHooks = `  // New state
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');`;

const adminStateReplacement = `  // New state
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');
  const [kickUsername, setKickUsername] = useState('');`;

adminContent = adminContent.replace(stateHooks, adminStateReplacement);

const adminLogic = `        case 'end_game':
            socket.emit('admin_action', {
                actionType: 'end_game',
                targetStreamerId: selectedTarget
            });
            return;`;

const adminLogicReplacement = `        case 'end_game':
            socket.emit('admin_action', {
                actionType: 'end_game',
                targetStreamerId: selectedTarget
            });
            return;
        case 'kick_player':
            if (!kickUsername) return;
            socket.emit('admin_action', {
                actionType: 'kick_player',
                username: kickUsername,
                targetStreamerId: selectedTarget
            });
            setKickUsername('');
            return;`;

adminContent = adminContent.replace(adminLogic, adminLogicReplacement);


const adminUi = `                    <button onClick={() => triggerEvent('end_game')} className="w-full bg-red-900 hover:bg-red-800 border border-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] mt-4">
                        إنهاء اللعبة الحالية 🛑
                    </button>`;

const adminUiReplacement = `                    <button onClick={() => triggerEvent('end_game')} className="w-full bg-red-900 hover:bg-red-800 border border-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] mt-4">
                        إنهاء اللعبة الحالية 🛑
                    </button>
                    
                    <div className="pt-6 mt-6 border-t border-red-500/20 text-black">
                        <div className="flex gap-4">
                            <input 
                                type="text" 
                                value={kickUsername} 
                                onChange={e => setKickUsername(e.target.value)} 
                                placeholder="اسم اللاعب لطرده / إقصائه..." 
                                className="flex-1 bg-black border border-red-700 p-4 rounded-xl text-white outline-none focus:border-red-500" 
                            />
                            <button 
                                onClick={() => triggerEvent('kick_player')} 
                                className="bg-red-900 hover:bg-red-700 text-white font-black px-8 rounded-xl transition-all border border-red-500"
                            >
                                إقصاء 🚫
                            </button>
                        </div>
                    </div>`;

adminContent = adminContent.replace(adminUi, adminUiReplacement);

fs.writeFileSync('src/pages/Admin.tsx', adminContent);

let chatContent = fs.readFileSync('src/hooks/useTwitchChat.ts', 'utf-8');

const hookStart = `  const clientRef = useRef<tmi.Client | null>(null);`;
const hookReplacement = `  const clientRef = useRef<tmi.Client | null>(null);
  const bannedUsersRef = useRef<Set<string>>(new Set());`;

chatContent = chatContent.replace(hookStart, hookReplacement);

const listenerStr = `      const newMessage: ChatMessage = {
        id: tags.id || Math.random().toString(36).substring(2, 15),
        username: tags['display-name'] || tags.username || 'unknown',
        message: message,
        timestamp: Date.now(),
        color: tags.color || '#818cf8',
      };

      setMessages((prev) => [...prev, newMessage].slice(-30));`;

const listenerRepl = `      const rawUsername = (tags.username || '').toLowerCase();
      if (bannedUsersRef.current.has(rawUsername)) return; // Completely ignore messages from kicked players

      const newMessage: ChatMessage = {
        id: tags.id || Math.random().toString(36).substring(2, 15),
        username: tags['display-name'] || tags.username || 'unknown',
        message: message,
        timestamp: Date.now(),
        color: tags.color || '#818cf8',
      };

      setMessages((prev) => [...prev, newMessage].slice(-30));`;
chatContent = chatContent.replace(listenerStr, listenerRepl);


const adminEvent = `      if (payload.actionType === 'fake_chat') {
        const newMessage: ChatMessage = {
          id: 'admin_' + Math.random().toString(36).substring(2, 15),
          username: payload.username || 'admin',
          message: payload.message,
          timestamp: Date.now(),
          color: '#ff0000',
        };
        setMessages((prev) => [...prev, newMessage].slice(-30));
      }
    };`;

const adminEventRepl = `      if (payload.actionType === 'fake_chat') {
        const newMessage: ChatMessage = {
          id: 'admin_' + Math.random().toString(36).substring(2, 15),
          username: payload.username || 'admin',
          message: payload.message,
          timestamp: Date.now(),
          color: '#ff0000',
        };
        setMessages((prev) => [...prev, newMessage].slice(-30));
      }
      if (payload.actionType === 'kick_player' && payload.username) {
        const target = payload.username.toLowerCase().replace('@', '');
        bannedUsersRef.current.add(target);
        
        // Also push a system message so games can optionally parse "!admin_kick" if needed
        const kickMsg: ChatMessage = {
          id: 'kick_' + Math.random().toString(36).substring(2, 15),
          username: 'admin',
          message: '!admin_kick ' + target,
          timestamp: Date.now(),
          color: '#ff0000',
        };
        setMessages(prev => [...prev, kickMsg].slice(-30));
      }
    };`;

chatContent = chatContent.replace(adminEvent, adminEventRepl);

fs.writeFileSync('src/hooks/useTwitchChat.ts', chatContent);
console.log('patched');