import Board from '@/models/Board';
import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services';

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: string) => {
      return boardService.deleteBoard(boardId);
    },
    onMutate: async (boardId) => {
      await queryClient.cancelQueries({ queryKey: ['boards'] });
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });

      const previousBoards = queryClient.getQueryData<Board[]>(['boards']);

      if (previousBoards) {
        queryClient.setQueryData<Board[]>(['boards'], (old) =>
          old?.filter((board) => board._id !== boardId)
        );
      }

      queryClient.setQueryData(['board', boardId], null);

      return { previousBoards };
    },
    onError: (error, __, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }
      notifyUser.error('Board deletion failed', error.message);
    },
    onSuccess: () => {
      notifyUser.success('Board deleted', 'Board has been successfully deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  return {
    deleteBoard: deleteBoardMutation.mutate,
    isDeletingBoard: deleteBoardMutation.isPending,
  };
}
