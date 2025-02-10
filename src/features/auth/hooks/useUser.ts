import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/AuthService';
import type { User } from '../types';

export function useUser() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: () => authService.getUser(),
    initialData: () => authService.getUser(),
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
