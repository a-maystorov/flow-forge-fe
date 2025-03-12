import Board from '@/models/Board';
import { notifications } from '@mantine/notifications';
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
      notifications.show({
        title: 'Board created',
        message: 'Board has been successfully created',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Board creation failed',
        message: error.message,
        color: 'red',
      });
    },
  });

  return {
    createBoard: createBoardMutation.mutate,
    isCreatingBoard: createBoardMutation.isPending,
  };
}
