import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subtaskService } from '../services';

export function useCreateBatchSubtasks() {
  const queryClient = useQueryClient();

  const createBatchSubtasksMutation = useMutation({
    mutationFn: ({
      boardId,
      columnId,
      taskId,
      subtaskTitles,
    }: {
      boardId: string;
      columnId: string;
      taskId: string;
      subtaskTitles: string[];
    }) => subtaskService.createBatchSubtasks(boardId, columnId, taskId, subtaskTitles),
    onSuccess: (_, { boardId }) => queryClient.invalidateQueries({ queryKey: ['board', boardId] }),
    onError: (error) => notifyUser.error('Subtask creation failed', error.message),
  });

  return {
    createBatchSubtasks: createBatchSubtasksMutation.mutate,
    isCreatingBatchSubtasks: createBatchSubtasksMutation.isPending,
  };
}
