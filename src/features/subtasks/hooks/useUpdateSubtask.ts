import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskService } from '../services';
import { notifyUser } from '@/utils/notificationUtils';

export const useUpdateSubtask = (boardId: string, columnId: string, taskId: string) => {
  const queryClient = useQueryClient();

  const updateSubtaskMutation = useMutation({
    mutationFn: ({
      subtaskId,
      title,
      description = '',
      completed,
    }: {
      subtaskId: string;
      title: string;
      description?: string;
      completed: boolean;
    }) =>
      subtaskService.updateSubtask(boardId, columnId, taskId, subtaskId, {
        title,
        description,
        completed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Subtask updated', 'Subtask has been successfully updated');
    },
    onError: (error) => notifyUser.error('Subtask update failed', error.message),
  });

  return {
    updateSubtask: updateSubtaskMutation.mutate,
    isUpdatingSubtask: updateSubtaskMutation.isPending,
  };
};
