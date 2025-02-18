import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useMoveTask = (boardId: string) => {
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
    }) => taskService.moveTask(boardId, sourceColumnId, taskId, targetColumnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    moveTask: moveTaskMutation.mutate,
    isMovingTask: moveTaskMutation.isPending,
  };
};
