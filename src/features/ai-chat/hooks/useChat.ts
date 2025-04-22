import { ChatMessage } from '@/models/ChatMessage';
import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';

export const useChatSessions = (limit = 10, status: 'active' | 'archived' | 'all' = 'active') => {
  return useQuery({
    queryKey: ['chatSessions', { limit, status }],
    queryFn: () => chatService.getAllSessions(limit, status),
    retry: 1,
  });
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      title,
      boardId,
      taskId,
    }: { title?: string; boardId?: string; taskId?: string } = {}) =>
      chatService.createSession(title, boardId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      notifyUser.success('Chat Session Created', 'New chat session has been created');
    },
    onError: (error: Error) => notifyUser.error('Failed to create chat session', error.message),
  });
};

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
    staleTime: 500, // Consider data stale after 500ms for faster updates
  });
};

export const useSendMessage = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => {
      if (!sessionId) {
        throw new Error('No active session');
      }
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
