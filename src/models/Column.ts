import Task from './Task';

export default interface Column {
  _id: string;
  name: string;
  tasks: Task[];
  boardId: string;
}
