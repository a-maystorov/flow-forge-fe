import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { boardService } from '../services';
import type { Board, BoardInput } from '../types';

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createBoardMutation = useMutation({
    mutationFn: async (data: BoardInput) => {
      return boardService.createBoard(data);
    },
    onSuccess: (newBoard) => {
      queryClient.setQueryData<Board[]>(['boards'], (old = []) => [...old, newBoard]);
      navigate(`/boards/${newBoard._id}`);
    },
  });

  return {
    createBoard: createBoardMutation.mutate,
    isLoading: createBoardMutation.isPending,
    error: createBoardMutation.error?.message,
  };
}
