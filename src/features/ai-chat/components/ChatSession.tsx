import { authService } from '@/features/auth/services';
import { useUser } from '@/features/auth/hooks/useUser';
import { ChatMessage as MessageType } from '@/models/ChatMessage';
import {
  AITypingStatusEvent,
  NewMessageEvent,
  SOCKET_EVENTS,
  TypingStatusEvent,
} from '@/models/Socket';
import { notifyUser } from '@/utils/notificationUtils';
import { Box, Button, Group, Loader, ScrollArea, Stack, Text, Textarea } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useChatMessages, useSendMessage } from '../hooks';
import { useTypingStatus } from '../hooks/useTypingStatus';
import { socketService } from '../services';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';

interface ChatSessionProps {
  sessionId: string;
}

export function ChatSession({ sessionId }: ChatSessionProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState<string | null>(null);
  const [aiTyping, setAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const { data: messages, isLoading } = useChatMessages(sessionId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(sessionId);
  const { mutate: updateTypingStatus } = useTypingStatus(sessionId);
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
      [SOCKET_EVENTS.AI_TYPING]: (data: AITypingStatusEvent) => {
        setAITyping(data.isTyping);
      },
      [SOCKET_EVENTS.NEW_MESSAGE]: (data: NewMessageEvent) => {
        console.log('New message received:', data.message);

        // Always turn off AI typing indicator immediately when any message is received
        setAITyping(false);

        // Update the React Query cache
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

        // Force a refetch to ensure UI updates
        queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      },
    };

    console.log('Attempting to connect socket for session:', sessionId);
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

  // Re-add effect to detect assistant messages and turn off typing indicator
  useEffect(() => {
    // If messages exist and the last message is from the assistant
    if (messages && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
      // Immediately turn off AI typing indicator
      setAITyping(false);
      console.log('Assistant message detected, turning off typing indicator');
    }
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      updateTypingStatus(true);
    }
  };

  const handleSubmit = () => {
    if (!message.trim() || isSending) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      notifyUser.error('Authentication Error', 'You need to be logged in to send messages');
      return;
    }

    // Optimistically add the user message immediately
    const optimisticUserMessage: MessageType = {
      _id: `temp-${Date.now()}`,
      content: message,
      role: 'user',
      createdAt: new Date().toISOString(),
      sessionId,
      user: user,
    };

    // First update state and clear input (for immediate UI feedback)
    setMessage('');
    setIsTyping(false);

    // Then update the messages cache
    queryClient.setQueryData(
      ['chatMessages', sessionId],
      (oldMessages: MessageType[] | undefined) => {
        return oldMessages ? [...oldMessages, optimisticUserMessage] : [optimisticUserMessage];
      }
    );

    // Immediate scroll without animation for better perceived performance
    messagesEndRef.current?.scrollIntoView();

    // Then trigger the API call and typing status updates
    sendMessage(message);
    updateTypingStatus(false);

    // Set AI typing after message is visible
    setTimeout(() => {
      setAITyping(true);
    }, 300);
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
              <ChatMessageComponent key={msg._id} message={msg} />
            ))}
            {(userTyping || aiTyping) && (
              <Box p="xs" style={{ fontStyle: 'italic' }}>
                <Text size="xs" c="dimmed">
                  {userTyping ? 'User is typing...' : 'AI is thinking...'}
                </Text>
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
