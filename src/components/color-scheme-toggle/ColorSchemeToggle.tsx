import { Group, Switch, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import MoonIcon from '../../assets/icons/MoonIcon';
import SunIcon from '../../assets/icons/SunIcon';

export default function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });

  const isDarkColorScheme = colorScheme === 'dark';
  const theme = useMantineTheme();

  const toggleColorScheme = () => {
    setColorScheme(isDarkColorScheme ? 'light' : 'dark');
  };

  return (
    <Group
      justify="center"
      gap="lg"
      bg={isDarkColorScheme ? theme.colors['very-dark-gray'][0] : theme.colors['light-gray'][0]}
      h={48}
      style={{ borderRadius: theme.radius.md }}
    >
      <SunIcon w={20} h={20} />
      <Switch
        onClick={toggleColorScheme}
        checked={isDarkColorScheme}
        aria-label="Toggle color scheme"
      />
      <MoonIcon w={20} h={20} />
    </Group>
  );
}
