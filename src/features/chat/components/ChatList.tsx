import Chat from '@/models/Chat';
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSocket } from '../context/SocketContext';
import { CreateChatModal } from './CreateChatModal';

interface ChatListProps {
  chats: Chat[];
  isLoading?: boolean;
  onSelectChat?: (chatId: string) => void;
}

export function ChatList({ chats, isLoading: propIsLoading, onSelectChat }: ChatListProps) {
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const theme = useMantineTheme();
  const { selectChat, activeChatId, isLoading: contextIsLoading, isConnected } = useSocket();

  // Use loading state from props or context
  const isLoading = propIsLoading !== undefined ? propIsLoading : contextIsLoading;

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    if (onSelectChat) {
      onSelectChat(chatId);
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
            _
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
                  <Button
                    key={chat._id}
                    variant="outline"
                    color={chat._id === activeChatId ? theme.colors['main-purple'][0] : undefined}
                    onClick={() => handleSelectChat(chat._id)}
                    justify="flex-start"
                  >
                    <Stack gap={0} align="flex-start">
                      <Text lineClamp={1}>{chat.title}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(chat.updatedAt).toLocaleString()}
                      </Text>
                    </Stack>
                  </Button>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      <CreateChatModal opened={createModalOpened} onClose={closeCreateModal} />
    </>
  );
}
