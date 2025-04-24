import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services';

/**
 * Hook to fetch all chat sessions with optional filtering
 * @param limit Maximum number of sessions to return
 * @param status Filter by session status ('active', 'archived', or 'all')
 */
export const useChatSessions = (limit = 10, status: 'active' | 'archived' | 'all' = 'active') => {
  return useQuery({
    queryKey: ['chatSessions', { limit, status }],
    queryFn: () => chatService.getAllSessions(limit, status),
    retry: 1,
  });
};
