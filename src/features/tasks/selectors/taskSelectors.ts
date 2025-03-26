import Board from '@/models/Board';
import Subtask from '@/models/Subtask';
import Task from '@/models/Task';

/**
 * Get a task from board data by its ID
 *
 * This selector allows components to access task data without
 * requiring separate API calls
 */
export const getTaskFromBoard = (board?: Board, taskId?: string): Task | null => {
  if (!board || !taskId) {
    return null;
  }

  for (const column of board.columns) {
    const task = column.tasks.find((task) => task._id === taskId);
    if (task) {
      return task;
    }
  }

  return null;
};

/**
 * Get all subtasks for a task from board data
 */
export const getSubtasksFromBoard = (board?: Board, taskId?: string): Subtask[] => {
  if (!board || !taskId) {
    return [];
  }

  const task = getTaskFromBoard(board, taskId);
  return task?.subtasks || [];
};

/**
 * Get the column ID for a task from board data
 */
export const getColumnIdForTask = (board?: Board, taskId?: string): string | null => {
  if (!board || !taskId) {
    return null;
  }

  for (const column of board.columns) {
    const task = column.tasks.find((task) => task._id === taskId);
    if (task) {
      return column._id;
    }
  }

  return null;
};
