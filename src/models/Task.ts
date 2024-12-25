import Subtask from './Subtask';

export default interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'Doing' | 'Done';
  subtasks: Subtask[];
  columnId: string;
}
