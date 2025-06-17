import { ChevronLeftIcon } from '@/assets/icons/ChevronLeftIcon';
import { useSocket } from '@/features/chat/context';
import { useChat, useChatMessages, useChats } from '@/features/chat/hooks';
import {
  ActionIcon,
  AppShell,
  Box,
  Flex,
  Stack,
  Text,
  Transition,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { ChatMessages } from './ChatMessages';
import Message from '@/models/Message';

export function ChatPanel() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const [isMessageView, setIsMessageView] = useState(false);

  const { chats, isFetchingChats } = useChats();
  const { isConnected, selectChat, activeChatId, chatMessages: socketMessages } = useSocket();
  const { chat } = useChat(activeChatId || undefined);
  const { messages: persistentMessages, isFetchingMessages } = useChatMessages(
    activeChatId || undefined
  );

  const filteredMessages = useMemo(() => {
    if (!activeChatId) {
      return [];
    }

    // Create a Set to track processed content to avoid duplicates
    const processedContentSet = new Set();
    const resultMessages: Message[] = [];

    // Helper function to normalize message content for comparison
    const normalizeContent = (msg: Message) => {
      return (msg.content || msg.message || '').trim().toLowerCase();
    };

    // Combine all messages from both sources
    const allMessages = [
      ...persistentMessages,
      ...socketMessages.filter((msg) => msg.chatId === activeChatId),
    ];

    // Sort all messages by timestamp (oldest first) so we process in chronological order
    const sortedMessages = [...allMessages].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Process each message, skip if we've already seen identical content
    sortedMessages.forEach((msg) => {
      const normalizedContent = normalizeContent(msg);

      // Skip empty messages
      if (!normalizedContent) return;

      // Only add the message if we haven't seen this content before
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
    <Stack h="100%" gap={0}>
      <AppShell.Section>
        <Flex
          justify="space-between"
          align="center"
          p="md"
          style={{
            borderBottom: `1px solid ${
              isDarkColorScheme ? theme.colors['lines-dark'][0] : theme.colors['lines-light'][0]
            }`,
          }}
        >
          {isMessageView && activeChatId ? (
            <Flex align="center" gap="sm">
              <ActionIcon
                variant="subtle"
                size="md"
                onClick={handleBackClick}
                aria-label="Back to chats list"
              >
                <ChevronLeftIcon />
              </ActionIcon>
              <Text fw={700} size="lg">
                {chat?.title || 'Chat'}
              </Text>
            </Flex>
          ) : (
            <Text fw={700} size="lg">
              Chats
            </Text>
          )}
        </Flex>
      </AppShell.Section>

      <Box style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: 0 }}>
        {!isConnected ? (
          <Flex justify="center" align="center" h="100%">
            <Text fw={600} c="dimmed">
              Connecting to chat server...
            </Text>
          </Flex>
        ) : (
          <Box style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Transition
              mounted={!isMessageView}
              transition="fade"
              duration={200}
              timingFunction="ease"
            >
              {(styles) => (
                <Box
                  style={{
                    ...styles,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    zIndex: isMessageView ? 1 : 2,
                  }}
                >
                  <ChatList
                    chats={chats || []}
                    isLoading={isFetchingChats}
                    onSelectChat={handleChatSelect}
                  />
                </Box>
              )}
            </Transition>

            <Transition
              mounted={isMessageView}
              transition="fade"
              duration={200}
              timingFunction="ease"
            >
              {(styles) => (
                <Box
                  style={{
                    ...styles,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    zIndex: isMessageView ? 2 : 1,
                  }}
                >
                  <ChatMessages
                    chat={chat}
                    messages={filteredMessages}
                    isLoading={isFetchingMessages}
                  />
                </Box>
              )}
            </Transition>
          </Box>
        )}
      </Box>

      <ChatInput disabled={!activeChatId || !isConnected || !isMessageView} />
    </Stack>
  );
}
