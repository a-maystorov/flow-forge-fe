import { User } from './User';
import { ChatIntent } from './Suggestion';

export interface ChatMessageMetadata {
  intent?: ChatIntent;
  confidence?: number;
  thoughtProcess?: string;
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  content: string;
  createdAt: string;
  user: User;
  role: 'user' | 'assistant';
  metadata?: ChatMessageMetadata;
}
