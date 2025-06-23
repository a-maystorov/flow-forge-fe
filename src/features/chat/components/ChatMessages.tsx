import LayoutColumnsIcon from '@/assets/icons/LayoutColumnsIcon';
import { useUser } from '@/features/auth/hooks';
import Message, { MessageRole } from '@/models/Message';
import { RichTextContent } from '@/shared/components/rich-text-content/RichTextContent';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import {
  Box,
  Button,
  Flex,
  Loader,
  Paper,
  ScrollArea,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useChat } from '../hooks/useChat';
import { BoardContextModal } from './BoardContextModal';

interface ChatMessagesProps {
  messages?: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ messages = [], isLoading: propIsLoading }: ChatMessagesProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { isLoading: socketLoading, isAiResponding, activeChatId } = useSocket();
  const { chat } = useChat(activeChatId || '');

  const isLoading = propIsLoading !== undefined ? propIsLoading : socketLoading;

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const [dots, setDots] = useState('');
  const [boardContextModalOpen, setBoardContextModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isAiResponding]);

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
    <>
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
            <>
              {messages.map((message: Message, index) => {
                const messageId = message._id || message.id || `temp-${index}`;
                const messageContent = message.content || message.message || '';
                const isCurrentUser =
                  message.userId === user?._id || message.role === MessageRole.USER;
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
                      position: 'relative',
                    }}
                  >
                    <Box mb={4} style={{ width: '100%' }}>
                      <Text fw={600} mb="xs" c="dimmed">
                        {message.role === MessageRole.USER ? 'Me' : 'AI Assistant'}
                      </Text>
                      {message.loading && message.role === MessageRole.ASSISTANT && (
                        <Flex align="center" mb={6}>
                          <Text
                            c="dimmed"
                            style={{
                              fontStyle: 'italic',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            AI Assistant is typing{dots}
                          </Text>
                        </Flex>
                      )}
                      {message.loading && message.role !== MessageRole.ASSISTANT && (
                        <Text span c="dimmed" fs="italic" mb={2} display="block">
                          (sending...)
                        </Text>
                      )}
                      {message.role === MessageRole.ASSISTANT ? (
                        <Text
                          style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-line',
                            width: '100%',
                          }}
                        >
                          <RichTextContent html={convertMarkdownToHtml(messageContent)} />
                        </Text>
                      ) : (
                        <Text
                          style={{
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-line',
                            width: '100%',
                          }}
                        >
                          <RichTextContent html={convertMarkdownToHtml(messageContent)} />
                        </Text>
                      )}
                    </Box>
                    {message.error && (
                      <Text size="xs" c="red" mt={2}>
                        Error sending message. Please try again.
                      </Text>
                    )}
                    <Flex justify="space-between" align="center" gap="sm" mt={4}>
                      {message.role === MessageRole.ASSISTANT && chat?.boardContext && (
                        <Button
                          variant="light"
                          color="blue"
                          size="xs"
                          leftSection={<LayoutColumnsIcon w={16} h={16} />}
                          onClick={() => setBoardContextModalOpen(true)}
                        >
                          Preview
                        </Button>
                      )}
                      <Text size="xs" c="dimmed">
                        {timestamp}
                      </Text>
                    </Flex>
                  </Paper>
                );
              })}

              {/* Add a dedicated typing indicator at the bottom when AI is responding */}
              {isAiResponding && (
                <Paper
                  p="md"
                  shadow="xs"
                  radius="md"
                  mb="sm"
                  bg={
                    isDarkColorScheme
                      ? theme.colors['very-dark-gray'][0]
                      : theme.colors['light-gray'][0]
                  }
                  style={{
                    position: 'relative',
                    alignSelf: 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <Flex align="center">
                    <Loader size="xs" mr="xs" />
                    <Text c="dimmed" style={{ fontStyle: 'italic' }}>
                      AI Assistant is typing{dots}
                    </Text>
                  </Flex>
                </Paper>
              )}
            </>
          )}
        </Box>
      </ScrollArea>

      <BoardContextModal
        boardContext={chat?.boardContext}
        isOpen={boardContextModalOpen}
        onClose={() => setBoardContextModalOpen(false)}
        chat={chat || { _id: '' }}
      />
    </>
  );
}
