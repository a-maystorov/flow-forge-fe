import { BoardContext } from './BoardContext';

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  boardContext?: BoardContext;
}

export default Chat;
