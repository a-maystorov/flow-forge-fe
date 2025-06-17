import Chat from '@/models/Chat';
import Message from '@/models/Message';
import { useUser } from '@/features/auth/hooks';
import { useSocket } from '../context/SocketContext';
import {
  Box,
  Flex,
  Loader,
  Paper,
  ScrollArea,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useMemo, useRef } from 'react';

interface ChatMessagesProps {
  chat: Chat | undefined;
}

export function ChatMessages({ chat }: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { chatMessages, isLoading, activeChatId } = useSocket();

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  // Use messages from the socket context or fallback to chat.messages
  const messages = useMemo(() => {
    if (!activeChatId) {
      return [];
    }

    return chatMessages.filter((message) => message.chatId === activeChatId);
  }, [chatMessages, activeChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  if (!chat) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Text c="dimmed" fs="italic">
          Select a chat or create a new one
        </Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Loader size="sm" />
        <Text ml="xs" c="dimmed">
          Loading messages...
        </Text>
      </Flex>
    );
  }

  return (
    <ScrollArea h="100%" viewportRef={viewportRef} offsetScrollbars scrollbarSize={6}>
      <Box p="sm">
        {messages.length === 0 ? (
          <Flex align="center" justify="center" h={200}>
            <Text c="dimmed" fs="italic">
              No messages yet
            </Text>
          </Flex>
        ) : (
          messages.map((message: Message, index) => {
            // Handle messages both from socket and from backend
            const messageId = message._id || message.id || `temp-${index}`;
            const messageContent = message.content || message.message || '';
            const isCurrentUser = message.userId === user?._id;
            const timestamp = message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString()
              : new Date().toLocaleTimeString();

            return (
              <Paper
                key={messageId}
                p="xs"
                shadow="xs"
                radius="md"
                mb="sm"
                bg={
                  isCurrentUser
                    ? theme.colors['main-purple'][isDarkColorScheme ? 8 : 0]
                    : isDarkColorScheme
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0]
                }
                style={{
                  maxWidth: '80%',
                  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                  marginLeft: isCurrentUser ? 'auto' : undefined,
                  opacity: message.loading ? 0.7 : 1,
                }}
              >
                <Text size="xs" c="dimmed" mb={4}>
                  {isCurrentUser ? 'You' : message.from}
                  {message.loading && (
                    <Text component="span" ml="xs">
                      (sending...)
                    </Text>
                  )}
                </Text>
                <Text>{messageContent}</Text>
                {message.error && (
                  <Text size="xs" c="red" mt={2}>
                    Error sending message. Please try again.
                  </Text>
                )}
                <Text size="xs" c="dimmed" ta="right" mt={4}>
                  {timestamp}
                </Text>
              </Paper>
            );
          })
        )}
      </Box>
    </ScrollArea>
  );
}
