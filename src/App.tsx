import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import Home from './pages/Home';
import theme from './themes/mantine-theme';

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Home />
    </MantineProvider>
  );
}

export default App;
