import { ChatMessage } from '@/models/ChatMessage';
import { ChatIntent } from '@/models/Suggestion';
import { User } from '@/models/User';
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

  return useMutation<ChatMessage, Error, { message: string; intent?: ChatIntent }>({
    mutationFn: async (params: { message: string; intent?: ChatIntent }) => {
      const { message, intent } = params;

      if (!sessionId) {
        throw new Error('No active session');
      }

      if (intent === 'general_question' || intent === 'capability_question') {
        const response = await chatService.askGeneralQuestion(sessionId, message);
        const responseMsg = response.responseMessage;

        const aiUser: User = {
          _id: 'system',
          email: 'system@flowforge.ai',
          username: 'AI Assistant',
          iat: Math.floor(Date.now() / 1000),
        };

        return {
          _id: responseMsg._id,
          sessionId: responseMsg.sessionId,
          content: responseMsg.content,
          createdAt: responseMsg.createdAt,
          role: responseMsg.role,
          user: aiUser,
          metadata: responseMsg.metadata,
        };
      } else {
        return chatService.addMessage(sessionId, message);
      }
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
