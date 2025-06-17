import Chat from '@/models/Chat';
import { QueryKey, useQuery } from '@tanstack/react-query';
import ms from 'ms';
import { chatService } from '../services';

export function useChats() {
  const query = useQuery<Chat[], Error, Chat[], QueryKey>({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
    staleTime: ms('5m'), // Set to a shorter time than boards since chat activity is more frequent
  });

  return {
    chats: query.data || [],
    isFetchingChats: query.isPending,
    isError: query.isError,
    error: query.error,
  };
}
