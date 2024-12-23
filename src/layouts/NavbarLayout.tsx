import {
  AppShell,
  Box,
  Burger,
  Flex,
  rem,
  ScrollArea,
  Skeleton,
  Stack,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Outlet } from 'react-router-dom';
import KanbanLogo from '../assets/icons/KanbanLogo';
import AuthButtons from '../components/auth-buttons';
import ColorSchemeToggle from '../components/color-scheme-toggle';
import CreateBoardButton from '../components/create-board-button';
import HideSidebarButton from '../components/hide-sidebar-button';
import NavbarItem from '../components/navbar-item';
import ShowSidebarButton from '../components/show-sidebar-button';
import useBoards from '../hooks/useBoards';

export default function NavbarLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';

  const { data, isLoading } = useBoards();

  return (
    <AppShell
      layout={isMobile ? 'default' : 'alt'}
      header={{ height: 80 }}
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
        style={{
          borderColor: isDarkColorScheme
            ? theme.colors['lines-dark'][0]
            : theme.colors['lines-light'][0],
        }}
        px="2lg"
      >
        <Flex h="100%" justify="space-between" align="center">
          <Title visibleFrom="sm" lineClamp={1} data-board-title>
            Select a board
          </Title>

          <Flex hiddenFrom="sm" align="center" gap="md">
            <KanbanLogo w={24} h={24} />
            <Title lineClamp={1} data-board-title>
              Select a board
            </Title>
          </Flex>

          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label="Toggle navigation"
          />

          <Box visibleFrom="sm">
            <AuthButtons direction="row" size={isMobile ? 'xs' : 'sm'} gap={theme.spacing.md} />
          </Box>
        </Flex>
      </AppShell.Header>

      {/* Navigation Section */}
      <AppShell.Navbar
        bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
        style={{
          borderColor: isDarkColorScheme
            ? theme.colors['lines-dark'][0]
            : theme.colors['lines-light'][0],
        }}
      >
        <AppShell.Section p={{ base: '2lg', md: 'xl' }} mb="md" visibleFrom="sm">
          <Flex align="center" gap="md">
            <KanbanLogo w={24} h={24} />
            <Title>flowforge</Title>
          </Flex>
        </AppShell.Section>

        <AppShell.Section px={{ base: '2lg', md: 'xl' }} mb="lg" mt={{ base: 'lg', sm: 0 }}>
          <Title
            order={4}
            tt="uppercase"
            style={{ letterSpacing: rem(2.4) }}
            c={theme.colors['medium-gray'][0]}
          >
            All boards ({data?.length ?? 0})
          </Title>
        </AppShell.Section>

        <AppShell.Section
          grow
          component={ScrollArea}
          pr={{ base: 'lg', md: '2lg' }}
          offsetScrollbars
          scrollHideDelay={150}
          scrollbarSize={4}
          type={isMobile ? 'never' : 'hover'}
        >
          {isLoading ? (
            <Stack gap="sm" px={{ base: '2lg', md: 'xl' }}>
              <Skeleton height={48} radius="xl" />
              <Skeleton height={48} radius="xl" />
              <Skeleton height={48} radius="xl" />
            </Stack>
          ) : (
            <Stack gap={0}>
              {data?.map((board) => (
                <NavbarItem key={board._id} id={board._id} name={board.name} />
              ))}
              <CreateBoardButton />
            </Stack>
          )}
        </AppShell.Section>

        <AppShell.Section px={{ base: '2lg', md: 'xl' }} py="xl">
          <Stack>
            <Stack>
              <ColorSchemeToggle />
              <HideSidebarButton onClick={toggleDesktop} />
            </Stack>

            <Box hiddenFrom="sm">
              <AuthButtons direction="column" size="sm" gap={theme.spacing.md} />
            </Box>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      {/* Main Content Area */}
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      {/* Footer Section */}
      <AppShell.Footer withBorder={false} pl={0} pb="xl" visibleFrom="sm" hidden={desktopOpened}>
        <ShowSidebarButton onClick={toggleDesktop} />
      </AppShell.Footer>
    </AppShell>
  );
}
