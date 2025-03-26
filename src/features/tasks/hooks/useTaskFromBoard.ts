import { useBoard } from '@/features/boards/hooks';
import { useMemo } from 'react';
import { getSubtasksFromBoard, getTaskFromBoard } from '../selectors/taskSelectors';

/**
 * Hook that extracts a specific task from the board data
 *
 * This hook follows the Normalized Cache Pattern by providing
 * focused access to task data without additional API calls
 */
export const useTaskFromBoard = (boardId: string, taskId: string) => {
  const { board, isFetchingBoard } = useBoard(boardId);
  const task = useMemo(() => getTaskFromBoard(board, taskId), [board, taskId]);
  const subtasks = useMemo(() => getSubtasksFromBoard(board, taskId), [board, taskId]);

  return {
    task,
    subtasks,
    isFetchingTask: isFetchingBoard || !task,
  };
};
