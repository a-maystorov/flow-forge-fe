import { Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddColumnButton from '../components/add-column-button';
import useBoard from '../hooks/useBoard';
import useBoards from '../hooks/useBoards';
import { Home } from '../pages';

export default function Board() {
  const { boardId } = useParams();
  const theme = useMantineTheme();
  const { data: boards = [] } = useBoards();
  const { data: board, isLoading: isLoadingBoard } = useBoard(boardId ?? '');

  useEffect(() => {
    const title = board?.name ?? (boards.length ? 'Select a board' : 'No boards');
    document.title = `${title} | FlowForge`;

    const titleElements = document.querySelectorAll('[data-board-title]');
    titleElements.forEach((element) => {
      element.textContent = title;
    });
  }, [board?.name, boards.length]);

  if (boards.length === 0) {
    return <Home />;
  }

  if (isLoadingBoard) {
    return null; // TODO: Add loading state
  }

  if (!board?.columns?.length) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Stack align="center" gap="lg">
          <Text c={theme.colors['medium-gray'][0]} fz="h2" fw={600} ta="center">
            This board is empty. Create a new column to get started.
          </Text>
          <AddColumnButton />
        </Stack>
      </Flex>
    );
  }

  return (
    <div>
      {/* TODO: Add columns layout */}
      Board content goes here
    </div>
  );
}
