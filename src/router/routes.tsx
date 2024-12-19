import { createBrowserRouter } from 'react-router-dom';
import NavbarLayout from '../layouts/NavbarLayout';
import { Home, Login, NotFound, Signup } from '../pages';
import Welcome from '../pages/Welcome';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    path: '/signup',
    element: (
      <PublicRoute>
        <Signup />
      </PublicRoute>
    ),
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <NavbarLayout />
      </ProtectedRoute>
    ),
    errorElement: <NotFound />,
    children: [{ index: true, element: <Home /> }],
  },
]);

export default router;
