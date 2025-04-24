import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

/**
 * Hook to fetch messages for a specific chat session
 * @param sessionId ID of the chat session
 * @param limit Maximum number of messages to return
 * @param skip Number of messages to skip (for pagination)
 */
export const useChatMessages = (sessionId: string | null, limit = 50, skip = 0) => {
  return useQuery({
    queryKey: ['chatMessages', sessionId, { limit, skip }],
    queryFn: () => {
      if (!sessionId) {
        return [];
      }
      return chatService.getSessionMessages(sessionId, limit, skip);
    },
    enabled: !!sessionId,
    retry: 1,
    refetchInterval: 2000, // Poll every 2 seconds as a fallback
    staleTime: 500,
  });
};
