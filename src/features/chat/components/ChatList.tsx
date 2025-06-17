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
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSocket } from '../context/SocketContext';
import { CreateChatModal } from './CreateChatModal';

interface ChatListProps {
  chats: Chat[];
  isLoading?: boolean;
}

export function ChatList({ chats, isLoading: propIsLoading }: ChatListProps) {
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';
  const { selectChat, activeChatId, isLoading: contextIsLoading, isConnected } = useSocket();

  // Use loading state from props or context
  const isLoading = propIsLoading !== undefined ? propIsLoading : contextIsLoading;

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
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

        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
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
                    variant={chat._id === activeChatId ? 'filled' : 'light'}
                    color={chat._id === activeChatId ? theme.colors['main-purple'][0] : undefined}
                    onClick={() => handleSelectChat(chat._id)}
                    className={`${activeChatId === chat._id ? 'selected-chat' : ''}`}
                    style={{
                      cursor: 'pointer',
                      borderColor:
                        activeChatId === chat._id
                          ? theme.colors['main-purple'][isDarkColorScheme ? 8 : 0]
                          : isDarkColorScheme
                            ? theme.colors['lines-dark'][0]
                            : theme.colors['lines-light'][0],
                      borderWidth: activeChatId === chat._id ? 2 : 1,
                    }}
                    justify="flex-start"
                    fullWidth
                  >
                    <Flex direction="column" align="flex-start" w="100%">
                      <Text lineClamp={1}>{chat.title}</Text>
                      <Text size="xs" c="dimmed">
                        {new Date(chat.updatedAt).toLocaleString()}
                      </Text>
                    </Flex>
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
