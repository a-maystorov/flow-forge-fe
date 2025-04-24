import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services';

/**
 * Hook to create a new chat session
 * @returns Mutation function and state for creating a chat session
 */
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
