import CheckIcon from '@/assets/icons/CheckIcon';
import CircleDotIcon from '@/assets/icons/CircleDotIcon';
import LayoutColumnsIcon from '@/assets/icons/LayoutColumnsIcon';
import { BoardContext } from '@/models/BoardContext';
import { notifyUser } from '@/utils/notificationUtils';
import { Box, Button, Divider, Flex, Modal, ScrollArea, Text, Title } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useBoardContextOperations } from '../hooks';
import { chatService } from '../services/ChatService';

interface BoardContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardContext?: BoardContext;
  chat: { _id: string; boardId?: string };
}

export function BoardContextModal({ isOpen, onClose, boardContext, chat }: BoardContextModalProps) {
  const { handleBoardContext, isLoading } = useBoardContextOperations();
  const [isAccepting, setIsAccepting] = useState(false);
  const queryClient = useQueryClient();

  if (!boardContext) {
    return null;
  }

  const handleAccept = async () => {
    if (!boardContext) return;

    setIsAccepting(true);
    try {
      const freshChat = await chatService.getChat(chat._id);

      if (freshChat) {
        handleBoardContext(freshChat, boardContext);
        queryClient.invalidateQueries({ queryKey: ['chats', chat._id] });
        onClose();
      }
    } catch (error) {
      console.error('[ERROR] BoardContextModal - Error accepting board context:', error);
      notifyUser.error('Error', 'Failed to accept board');
    } finally {
      setIsAccepting(false);
    }
  };

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
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            leftSection={<CheckIcon w={16} h={16} />}
            onClick={handleAccept}
            loading={isLoading || isAccepting}
          >
            Accept
          </Button>
        </Flex>
      </Box>
    </Modal>
  );
}
