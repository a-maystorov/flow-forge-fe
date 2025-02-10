import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/AuthService';

export function useGuestSession() {
  const navigate = useNavigate();

  const guestSessionMutation = useMutation({
    mutationFn: () => authService.createGuestSession(),
    onSuccess: () => {
      navigate('/');
    },
  });

  return {
    createGuestSession: guestSessionMutation.mutate,
    isLoading: guestSessionMutation.isPending,
    error: guestSessionMutation.error?.message,
  };
}
