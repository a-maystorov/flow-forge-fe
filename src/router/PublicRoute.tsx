import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks';

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
}
