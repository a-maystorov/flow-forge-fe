import CheckIcon from '@/assets/icons/CheckIcon';
import CircleDotIcon from '@/assets/icons/CircleDotIcon';
import LayoutColumnsIcon from '@/assets/icons/LayoutColumnsIcon';
import { BoardContext } from '@/models/BoardContext';
import { Box, Button, Divider, Flex, Modal, ScrollArea, Text, Title } from '@mantine/core';

interface BoardContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardContext?: BoardContext;
}

export function BoardContextModal({ isOpen, onClose, boardContext }: BoardContextModalProps) {
  if (!boardContext) return null;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={
        <Title order={3} fw={600}>
          Board Suggestion
        </Title>
      }
      size="xl"
      padding="md"
    >
      <Box p="md">
        <Box mb="lg">
          <Flex align="center" gap="sm" mb="xs">
            <LayoutColumnsIcon w={20} h={20} />
            <Title order={4}>{boardContext.name}</Title>
          </Flex>
          <Text c="dimmed">{boardContext.description}</Text>
        </Box>

        <Divider mb="md" />

        <ScrollArea h={400} scrollbarSize={6} type="auto">
          {boardContext.columns.map((column) => (
            <Box key={column._id} mb="xl">
              <Flex align="center" mb="sm">
                <Box w={4} h={24} mr={10} />
                <Title order={5} fw={600}>
                  {column.name}
                </Title>
                {column.tasks.length > 0 && (
                  <Text size="xs" c="dimmed" ml={8}>
                    {column.tasks.length} tasks
                  </Text>
                )}
              </Flex>

              {column.tasks.length > 0 ? (
                column.tasks.map((task) => (
                  <Box key={task._id} p="md" mb="md">
                    <Title order={6} fw={600} mb="xs">
                      {task.title}
                    </Title>
                    <Text size="sm" mb="md" lineClamp={2}>
                      {task.description}
                    </Text>

                    {task.subtasks.length > 0 && (
                      <>
                        <Text size="xs" c="dimmed" mb="xs">
                          {task.subtasks.length} subtasks
                        </Text>
                        <Box ml="sm">
                          {task.subtasks.map((subtask) => (
                            <Flex key={subtask._id} gap="xs" align="center" mb="xs">
                              <CircleDotIcon w={12} h={12} />
                              <Text size="sm">{subtask.title}</Text>
                            </Flex>
                          ))}
                        </Box>
                      </>
                    )}
                  </Box>
                ))
              ) : (
                <Text c="dimmed" fs="italic" size="sm">
                  No tasks in this column
                </Text>
              )}
            </Box>
          ))}
        </ScrollArea>

        <Divider my="md" />

        <Flex justify="flex-end" gap="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button leftSection={<CheckIcon w={16} h={16} />} onClick={onClose}>
            Looks Good
          </Button>
        </Flex>
      </Box>
    </Modal>
  );
}
