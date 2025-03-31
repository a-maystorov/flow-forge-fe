import { getTaskFromBoard } from '@/features/tasks/selectors/taskSelectors';
import Board from '@/models/Board';
import Subtask from '@/models/Subtask';

/**
 * Get a subtask from board data by its ID
 *
 * This selector allows components to access subtask data without
 * requiring separate API calls
 */
export const getSubtaskFromBoard = (
  board?: Board,
  taskId?: string,
  subtaskId?: string
): Subtask | null => {
  if (!board || !taskId || !subtaskId) {
    return null;
  }

  const task = getTaskFromBoard(board, taskId);
  if (!task) {
    return null;
  }

  return task.subtasks.find((subtask) => subtask._id === subtaskId) || null;
};

/**
 * Get all subtasks for a task from board data
 */
export const getSubtasksForTask = (board?: Board, taskId?: string): Subtask[] => {
  if (!board || !taskId) {
    return [];
  }

  const task = getTaskFromBoard(board, taskId);
  return task?.subtasks || [];
};
