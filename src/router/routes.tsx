import { createBrowserRouter } from 'react-router-dom';
import NavbarLayout from '../layouts/NavbarLayout';
import { Home, Login, NotFound, Signup, Welcome } from '../pages';
import Board from '../pages/Board';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <Welcome />,
  },
  {
    element: <PublicRoute />,
    errorElement: <NotFound />,
    children: [
      { path: 'signup', element: <Signup /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <NavbarLayout />,
        errorElement: <NotFound />,
        children: [
          { path: '/', element: <Home /> },
          { path: 'boards/:boardId', element: <Board /> },
        ],
      },
    ],
  },
]);

export default router;
