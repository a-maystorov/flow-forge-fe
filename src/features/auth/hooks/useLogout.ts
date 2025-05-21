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

  // This is a special version of logout that confirms with the user first
  const logoutWithConfirm = () => {
    // Just use the browser's native confirm dialog
    if (
      window.confirm(
        'Are you sure you want to log out? As a temporary user, all your boards and data will be permanently deleted when your account expires.'
      )
    ) {
      logoutMutation.mutate();
    }
  };

  return {
    logout: logoutMutation.mutate,
    logoutWithConfirm,
    isLoading: logoutMutation.isPending,
    error: logoutMutation.error?.message,
  };
}
