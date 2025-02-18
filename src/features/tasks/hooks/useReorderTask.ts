import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useReorderTask = (boardId: string) => {
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
    }) => taskService.reorderTask(boardId, columnId, taskId, newPosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    reorderTask: reorderTaskMutation.mutate,
    isReorderingTask: reorderTaskMutation.isPending,
  };
};
