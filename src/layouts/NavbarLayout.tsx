import { AppShell, Burger, Group, ScrollArea, Skeleton, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReactNode } from 'react';
import KanbanLogo from '../assets/icons/KanbanLogo';
import ColorSchemeToggle from '../components/color-scheme-toggle';
import HideSidebarButton from '../components/hide-sidebar-button';
import ShowSidebarButton from '../components/show-sidebar-button';

export default function NavbarLayout({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure();

  return (
    <AppShell
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
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <KanbanLogo w={24} h={24} />
        </Group>
      </AppShell.Header>

      {/* Navigation Section */}
      <AppShell.Navbar p="md">
        <AppShell.Section>Navbar header</AppShell.Section>

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
      <AppShell.Main>{children}</AppShell.Main>

      {/* Footer Section */}
      <AppShell.Footer withBorder={false} pl={0} pb="xl">
        <ShowSidebarButton onClick={toggleDesktop} />
      </AppShell.Footer>
    </AppShell>
  );
}
