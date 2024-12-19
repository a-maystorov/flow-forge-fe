import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/AuthService';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const user = authService.getUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
