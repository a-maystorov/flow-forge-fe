import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import type { LoginCredentials, SignupCredentials, User } from '../types';
import BoardService from '@/services/BoardService';

// TODO: Simplify
export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: () => authService.getUser(),
  });

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

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authService.signup(credentials.username, credentials.email, credentials.password),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  const guestSessionMutation = useMutation({
    mutationFn: () => authService.createGuestSession(),
    onSuccess: () => {
      navigate('/');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries();
      navigate('/');
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    createGuestSession: guestSessionMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading:
      loginMutation.isPending ||
      signupMutation.isPending ||
      guestSessionMutation.isPending ||
      logoutMutation.isPending,
    error:
      loginMutation.error?.message ||
      signupMutation.error?.message ||
      guestSessionMutation.error?.message ||
      logoutMutation.error?.message,
  };
}
