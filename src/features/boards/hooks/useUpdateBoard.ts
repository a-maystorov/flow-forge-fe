import Board from '@/models/Board';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services';

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  const updateBoardMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      return boardService.updateBoard(id, name);
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
    isUpdatingBoard: updateBoardMutation.isPending,
  };
}
