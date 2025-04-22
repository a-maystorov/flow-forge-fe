import { notifyUser } from '@/utils/notificationUtils';
import { useMutation } from '@tanstack/react-query';
import { chatService } from '../services';

/**
 * Hook for managing user typing status in a chat session
 * @param sessionId The ID of the active chat session
 * @returns Mutation for updating typing status
 */
export const useTypingStatus = (sessionId: string | null) => {
  return useMutation({
    mutationFn: (isTyping: boolean) => {
      if (!sessionId) {
        throw new Error('No active session');
      }
      return chatService.updateTypingStatus(sessionId, isTyping);
    },
    onError: (error: Error) => notifyUser.error('Failed to update typing status', error.message),
  });
};
