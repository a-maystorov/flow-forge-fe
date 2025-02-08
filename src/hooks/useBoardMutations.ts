import { useMutation, useQueryClient } from '@tanstack/react-query';
import type Board from '../models/Board';
import BoardService from '../services/BoardService';

export function useBoardMutations() {
  const queryClient = useQueryClient();

  const deleteBoard = useMutation({
    mutationFn: async (boardId: string) => {
      const result = await BoardService.deleteBoard(boardId);
      return result;
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  return {
    deleteBoard,
  };
}
