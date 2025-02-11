import SplitBoardIcon from '@/assets/icons/SplitBoardIcon';
import { useUser } from '@/features/auth/hooks';
import { Box, Group, NavLink, Text, Title, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useBoards } from '../../hooks';
import { CreateBoardModal } from '../create-board-modal';
import styles from './CreateBoardButton.module.css';

export function CreateBoardButton() {
  const [opened, { open, close }] = useDisclosure(false);
  const { user } = useUser();
  const { boards } = useBoards();

  const isGuestWithMaxBoards = user?.isGuest && (boards?.length ?? 0) >= 1;

  const button = (
    <Box style={{ cursor: isGuestWithMaxBoards ? 'not-allowed' : 'pointer' }}>
      <NavLink
        href="#"
        label={
          <Group gap={4} align="center">
            <Text component="span" size="md" style={{ top: 1 }}>
              +
            </Text>
            <Title order={3}>Create New Board</Title>
          </Group>
        }
        leftSection={<SplitBoardIcon h={16} w={16} />}
        onClick={isGuestWithMaxBoards ? undefined : open}
        classNames={styles}
        py="md"
        px={{ base: '2lg', md: 'xl' }}
        disabled={isGuestWithMaxBoards}
      />
    </Box>
  );

  return (
    <>
      {isGuestWithMaxBoards ? (
        <Tooltip
          label="Guest users are limited to 1 board"
          position="right"
          withArrow
          offset={-32}
          arrowOffset={16}
        >
          {button}
        </Tooltip>
      ) : (
        button
      )}
      <CreateBoardModal isOpen={opened} onClose={close} />
    </>
  );
}
