import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Board, BoardInput } from '../types';
import { boardService } from '../services';

export function useBoardMutations() {
  const queryClient = useQueryClient();

  const createBoard = useMutation({
    mutationFn: async (data: BoardInput) => {
      return boardService.createBoard(data);
    },
    onSuccess: (newBoard) => {
      queryClient.setQueryData<Board[]>(['boards'], (old = []) => [...old, newBoard]);
    },
  });

  const updateBoard = useMutation({
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

  const deleteBoard = useMutation({
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  return {
    createBoard,
    updateBoard,
    deleteBoard,
  };
}
