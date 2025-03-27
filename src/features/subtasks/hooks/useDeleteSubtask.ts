import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskService } from '../services';

export const useDeleteSubtask = (boardId: string, columnId: string, taskId: string) => {
  const queryClient = useQueryClient();

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId: string) =>
      subtaskService.deleteSubtask(boardId, columnId, taskId, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Subtask deleted', 'Subtask has been successfully deleted');
    },
    onError: (error) => notifyUser.error('Subtask deletion failed', error.message),
  });

  return {
    deleteSubtask: deleteSubtaskMutation.mutate,
    isDeletingSubtask: deleteSubtaskMutation.isPending,
  };
};
