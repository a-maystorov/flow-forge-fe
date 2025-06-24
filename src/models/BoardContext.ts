export interface BoardContext {
  name: string;
  description: string;
  columns: Column[];
}

interface Column {
  name: string;
  _id: string;
  tasks: Task[];
}

interface Task {
  title: string;
  description: string;
  _id: string;
  subtasks: Subtask[];
}

interface Subtask {
  title: string;
  description: string;
  _id: string;
}
