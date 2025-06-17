import Message from './Message';

// BoardContext interfaces matching backend schema
interface Subtask {
  title: string;
  description: string;
}

interface Task {
  title: string;
  description: string;
  subtasks: Subtask[];
}

interface Column {
  name: string;
  tasks: Task[];
}

export interface BoardContext {
  name: string;
  description: string;
  columns: Column[];
}

interface Chat {
  _id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  boardContext?: BoardContext;
  messages?: Message[]; // Used in frontend but not directly in backend schema
}

export default Chat;
