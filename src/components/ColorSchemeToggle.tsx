import { Button, useMantineColorScheme } from '@mantine/core';

export default function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme({ keepTransitions: true });

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return <Button onClick={toggleColorScheme}>Toggle {colorScheme === 'dark' ? 'Light' : 'Dark'} Mode</Button>;
}
