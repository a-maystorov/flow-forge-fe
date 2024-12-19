import { useMutation, useQueryClient } from '@tanstack/react-query';
import AuthService from '../services/AuthService';

function useAuthMutations() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const token = await AuthService.login(email, password);
      AuthService.setJwt(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'], exact: true });
    },
  });

  const createGuestSession = useMutation({
    mutationFn: async () => {
      const token = await AuthService.createGuestSession();
      AuthService.setJwt(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authUser'], exact: true });
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
