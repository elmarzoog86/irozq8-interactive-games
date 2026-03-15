const fs = require('fs');

let content = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Add state for fake chat
const stateHooks = `  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [streamers, setStreamers] = useState<StreamerInfo[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // New state
  const [fakeUsername, setFakeUsername] = useState('');
  const [fakeMessage, setFakeMessage] = useState('');`;

content = content.replace(`  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [streamers, setStreamers] = useState<StreamerInfo[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);`, stateHooks);

// Add logic for fake chat & end game
const newLogic = `
        case 'fake_chat':
            if (!fakeUsername || !fakeMessage) return;
            socket.emit('admin_action', {
                actionType: 'fake_chat',
                username: fakeUsername,
                message: fakeMessage,
                targetStreamerId: selectedTarget
            });
            return;
        case 'end_game':
            socket.emit('admin_action', {
                actionType: 'end_game',
                targetStreamerId: selectedTarget
            });
            return;`;

content = content.replace(`    let payload: any = { actionType: 'overlay', targetStreamerId: selectedTarget };

    switch (preset) {`, `    let payload: any = { actionType: 'overlay', targetStreamerId: selectedTarget };

    switch (preset) {${newLogic}`);

// Add UI
const newUI = `            <div className="bg-red-900/20 border border-red-500/50 p-8 rounded-3xl space-y-6">
                <h2 className="text-2xl font-black text-red-500 mb-6 border-b border-red-500/20 pb-4 flex items-center gap-3">
                    <ShieldAlert />
                    تحكم اللعبة المباشر
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-black">
                        <input type="text" value={fakeUsername} onChange={e => setFakeUsername(e.target.value)} placeholder="اسم اللاعب المتوقع..." className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-red-500" />
                        <input type="text" value={fakeMessage} onChange={e => setFakeMessage(e.target.value)} placeholder="الرسالة / الإجابة / الأمر (!join)..." className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-red-500" />
                    </div>
                    <button onClick={() => triggerEvent('fake_chat')} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        إرسال رسالة وهمية 💬
                    </button>
                    <button onClick={() => triggerEvent('end_game')} className="w-full bg-red-900 hover:bg-red-800 border border-red-500 text-white font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] mt-4">
                        إنهاء اللعبة الحالية 🛑
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900/50`;

content = content.replace(`            <div className="bg-zinc-900/50`, newUI);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('src/pages/Admin.tsx updated');
