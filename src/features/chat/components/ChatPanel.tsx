import ChatOffIcon from '@/assets/icons/ChatOffIcon';
import { ChevronLeftIcon } from '@/assets/icons/ChevronLeftIcon';
import { useSocket } from '@/features/chat/context';
import { useChat, useChatMessages, useChats } from '@/features/chat/hooks';
import Message from '@/models/Message';
import {
  ActionIcon,
  AppShell,
  Box,
  Flex,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { ChatMessages } from './ChatMessages';
import { CreateChatModal } from './CreateChatModal';

interface ChatPanelProps {
  onClose?: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);

  const [isMessageView, setIsMessageView] = useState(false);

  const { chats, isFetchingChats } = useChats();
  const { isConnected, selectChat, activeChatId, chatMessages: socketMessages } = useSocket();
  const { chat } = useChat(activeChatId || undefined);
  const { messages: persistentMessages, isFetchingMessages } = useChatMessages(
    activeChatId || undefined
  );

  /**
   * Deduplicates and merges messages from two sources (persistent DB and real-time socket)
   *
   * This logic handles the challenge of maintaining a consistent message timeline by:
   * 1. Combining messages from persistent storage (DB) and real-time socket updates
   * 2. Sorting all messages chronologically to preserve conversation flow
   * 3. Removing duplicates based on normalized message content
   * 4. Ensuring messages appear exactly once in the UI, regardless of source
   *
   * This approach provides a seamless UX where users see consistent messages
   * whether they're coming from DB history or live socket events.
   */
  const filteredMessages = useMemo(() => {
    if (!activeChatId) {
      return [];
    }

    const processedContentSet = new Set();
    const resultMessages: Message[] = [];

    const normalizeContent = (msg: Message) => {
      return (msg.content || msg.message || '').trim().toLowerCase();
    };

    const allMessages = [
      ...persistentMessages,
      ...socketMessages.filter((msg) => msg.chatId === activeChatId),
    ];

    const sortedMessages = [...allMessages].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    sortedMessages.forEach((msg) => {
      const normalizedContent = normalizeContent(msg);

      if (!normalizedContent) {
        return;
      }

      if (!processedContentSet.has(normalizedContent)) {
        processedContentSet.add(normalizedContent);
        resultMessages.push(msg);
      }
    });

    return resultMessages;
  }, [socketMessages, persistentMessages, activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      setIsMessageView(true);
    }
  }, [activeChatId]);

  const handleBackClick = useCallback(() => {
    setIsMessageView(false);
  }, []);

  const handleChatSelect = useCallback(
    (chatId: string) => {
      selectChat(chatId);
      setIsMessageView(true);
    },
    [selectChat]
  );

  return (
    <>
      <Stack h="100%" gap={0}>
        <AppShell.Section>
          <Flex
            justify="space-between"
            align="center"
            p="lg"
            style={{
              borderBottom: `1px solid ${
                isDarkColorScheme ? theme.colors['lines-dark'][0] : theme.colors['lines-light'][0]
              }`,
            }}
          >
            {isMessageView && activeChatId ? (
              <Flex align="center" gap="sm" justify="space-between" w="100%">
                <Flex align="center" gap="sm">
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    onClick={handleBackClick}
                    aria-label="Back to chats list"
                  >
                    <ChevronLeftIcon />
                  </ActionIcon>

                  <Text fw={700} size="lg" truncate>
                    {chat?.title || 'Chat'}
                  </Text>
                </Flex>

                {onClose && (
                  <ActionIcon
                    variant="subtle"
                    size="md"
                    onClick={onClose}
                    aria-label="Close chat panel"
                  >
                    <ChatOffIcon w={20} h={20} />
                  </ActionIcon>
                )}
              </Flex>
            ) : (
              <Flex justify="space-between" align="center" w="100%">
                <Text fw={700} size="lg">
                  All Chats
                </Text>

                <Flex gap="sm">
                  {onClose && (
                    <ActionIcon
                      variant="subtle"
                      size="md"
                      onClick={onClose}
                      aria-label="Close chat panel"
                    >
                      <ChatOffIcon w={20} h={20} />
                    </ActionIcon>
                  )}

                  <ActionIcon
                    variant="light"
                    color={theme.colors['main-purple'][0]}
                    radius="xl"
                    onClick={openCreateModal}
                    aria-label="Create new chat"
                    disabled={!isConnected}
                  >
                    +
                  </ActionIcon>
                </Flex>
              </Flex>
            )}
          </Flex>
        </AppShell.Section>

        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            height: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {!isConnected ? (
            <Flex justify="center" align="center" h="100%">
              <Text fw={600} c="dimmed">
                Connecting to chat server...
              </Text>
            </Flex>
          ) : (
            <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* Chat list view */}
              <Box display={isMessageView ? 'none' : 'block'}>
                <ChatList
                  chats={chats || []}
                  isLoading={isFetchingChats}
                  onSelectChat={handleChatSelect}
                />
              </Box>

              {/* Message view */}
              <Box
                display={isMessageView ? 'block' : 'none'}
                style={{
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  overflow: 'hidden',
                  isolation: 'isolate' /* Create a new stacking context */,
                  zIndex: 1,
                }}
              >
                <ChatMessages messages={filteredMessages} isLoading={isFetchingMessages} />
              </Box>
            </Box>
          )}
        </Box>

        <ChatInput disabled={!activeChatId || !isConnected || !isMessageView} />
      </Stack>

      <CreateChatModal opened={createModalOpened} onClose={closeCreateModal} />
    </>
  );
}
