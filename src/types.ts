export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  color?: string;
}

export interface Player {
  username: string;
  number: number;
  score: number;
  lives: number;
  fruit?: string;
  status: 'active' | 'eliminated';
  color?: string;
}
