import { createBrowserRouter } from 'react-router-dom';
import NavbarLayout from './layouts/NavbarLayout';
import { Home, Login, NotFound, Signup } from './pages';

const router = createBrowserRouter([
  { path: '/signup', element: <Signup /> },
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <NavbarLayout />,
    errorElement: <NotFound />,
    children: [{ index: true, element: <Home /> }],
  },
]);

export default router;
