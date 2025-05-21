import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';

export function useTempSession() {
  const navigate = useNavigate();

  const tempSessionMutation = useMutation({
    mutationFn: () => authService.createTempSession(),
    onSuccess: () => {
      navigate('/');
    },
  });

  return {
    createTempSession: tempSessionMutation.mutate,
    isLoading: tempSessionMutation.isPending,
    error: tempSessionMutation.error?.message,
  };
}
