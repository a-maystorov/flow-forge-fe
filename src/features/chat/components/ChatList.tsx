import { TrashIcon } from '@/assets/icons/TrashIcon';
import Chat from '@/models/Chat';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';

interface ChatListProps {
  chats: Chat[];
  isLoading?: boolean;
  onSelectChat?: (chatId: string) => void;
}

export function ChatList({ chats, isLoading: propIsLoading, onSelectChat }: ChatListProps) {
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const { selectChat, deleteChat, isLoading: contextIsLoading, isConnected } = useSocket();

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
            <Stack gap="md">
              {chats?.length === 0 ? (
                <Text ta="center" pt="xl" c="dimmed" fs="italic">
                  No chats yet
                </Text>
              ) : (
                chats?.map((chat) => (
                  <React.Fragment key={chat._id}>
                    <Paper
                      p="sm"
                      withBorder
                      shadow="xs"
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => handleSelectChat(chat._id)}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text truncate style={{ flex: 1 }}>
                          {chat.title}
                        </Text>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(e, chat._id);
                          }}
                          aria-label="Delete chat"
                        >
                          <TrashIcon w={16} h={16} />
                        </ActionIcon>
                      </Group>
                    </Paper>
                  </React.Fragment>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Stack>

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
