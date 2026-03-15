const fs = require('fs');

const file = 'src/hooks/useTwitchChat.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { socket } from '../socket';")) {
  content = content.replace(
    "import { ChatMessage } from '../types';",
    "import { ChatMessage } from '../types';\nimport { socket } from '../socket';"
  );
}

const adminEventCode = `
    const handleAdminEvent = (payload: any) => {
      if (payload.actionType === 'fake_chat') {
        const newMessage: ChatMessage = {
          id: 'admin_' + Math.random().toString(36).substring(2, 15),
          username: payload.username || 'admin',
          message: payload.message,
          timestamp: Date.now(),
          color: '#ff0000',
        };
        setMessages((prev) => [...prev, newMessage].slice(-30));
      }
    };
    socket.on('admin_event', handleAdminEvent);
`;

const cleanupCode = `
      socket.off('admin_event', handleAdminEvent);
`;

if (!content.includes("handleAdminEvent")) {
  content = content.replace(
    /const connect = async \(\) => {/,
    adminEventCode + "\n    const connect = async () => {"
  );

  content = content.replace(
    /clientRef\.current = null;\n      }/,
    "clientRef.current = null;\n      }\n" + cleanupCode
  );
  
  fs.writeFileSync(file, content);
  console.log('useTwitchChat updated');
} else {
  console.log('useTwitchChat already updated');
}
