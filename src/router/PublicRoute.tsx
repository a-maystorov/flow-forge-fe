import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/AuthService';

interface Props {
  children: ReactNode;
}

export default function PublicRoute({ children }: Props) {
  const user = authService.getUser();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
