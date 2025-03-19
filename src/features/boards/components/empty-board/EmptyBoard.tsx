import { CreateColumnButton, CreateColumnModal } from '@/features/columns/components';
import { Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { useCallback, useState } from 'react';

interface EmptyBoardProps {
  boardId: string;
}

export function EmptyBoard({ boardId }: EmptyBoardProps) {
  const theme = useMantineTheme();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);

  const handleOpenCreateColumnModal = useCallback(() => {
    setIsCreateColumnModalOpen(true);
  }, []);

  const handleCloseCreateColumnModal = useCallback(() => {
    setIsCreateColumnModalOpen(false);
  }, []);

  return (
    <Flex align="center" justify="center" h="100vh">
      <Stack align="center" gap="lg">
        <Text c={theme.colors['medium-gray'][0]} fz="h2" fw={600} ta="center">
          This board is empty. Create a new column to get started.
        </Text>

        <CreateColumnButton onClick={handleOpenCreateColumnModal} />

        <CreateColumnModal
          isOpen={isCreateColumnModalOpen}
          onClose={handleCloseCreateColumnModal}
          boardId={boardId}
        />
      </Stack>
    </Flex>
  );
}
