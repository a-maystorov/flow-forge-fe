import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthService from '../services/AuthService';

function useAuthMutations() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      AuthService.login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'], exact: true });
    },
  });

  const createGuestSession = useMutation({
    mutationFn: () => AuthService.createGuestSession(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['authUser'], exact: true });
      await queryClient.refetchQueries({ queryKey: ['authUser'], exact: true });
    },
  });

  const logout = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/welcome';
    },
    onError: (error) => {
      console.error('Error during logout:', error);
      window.location.href = '/welcome';
    },
  });

  return {
    login,
    logout,
    createGuestSession,
  };
}

export default useAuthMutations;
