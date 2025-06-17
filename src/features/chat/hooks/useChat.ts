import Chat from '@/models/Chat';
import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

export function useChat(chatId: string | undefined) {
  const query = useQuery<Chat, Error>({
    queryKey: ['chats', chatId],
    queryFn: () => chatService.getChat(chatId as string),
    enabled: !!chatId, // Only run the query if chatId is provided
  });

  return {
    chat: query.data,
    isFetchingChat: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
