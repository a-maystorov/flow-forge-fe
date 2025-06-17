import { useSocket } from '@/features/chat/context';
import { useChat, useChats } from '@/features/chat/hooks';
import {
  AppShell,
  Box,
  Flex,
  Stack,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useMemo } from 'react';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { ChatMessages } from './ChatMessages';

export function ChatPanel() {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const { chats, isFetchingChats } = useChats();
  const { isConnected, selectChat, activeChatId, chatMessages } = useSocket();
  const { chat } = useChat(activeChatId || undefined);

  const filteredMessages = useMemo(() => {
    if (!activeChatId) {
      return [];
    }

    return chatMessages.filter((message) => message.chatId === activeChatId);
  }, [chatMessages, activeChatId]);

  // Keep React Query and socket state in sync
  useEffect(() => {
    if (chats?.length && !activeChatId && isConnected) {
      selectChat(chats[0]._id);
    }
  }, [chats, activeChatId, isConnected, selectChat]);

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
          <Text fw={700} size="lg">
            {activeChatId && chat ? chat.title : 'Chat'}
          </Text>
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
          <Flex style={{ flexGrow: 1, overflow: 'hidden' }}>
            <Box
              w="35%"
              style={{
                borderRight: `1px solid ${isDarkColorScheme ? theme.colors['lines-dark'][0] : theme.colors['lines-light'][0]}`,
              }}
            >
              <ChatList chats={chats || []} isLoading={isFetchingChats} />
            </Box>
            <Box w="65%" style={{ flexGrow: 1, overflow: 'hidden' }}>
              <ChatMessages
                chat={Object.assign(
                  {},
                  chat,
                  filteredMessages.length > 0 ? { messages: filteredMessages } : {}
                )}
              />
            </Box>
          </Flex>
        )}
      </Box>

      <ChatInput disabled={!activeChatId || !isConnected} />
    </Stack>
  );
}
