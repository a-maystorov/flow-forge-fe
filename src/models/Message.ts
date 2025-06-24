export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

interface Message {
  _id: string;
  id?: string; // For temporary IDs used by socket.io
  chatId: string;
  content: string;
  role: MessageRole;
  createdAt: string;
  updatedAt: string;
  userId: string;

  loading?: boolean;
  error?: boolean;
  action?: string;
  message?: string; // Some socket events use 'message' instead of 'content'
}

export default Message;
