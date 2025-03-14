import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';

export const useDeleteTask = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(boardId, columnId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Task deleted', 'Task has been successfully deleted');
    },
    onError: (error) => {
      notifyUser.error('Task deletion failed', error.message);
    },
  });

  return {
    deleteTask: deleteTaskMutation.mutate,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
