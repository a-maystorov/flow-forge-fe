import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';

export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();

  const updateColumnMutation = useMutation({
    mutationFn: ({ columnId, name }: { columnId: string; name: string }) =>
      columnService.updateColumn(boardId, columnId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Column updated', 'Column has been successfully updated');
    },
    onError: (error) => notifyUser.error('Column update failed', error.message),
  });

  return {
    updateColumn: updateColumnMutation.mutate,
    isUpdatingColumn: updateColumnMutation.isPending,
  };
}
