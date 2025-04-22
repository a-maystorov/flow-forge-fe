import { User } from './User';

export interface ChatSession {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  boardId?: string;
  taskId?: string;
  user: User;
}
