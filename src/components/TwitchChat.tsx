import React from 'react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

interface TwitchChatProps {
  channelName: string;
  messages: ChatMessage[];
  isConnected: boolean;
  error: string | null;
}

// No-op Twitch chat component  the streamer requested that chat be hidden
// from the public site. Keeping this module export intact prevents the need
// to change many import sites across the codebase.
export const TwitchChat: React.FC<TwitchChatProps> = () => {
  return null;
};

export default TwitchChat;
