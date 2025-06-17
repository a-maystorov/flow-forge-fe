import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

export function useChatMessages(chatId: string | undefined) {
  const query = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => chatService.getChatMessages(chatId as string),
    enabled: !!chatId, // Only run the query if chatId is provided
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  return {
    messages: query.data || [],
    isFetchingMessages: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
