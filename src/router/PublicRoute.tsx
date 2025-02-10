import { useUser } from '@features/auth/hooks';
import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  const { isAuthenticated } = useUser();
  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
}
