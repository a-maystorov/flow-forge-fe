import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useMoveTask = (boardId?: string) => {
  const queryClient = useQueryClient();

  const moveTaskMutation = useMutation({
    mutationFn: ({
      sourceColumnId,
      taskId,
      targetColumnId,
    }: {
      sourceColumnId: string;
      taskId: string;
      targetColumnId: string;
    }) => {
      if (!boardId) {
        throw new Error('Board ID is required');
      }
      return taskService.moveTask(boardId, sourceColumnId, taskId, targetColumnId);
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      }
      notifyUser.success('Task column changed', 'Task column has been successfully changed');
    },
    onError: (error) => notifyUser.error('Task column change failed', error.message),
  });

  return {
    moveTask: moveTaskMutation.mutate,
    isMovingTask: moveTaskMutation.isPending,
    isError: moveTaskMutation.isError,
    error: moveTaskMutation.error,
  };
};
