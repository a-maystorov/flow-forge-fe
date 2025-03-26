import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskService } from '../services';

export const useCreateSubtask = (boardId: string, columnId: string, taskId: string) => {
  const queryClient = useQueryClient();

  const createSubtaskMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; completed?: boolean }) =>
      subtaskService.createSubtask(boardId, columnId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Subtask created', 'Subtask has been successfully created');
    },
    onError: (error) => notifyUser.error('Subtask creation failed', error.message),
  });

  return {
    createSubtask: createSubtaskMutation.mutate,
    isCreatingSubtask: createSubtaskMutation.isPending,
  };
};
