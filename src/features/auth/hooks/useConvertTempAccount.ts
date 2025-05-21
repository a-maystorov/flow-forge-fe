import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import type { SignupCredentials } from '../types';

export function useConvertTempAccount() {
  const queryClient = useQueryClient();

  const convertAccountMutation = useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      await authService.convertTempAccount(
        credentials.username,
        credentials.email,
        credentials.password
      );

      return { username: credentials.username, email: credentials.email };
    },
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      window.location.reload();
    },
  });

  return {
    convertAccount: convertAccountMutation.mutate,
    isLoading: convertAccountMutation.isPending,
    error: convertAccountMutation.error?.message,
  };
}
