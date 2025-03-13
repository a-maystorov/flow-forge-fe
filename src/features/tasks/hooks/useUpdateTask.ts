import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useUpdateTask = (boardId: string, columnId: string, taskId: string) => {
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      taskService.updateTask(boardId, columnId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Task updated', 'Task has been successfully updated');
    },
    onError: (error) => notifyUser.error('Task update failed', error.message),
  });

  return {
    updateTask: updateTaskMutation.mutate,
    isUpdatingTask: updateTaskMutation.isPending,
  };
};
