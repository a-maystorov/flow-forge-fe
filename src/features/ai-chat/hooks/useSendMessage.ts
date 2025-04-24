import { ChatMessage } from '@/models/ChatMessage';
import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';

/**
 * Hook to handle sending a user message and processing the AI response
 * This hook manages the full messaging flow, including:
 * - Sending user messages
 * - Handling different AI response types (general questions vs suggestions)
 * - Properly formatting the response for the UI
 * @param sessionId ID of the chat session
 * @returns Mutation function and state for the chat interaction
 */
export const useChatInteraction = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<ChatMessage, Error, { message: string }>({
    mutationFn: async (params: { message: string }) => {
      const { message } = params;

      if (!sessionId) {
        throw new Error('No active session');
      }

      // Let the backend handle intent detection and message routing
      return chatService.addMessage(sessionId, message);
    },
    onSuccess: (newMessage: ChatMessage) => {
      queryClient.setQueryData(
        ['chatMessages', sessionId],
        (oldData: ChatMessage[] | undefined) => {
          return oldData ? [...oldData, newMessage] : [newMessage];
        }
      );
    },
    onError: (error: Error) => notifyUser.error('Failed to send message', error.message),
  });
};

// Re-export for backward compatibility
export const useSendMessage = useChatInteraction;
