import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import BoardService from '@/services/BoardService';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials.email, credentials.password),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['user'] });

      const boards = await BoardService.getBoards();
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
