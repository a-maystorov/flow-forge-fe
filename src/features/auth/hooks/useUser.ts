import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authService } from '../services/AuthService';
import type { User } from '../types';

export function useUser() {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: () => authService.getUser(),
    initialData: () => authService.getUser(),
    staleTime: 0,
  });

  useEffect(() => {
    if (authService.isTokenExpired() && user) {
      authService.logout();
      window.location.href = '/welcome';
      return;
    }

    const checkInterval = setInterval(() => {
      if (authService.isTokenExpired() && user) {
        authService.logout();
        window.location.href = '/welcome';
      }
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    refetch,
  };
}
