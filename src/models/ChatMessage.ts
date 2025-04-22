import { User } from './User';

export interface ChatMessage {
  _id: string;
  sessionId: string;
  content: string;
  createdAt: string;
  user: User;
  role: 'user' | 'assistant';
}
