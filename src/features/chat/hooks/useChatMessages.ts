import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

export function useChatMessages(chatId: string | undefined) {
  const query = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => chatService.getChatMessages(chatId as string),
    enabled: !!chatId,
    staleTime: 30000,
  });

  return {
    messages: query.data || [],
    isFetchingMessages: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
