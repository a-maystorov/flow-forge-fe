import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services';

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();

  const updateBoardMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return boardService.updateBoard(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifyUser.success('Board updated', 'Board has been successfully updated');
    },
    onError: (error) => notifyUser.error('Board update failed', error.message),
  });

  return {
    updateBoard: updateBoardMutation.mutate,
    isUpdatingBoard: updateBoardMutation.isPending,
  };
}
