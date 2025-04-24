import { useUser } from '@/features/auth/hooks/useUser';
import { authService } from '@/features/auth/services';
import { ChatMessage as MessageType } from '@/models/ChatMessage';
import { NewMessageEvent, SOCKET_EVENTS, TypingStatusEvent } from '@/models/Socket';
import { notifyUser } from '@/utils/notificationUtils';
import { Box, Button, Group, Loader, ScrollArea, Stack, Text, Textarea } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useChatInteraction, useChatMessages } from '../hooks';
import { useSuggestionPreview } from '../hooks/useSuggestionPreview';
import { useTypingStatus } from '../hooks/useTypingStatus';
import { socketService } from '../services';
import ChatMessage from './ChatMessage';
import { SuggestionPreview } from './suggestions';

interface Props {
  sessionId: string;
}

export function ChatSession({ sessionId }: Props) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const { data: messages, isLoading } = useChatMessages(sessionId);
  const { mutate: sendMessage, isPending: isSending } = useChatInteraction(sessionId);
  const { mutate: updateTypingStatus } = useTypingStatus(sessionId);
  const {
    preview,
    isLoading: isPreviewLoading,
    acceptSuggestion,
    rejectSuggestion,
  } = useSuggestionPreview(sessionId);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = authService.getToken();
    if (!token) {
      return;
    }

    const callbacks = {
      [SOCKET_EVENTS.USER_TYPING]: (data: TypingStatusEvent) => {
        if (data.isTyping) {
          setUserTyping(data.userId);
        } else {
          setUserTyping(null);
        }
      },
      [SOCKET_EVENTS.NEW_MESSAGE]: (data: NewMessageEvent) => {
        console.log('New message received:', data.message);
        queryClient.setQueryData(
          ['chatMessages', sessionId],
          (oldMessages: MessageType[] | undefined) => {
            if (!oldMessages) {
              return [data.message];
            }

            if (oldMessages.some((msg) => msg._id === data.message._id)) {
              return oldMessages;
            }

            return [...oldMessages, data.message];
          }
        );

        queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    };

    socketService.connect(sessionId, token, callbacks);

    return () => {
      socketService.disconnect();
    };
  }, [sessionId, queryClient, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isTyping) {
      return;
    }

    const timer = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isTyping, updateTypingStatus]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || isSending) {
      return;
    }

    if (!user) {
      notifyUser.error('Authentication Error', 'You need to be logged in to send messages');
      return;
    }

    const optimisticUserMessage: MessageType = {
      _id: `temp-${Date.now()}`,
      content: message,
      createdAt: new Date().toISOString(),
      role: 'user',
      user: user,
      sessionId,
    };

    setMessage('');
    setIsTyping(false);

    queryClient.setQueryData(
      ['chatMessages', sessionId],
      (oldMessages: MessageType[] | undefined) => {
        if (!oldMessages) {
          return [optimisticUserMessage];
        }
        return [...oldMessages, optimisticUserMessage];
      }
    );

    // Immediate scroll without animation for better perceived performance
    messagesEndRef.current?.scrollIntoView();

    try {
      sendMessage(
        {
          message,
        },
        {
          onSuccess: () => {
            updateTypingStatus(false);
          },
          onError: (error) => {
            console.error('Error sending message:', error);

            queryClient.setQueryData(
              ['chatMessages', sessionId],
              (oldMessages: MessageType[] | undefined) => {
                if (!oldMessages) return [];
                return oldMessages.filter((msg) => msg._id !== optimisticUserMessage._id);
              }
            );
          },
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      notifyUser.error('Error', 'Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <Box py="xl" ta="center">
        <Loader size="sm" />
        <Text size="sm" c="dimmed" mt="xs">
          Loading messages...
        </Text>
      </Box>
    );
  }

  return (
    <Stack h="calc(100vh - 150px)" py="md">
      <ScrollArea h="calc(100% - 100px)" pr="md" pb="md">
        {messages && messages.length > 0 ? (
          <Stack gap="md">
            {messages.map((msg: MessageType) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                onAcceptSuggestion={acceptSuggestion}
                onRejectSuggestion={rejectSuggestion}
              />
            ))}
            {(userTyping || isSending) && (
              <Box p="xs" style={{ fontStyle: 'italic' }}>
                <Text size="xs" c="dimmed">
                  {userTyping ? 'User is typing...' : 'AI is thinking...'}
                </Text>
              </Box>
            )}

            {/* Render suggestion preview if available */}
            {preview.visible && preview.type && preview.content && (
              <Box my="md">
                <Box
                  style={{
                    position: 'relative',
                    maxWidth: '85%',
                    marginLeft: 'auto',
                    borderRadius: 'var(--mantine-radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <SuggestionPreview
                    type={preview.type}
                    content={preview.content}
                    suggestionId={preview.suggestionId || ''}
                    isLoading={isPreviewLoading}
                    onAccept={acceptSuggestion}
                    onReject={rejectSuggestion}
                  />
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Stack>
        ) : (
          <Box ta="center" pt="xl">
            <Text c="dimmed">No messages yet</Text>
            <Text size="sm" c="dimmed" mt="xs">
              Send a message to start the conversation
            </Text>
          </Box>
        )}
      </ScrollArea>

      <Box p="md" style={{ position: 'sticky', bottom: 0, background: 'inherit' }}>
        <Textarea
          placeholder="Type your message..."
          value={message}
          onChange={handleMessageChange}
          minRows={2}
          maxRows={4}
          autosize
          style={{ marginBottom: '8px' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <Group justify="flex-end">
          <Button onClick={handleSubmit} loading={isSending}>
            Send
          </Button>
        </Group>
      </Box>
    </Stack>
  );
}
