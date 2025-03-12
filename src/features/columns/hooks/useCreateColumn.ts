import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => columnService.createColumn(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Column created', 'Column has been successfully created');
    },
    onError: (error) => notifyUser.error('Column creation failed', error.message),
  });

  return {
    createColumn: createColumnMutation.mutate,
    isCreatingColumn: createColumnMutation.isPending,
  };
}
