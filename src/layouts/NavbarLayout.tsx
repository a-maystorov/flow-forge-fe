import {
  AppShell,
  Burger,
  Flex,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ReactNode } from 'react';
import KanbanLogo from '../assets/icons/KanbanLogo';
import ColorSchemeToggle from '../components/color-scheme-toggle';
import HideSidebarButton from '../components/hide-sidebar-button';
import ShowSidebarButton from '../components/show-sidebar-button';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';

  return (
    <AppShell
      layout={isMobile ? 'default' : 'alt'}
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
      transitionDuration={500}
      transitionTimingFunction="ease"
    >
      {/* Header Section */}
      <AppShell.Header
        bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
      >
        <Group h="100%" px="md" justify="space-between">
          <Title visibleFrom="sm">Board Name Goes Here</Title>

          <Flex hiddenFrom="sm" align="center" gap="md">
            <KanbanLogo w={24} h={24} />
            <Title>Board Name Goes Here</Title>
          </Flex>

          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />
        </Group>
      </AppShell.Header>

      {/* Navigation Section */}
      <AppShell.Navbar
        p="md"
        bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
      >
        <AppShell.Section>
          <Flex align="center" gap="md" visibleFrom="sm">
            <KanbanLogo w={24} h={24} />
            <Title>flowforge</Title>
          </Flex>
        </AppShell.Section>

        <AppShell.Section grow my="md" component={ScrollArea}>
          {Array(60)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} h={28} mt="sm" animate={false} />
            ))}
        </AppShell.Section>

        <AppShell.Section>
          <Stack>
            <ColorSchemeToggle />
            <HideSidebarButton onClick={toggleDesktop} />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content Area */}
      <AppShell.Main
        bg={isDarkColorScheme ? theme.colors['very-dark-gray'][0] : theme.colors['light-gray'][0]}
      >
        {children}
      </AppShell.Main>

      {/* Footer Section */}
      <AppShell.Footer
        withBorder={false}
        pl={0}
        pb="xl"
        visibleFrom="sm"
        hidden={desktopOpened}
        bg={isDarkColorScheme ? theme.colors['very-dark-gray'][0] : theme.colors['light-gray'][0]}
      >
        <ShowSidebarButton onClick={toggleDesktop} />
      </AppShell.Footer>
    </AppShell>
  );
}
