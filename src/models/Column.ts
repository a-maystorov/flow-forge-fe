import Task from './Task';

export default interface Column {
  name: string;
  tasks: Task[];
  boardId: string;
}
