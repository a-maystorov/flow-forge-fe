import { boardService } from '@/features/boards/services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials.email, credentials.password),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['user'] });

      const boards = await boardService.getBoards();
      if (boards.length > 0) {
        navigate(`/boards/${boards[0]._id}`);
      } else {
        navigate('/');
      }
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message,
  };
}
