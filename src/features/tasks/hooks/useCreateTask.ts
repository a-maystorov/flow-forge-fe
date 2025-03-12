import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useCreateTask = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      taskService.createTask(boardId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Task created', 'Task has been successfully created');
    },
    onError: (error) => notifyUser.error('Task creation failed', error.message),
  });

  return {
    createTask: createTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
  };
};
