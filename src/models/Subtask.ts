export default interface Subtask {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  taskId: string;
}
