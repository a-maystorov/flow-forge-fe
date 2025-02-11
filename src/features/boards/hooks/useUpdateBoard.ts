import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services';
import type { Board, BoardInput } from '../types';

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  const updateBoardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BoardInput }) => {
      return boardService.updateBoard(id, data);
    },
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData<Board[]>(['boards'], (old = []) =>
        old.map((board) => (board._id === updatedBoard._id ? updatedBoard : board))
      );
      queryClient.setQueryData<Board>(['board', updatedBoard._id], updatedBoard);
    },
  });

  return {
    updateBoard: updateBoardMutation.mutate,
    isLoading: updateBoardMutation.isPending,
    error: updateBoardMutation.error?.message,
  };
}
