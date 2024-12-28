import { Card, Flex, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddColumnButton from '../components/add-column-button';
import AddTaskButton from '../components/add-task-button';
import AddTaskModal from '../components/modals/AddTaskModal';
import CreateColumnModal from '../components/modals/CreateColumnModal';
import NewColumnButton from '../components/new-column-button';
import useBoard from '../hooks/useBoard';
import useBoards from '../hooks/useBoards';
import { Home } from '../pages';
import { DndListHandle } from '../components/dnd-list-handle/DndListHandle';

export default function Board() {
  const { boardId } = useParams();
  const theme = useMantineTheme();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
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
          <AddColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />
          <CreateColumnModal
            isOpen={isCreateColumnModalOpen}
            onClose={() => setIsCreateColumnModalOpen(false)}
            boardId={boardId ?? ''}
          />
        </Stack>
      </Flex>
    );
  }

  return (
    <>
      <Group align="flex-start" h="100%" p="md">
        {board.columns.map((column) => (
          <Stack
            key={column.name}
            bg={theme.colors.dark[6]}
            w={300}
            mih={200}
            p="md"
            style={{ borderRadius: theme.radius.md }}
          >
            <Text fw={600} size="lg">
              {column.name}
            </Text>
            <AddTaskButton onClick={() => setSelectedColumnId(column._id)} />
            <Stack gap="xs">
              {column.tasks?.map((task) => (
                <Card key={task._id} withBorder padding="sm" bg={theme.colors.dark[5]}>
                  <Text size="sm" fw={500}>
                    {task.title}
                  </Text>
                  {task.description && (
                    <Text size="xs" c="dimmed" mt={4}>
                      {task.description}
                    </Text>
                  )}
                </Card>
              ))}
              <DndListHandle />
            </Stack>
          </Stack>
        ))}
        <NewColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />
      </Group>
      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
        boardId={boardId ?? ''}
      />
      <AddTaskModal
        isOpen={selectedColumnId !== null}
        onClose={() => setSelectedColumnId(null)}
        columnId={selectedColumnId ?? ''}
        boardId={boardId ?? ''}
      />
    </>
  );
}
