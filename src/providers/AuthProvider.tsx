import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import GuestLogoutModal from '../components/modals/GuestLogoutModal';
import AuthContext from '../contexts/AuthContext';
import useAuthMutations from '../hooks/useAuthMutations';
import { User } from '../models/User';
import AuthService from '../services/AuthService';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [showLogoutModal, { open: openLogoutModal, close: closeLogoutModal }] =
    useDisclosure(false);

  const { data: user } = useQuery<User | null>({
    queryKey: ['authUser'],
    queryFn: async () => {
      const token = AuthService.getToken();
      if (token && !AuthService.isTokenExpired(token)) {
        AuthService.setJwt(token); // Ensure token is set in headers
        return AuthService.getUser();
      }
      return null;
    },
    initialData: AuthService.getUser(),
  });

  const { login: loginMutation, logout: logoutMutation } = useAuthMutations();

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const handleLogout = async () => {
    if (user?.isGuest) {
      openLogoutModal();
      return;
    }

    await logoutMutation.mutateAsync();
  };

  const performLogout = async () => {
    await logoutMutation.mutateAsync();
    closeLogoutModal();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: handleLogout, isAuthenticated: !!user }}>
      {children}
      <GuestLogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={performLogout}
        isLoading={logoutMutation.isPending}
      />
    </AuthContext.Provider>
  );
}
