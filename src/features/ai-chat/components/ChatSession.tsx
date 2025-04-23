import { useUser } from '@/features/auth/hooks/useUser';
import { authService } from '@/features/auth/services';
import { ChatMessage as MessageType } from '@/models/ChatMessage';
import { ChatIntent } from '@/models/Suggestion';
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
import { useSuggestionPreview } from '../hooks/useSuggestionPreview';
import { useTypingStatus } from '../hooks/useTypingStatus';
import { socketService, chatService } from '../services';
import ChatMessage from './ChatMessage';
import { SuggestionPreview } from './suggestions';

interface Props {
  sessionId: string;
}

export function ChatSession({ sessionId }: Props) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState<string | null>(null);
  const [aiTyping, setAITyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const { data: messages, isLoading } = useChatMessages(sessionId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(sessionId);
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

  // Function to determine the likely intent of a user message
  const detectMessageIntent = (message: string): ChatIntent => {
    // Simple intent detection based on message content
    const lowerMsg = message.toLowerCase();

    // Check for questions about capabilities
    if (
      lowerMsg.includes('what can you do') ||
      lowerMsg.includes('help me with') ||
      lowerMsg.includes('how can you') ||
      lowerMsg.includes('show me what') ||
      lowerMsg.includes('capabilities')
    ) {
      return 'capability_question';
    }

    // Check for task breakdown requests
    if (
      (lowerMsg.includes('break down') || lowerMsg.includes('breakdown')) &&
      lowerMsg.includes('task')
    ) {
      return 'task_breakdown';
    }

    // Check for board creation requests
    if (
      lowerMsg.includes('create a board') ||
      lowerMsg.includes('make a board') ||
      lowerMsg.includes('new board')
    ) {
      return 'board_suggestion';
    }

    // Check for task improvement requests
    if (lowerMsg.includes('improve this task') || lowerMsg.includes('better task')) {
      return 'task_improvement';
    }

    // Default to general question
    return 'general_question';
  };

  const handleSubmit = async () => {
    if (!message.trim() || isSending) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      notifyUser.error('Authentication Error', 'You need to be logged in to send messages');
      return;
    }

    // Detect probable intent
    const likelyIntent = detectMessageIntent(message);

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

    // Set AI typing indicator
    setTimeout(() => {
      setAITyping(true);
    }, 300);

    try {
      // Use different API methods based on the likely intent
      if (likelyIntent === 'general_question' || likelyIntent === 'capability_question') {
        // Use the new general question endpoint for general and capability questions
        await chatService.askGeneralQuestion(sessionId, message);
      } else {
        // For other types of suggestions, use the standard message endpoint
        await chatService.addMessage(sessionId, message);
      }

      // Update typing status
      updateTypingStatus(false);
    } catch (error) {
      console.error('Error sending message:', error);
      notifyUser.error('Error', 'Failed to send message');

      // Remove the optimistic message on error
      queryClient.setQueryData(
        ['chatMessages', sessionId],
        (oldMessages: MessageType[] | undefined) => {
          if (!oldMessages) return [];
          return oldMessages.filter((msg) => msg._id !== optimisticUserMessage._id);
        }
      );
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
            {(userTyping || aiTyping) && (
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
