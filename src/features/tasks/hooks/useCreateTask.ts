import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useCreateTask = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      taskService.createTask(boardId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
  };
};
