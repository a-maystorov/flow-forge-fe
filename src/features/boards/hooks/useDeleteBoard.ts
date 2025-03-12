import Board from '@/models/Board';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services';
import { notifications } from '@mantine/notifications';

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
    onError: (_, __, context) => {
      if (context?.previousBoards) {
        queryClient.setQueryData(['boards'], context.previousBoards);
      }

      notifications.show({
        title: 'Board deletion failed',
        message: 'An error occurred while deleting the board',
        color: 'red',
      });
    },
    onSuccess: () => {
      notifications.show({
        title: 'Board deleted',
        message: 'Board has been successfully deleted',
        color: 'green',
      });
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
