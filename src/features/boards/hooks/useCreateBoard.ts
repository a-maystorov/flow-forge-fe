import Board from '@/models/Board';
import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { boardService } from '../services';

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createBoardMutation = useMutation({
    mutationFn: async (name: string) => {
      return boardService.createBoard(name);
    },
    onSuccess: (newBoard) => {
      queryClient.setQueryData<Board[]>(['boards'], (old = []) => [...old, newBoard]);
      navigate(`/boards/${newBoard._id}`);
      notifyUser.success('Board created', 'Board has been successfully created');
    },
    onError: (error) => notifyUser.error('Board creation failed', error.message),
  });

  return {
    createBoard: createBoardMutation.mutate,
    isCreatingBoard: createBoardMutation.isPending,
  };
}
