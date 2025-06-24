import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import { SocketProvider } from './features/chat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import routes from './router/routes';
import './styles/global.css';
import theme from './themes/mantine-theme';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications />
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <RouterProvider router={routes} />
        </SocketProvider>
        {/* <ReactQueryDevtools initialIsOpen={false}/> */}
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>
);
