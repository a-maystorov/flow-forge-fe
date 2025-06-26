import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';

export function useTempSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const tempSessionMutation = useMutation({
    mutationFn: () => authService.createTempSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      navigate('/');
    },
    onError: (error) => {
      console.error('Failed to create temporary session:', error);
    },
  });

  const handleCreateTempSession = () => {
    if (!tempSessionMutation.isPending) {
      tempSessionMutation.mutate();
    }
  };

  return {
    createTempSession: handleCreateTempSession,
    isLoading: tempSessionMutation.isPending,
    error: tempSessionMutation.error?.message,
  };
}
