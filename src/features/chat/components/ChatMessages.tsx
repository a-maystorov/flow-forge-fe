import { useUser } from '@/features/auth/hooks';
import Message from '@/models/Message';
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
import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

interface ChatMessagesProps {
  messages?: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages = [], isLoading: propIsLoading }: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { isLoading: socketLoading } = useSocket();

  const isLoading = propIsLoading !== undefined ? propIsLoading : socketLoading;

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();

      const scrollableElement = viewportRef.current;
      if (scrollableElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight;

        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
          e.preventDefault();
        }
      }
    };

    const viewport = viewportRef.current;
    if (viewport) {
      viewport.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        viewport.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

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
    <ScrollArea
      h="100%"
      viewportRef={viewportRef}
      offsetScrollbars
      scrollbarSize={6}
      type="always"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Box p="sm" pb="60px">
        {messages.length === 0 ? (
          <Flex align="center" justify="center" h={200}>
            <Text c="dimmed" fs="italic">
              No messages yet
            </Text>
          </Flex>
        ) : (
          messages.map((message: Message, index) => {
            const messageId = message._id || message.id || `temp-${index}`;
            const messageContent = message.content || message.message || '';
            const isCurrentUser = message.userId === user?._id || message.from === 'User';
            const timestamp = message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString()
              : new Date().toLocaleTimeString();

            return (
              <Paper
                key={messageId}
                p="xl"
                shadow="xs"
                radius="md"
                mb="sm"
                bg={
                  isDarkColorScheme
                    ? theme.colors['very-dark-gray'][0]
                    : theme.colors['light-gray'][0]
                }
                style={{
                  alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                  marginLeft: isCurrentUser ? 'auto' : undefined,
                  opacity: message.loading ? 0.7 : 1,
                }}
              >
                <Box mb={4} style={{ width: '100%' }}>
                  {message.loading && (
                    <Text span c="dimmed" fs="italic" mb={2} display="block">
                      (sending...)
                    </Text>
                  )}
                  <Text
                    style={{
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      width: '100%',
                    }}
                  >
                    {messageContent}
                  </Text>
                </Box>
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
