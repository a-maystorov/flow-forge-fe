import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import AuthContext from '../contexts/AuthContext';
import User from '../models/User';
import AuthService from '../services/AuthService';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, refetch } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      const token = AuthService.getToken();
      if (token && !AuthService.isTokenExpired(token)) {
        return AuthService.getUser();
      }
      return null;
    },
    initialData: null,
    staleTime: Infinity,
  });

  const login = async (email: string, password: string) => {
    await AuthService.login(email, password);
    refetch();
  };

  const logout = () => {
    AuthService.logout();
    refetch();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
