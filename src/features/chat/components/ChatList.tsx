import Chat from '@/models/Chat';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSocket } from '../context/SocketContext';
import { CreateChatModal } from './CreateChatModal';
import { useState } from 'react';
import { TrashIcon } from '@/assets/icons/TrashIcon';

interface ChatListProps {
  chats: Chat[];
  isLoading?: boolean;
  onSelectChat?: (chatId: string) => void;
}

export function ChatList({ chats, isLoading: propIsLoading, onSelectChat }: ChatListProps) {
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const theme = useMantineTheme();
  const {
    selectChat,
    deleteChat,
    activeChatId,
    isLoading: contextIsLoading,
    isConnected,
  } = useSocket();

  const isLoading = propIsLoading !== undefined ? propIsLoading : contextIsLoading;

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    openDeleteModal();
  };

  const confirmDelete = async () => {
    if (chatToDelete) {
      await deleteChat(chatToDelete);
      closeDeleteModal();
      setChatToDelete(null);
    }
  };

  return (
    <>
      <Stack h="100%" p="md" gap="md">
        <Group justify="space-between" align="center">
          <Text fw={700} size="lg">
            Chats
          </Text>
          <ActionIcon
            variant="light"
            color={theme.colors['main-purple'][0]}
            onClick={openCreateModal}
            aria-label="Create new chat"
            disabled={!isConnected}
          >
            +
          </ActionIcon>
        </Group>

        <Box>
          {isLoading ? (
            <Flex align="center" justify="center" h={100}>
              <Loader size="sm" />
            </Flex>
          ) : !isConnected ? (
            <Text ta="center" pt="xl" c="dimmed" fs="italic">
              Connecting to chat server...
            </Text>
          ) : (
            <Stack gap="xs">
              {chats?.length === 0 ? (
                <Text ta="center" pt="xl" c="dimmed" fs="italic">
                  No chats yet
                </Text>
              ) : (
                chats?.map((chat) => (
                  <Group key={chat._id} w="100%" wrap="nowrap" gap={0}>
                    <Button
                      variant="outline"
                      color={chat._id === activeChatId ? theme.colors['main-purple'][0] : undefined}
                      onClick={() => handleSelectChat(chat._id)}
                      justify="flex-start"
                      w="100%"
                      style={{ position: 'relative' }}
                    >
                      <Stack gap={0} align="flex-start">
                        <Text lineClamp={1}>{chat.title}</Text>
                        <Text size="xs" c="dimmed">
                          {new Date(chat.updatedAt).toLocaleString()}
                        </Text>
                      </Stack>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        size="sm"
                        onClick={(e) => handleDeleteClick(e, chat._id)}
                        style={{ position: 'absolute', right: 8 }}
                        aria-label="Delete chat"
                      >
                        <TrashIcon w={16} h={16} />
                      </ActionIcon>
                    </Button>
                  </Group>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      <CreateChatModal opened={createModalOpened} onClose={closeCreateModal} />

      <Modal opened={deleteModalOpened} onClose={closeDeleteModal} title="Delete Chat" centered>
        <Stack>
          <Text>Are you sure you want to delete this chat? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
