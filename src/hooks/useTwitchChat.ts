import { useState, useEffect, useRef } from 'react';
import tmi from 'tmi.js';
import { ChatMessage } from '../types';

interface UseTwitchChatProps {
  channelName: string;
  accessToken?: string;
}

export function useTwitchChat({ channelName, accessToken }: UseTwitchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientRef = useRef<tmi.Client | null>(null);

  useEffect(() => {
    if (!channelName) return;

    const client = new tmi.Client({
      options: { debug: false },
      connection: {
        secure: true,
        reconnect: true
      },
      channels: [channelName]
    });

    clientRef.current = client;

    client.on('message', (channel, tags, message, self) => {
      if (self) return;

      const newMessage: ChatMessage = {
        id: tags.id || Math.random().toString(36).substring(2, 15),
        username: tags['display-name'] || tags.username || 'unknown',
        message: message,
        timestamp: Date.now(),
        color: tags.color || '#818cf8',
      };

      setMessages((prev) => [...prev, newMessage].slice(-100));
    });

    client.on('connected', () => {
      console.log(`Connected to ${channelName}`);
      setIsConnected(true);
      setError(null);
    });

    client.on('disconnected', (reason) => {
      console.log(`Disconnected: ${reason}`);
      setIsConnected(false);
    });

    const connect = async () => {
      try {
        await client.connect();
      } catch (err: any) {
        console.error('Failed to connect to Twitch:', err);
        setError('فشل الاتصال بدردشة تويتش. تأكد من اسم القناة.');
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [channelName]);

  return { messages, isConnected, error };
}
