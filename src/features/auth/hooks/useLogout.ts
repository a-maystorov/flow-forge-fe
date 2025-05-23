import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/AuthService';

export function useLogout() {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.removeQueries();
      queryClient.setQueryData(['user'], null);

      window.location.href = '/welcome';
    },
  });

  return {
    logout: logoutMutation.mutate,
    isLoading: logoutMutation.isPending,
    error: logoutMutation.error?.message,
  };
}
