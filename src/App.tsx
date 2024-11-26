import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import NavbarLayout from './layouts/NavbarLayout';
import Home from './pages/Home';
import theme from './themes/mantine-theme';

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <NavbarLayout>
        <Home />
      </NavbarLayout>
    </MantineProvider>
  );
}
