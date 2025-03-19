import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useReorderTask = (boardId?: string) => {
  const queryClient = useQueryClient();

  const reorderTaskMutation = useMutation({
    mutationFn: ({
      columnId,
      taskId,
      newPosition,
    }: {
      columnId: string;
      taskId: string;
      newPosition: number;
    }) => {
      if (!boardId) {
        throw new Error('Board ID is required');
      }
      return taskService.reorderTask(boardId, columnId, taskId, newPosition);
    },
    onSuccess: () => {
      if (boardId) {
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      }
      notifyUser.success('Task reordered', 'Task has been successfully moved');
    },
    onError: (error) => notifyUser.error('Task reordering failed', error.message),
  });

  return {
    reorderTask: reorderTaskMutation.mutate,
    isReorderingTask: reorderTaskMutation.isPending,
    isError: reorderTaskMutation.isError,
    error: reorderTaskMutation.error,
  };
};
