import Column from '../models/Column';
import Task from '../models/Task';

export const updateTaskPosition = (tasks: Task[], taskId: string, newPosition: number): Task[] => {
  const taskIndex = tasks.findIndex((t) => t._id === taskId);
  if (taskIndex === -1) {
    return tasks;
  }

  const updatedTasks = [...tasks];
  const [task] = updatedTasks.splice(taskIndex, 1);
  updatedTasks.splice(newPosition, 0, { ...task, position: newPosition });

  return updatedTasks.map((t, index) => ({
    ...t,
    position: index,
  }));
};

export const moveTaskBetweenColumns = (
  columns: Column[],
  sourceColumnId: string,
  targetColumnId: string,
  taskId: string
): Column[] => {
  return columns.map((col) => {
    // Remove from source column
    if (col._id === sourceColumnId) {
      const remainingTasks = col.tasks.filter((t) => t._id !== taskId);
      const updatedTasks = remainingTasks.map((t, index) => ({
        ...t,
        position: index,
      }));

      return {
        ...col,
        tasks: updatedTasks,
      };
    }

    // Add to target column
    if (col._id === targetColumnId) {
      const task = columns
        .find((c) => c._id === sourceColumnId)
        ?.tasks.find((t) => t._id === taskId);

      if (!task) {
        return col;
      }

      const updatedTasks = [
        {
          ...task,
          columnId: targetColumnId,
          position: 0,
        },
        ...col.tasks.map((t) => ({
          ...t,
          position: t.position + 1,
        })),
      ];

      return {
        ...col,
        tasks: updatedTasks,
      };
    }

    return col;
  });
};
