import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/welcome" />;
}
