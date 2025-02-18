import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useDeleteTask = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(boardId, columnId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    deleteTask: deleteTaskMutation.mutate,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
