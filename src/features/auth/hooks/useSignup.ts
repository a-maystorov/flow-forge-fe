import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';
import type { SignupCredentials } from '../types';

export function useSignup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: (credentials: SignupCredentials) =>
      authService.signup(credentials.username, credentials.email, credentials.password),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['user'] });
      navigate('/');
    },
  });

  return {
    signup: signupMutation.mutate,
    isLoading: signupMutation.isPending,
    error: signupMutation.error?.message,
  };
}
