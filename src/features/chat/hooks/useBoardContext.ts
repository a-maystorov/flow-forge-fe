import Board from '@/models/Board';
import { BoardContext } from '@/models/BoardContext';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardContextService } from '../services/BoardContextService';
import { chatService } from '../services/ChatService';

/**
 * Hook for handling board context operations (create or update)
 * Uses the chat object to determine which operation to perform based on boardId
 */
export const useBoardContextOperations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Board, Error, { boardContext: BoardContext; chatId: string }>({
    mutationFn: ({ boardContext }) => boardContextService.createBoardFromContext(boardContext),
    onSuccess: async (newBoard, { chatId }) => {
      if (newBoard._id) {
        try {
          await chatService.updateChat(chatId, { boardId: newBoard._id });

          queryClient.invalidateQueries({ queryKey: ['chats', chatId] });
          queryClient.invalidateQueries({ queryKey: ['chats'] });

          queryClient.invalidateQueries({ queryKey: ['boards'] });
          queryClient.invalidateQueries({ queryKey: ['board', newBoard._id] });

          notifications.show({
            title: 'Board created',
            message: 'board has been successfully created',
            color: 'green',
          });
        } catch (error) {
          console.error('Error updating chat with board ID:', error);
          notifications.show({
            title: 'Board created',
            message: 'board created but failed to link with chat',
            color: 'yellow',
          });
        }
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Board creation failed',
        message: error.message || 'failed to create board',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation<Board, Error, { boardId: string; boardContext: BoardContext }>(
    {
      mutationFn: ({ boardId, boardContext }) => {
        if (!boardId) {
          return Promise.reject(new Error('Board id is required for updating'));
        }
        return boardContextService.updateBoardFromContext(boardId, boardContext);
      },
      onSuccess: async (_, { boardId }) => {
        queryClient.invalidateQueries({ queryKey: ['boards'] });
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });

        notifications.show({
          title: 'Board updated',
          message: 'board has been successfully updated',
          color: 'green',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Board update failed',
          message: error.message || 'failed to update board',
          color: 'red',
        });
      },
    }
  );

  const handleBoardContext = (
    chat: { _id: string; boardId?: string },
    boardContext: BoardContext
  ) => {
    if (chat.boardId) {
      return updateMutation.mutate({
        boardId: chat.boardId,
        boardContext,
      });
    } else {
      return createMutation.mutate({
        chatId: chat._id,
        boardContext,
      });
    }
  };

  return {
    handleBoardContext,
    isLoading: createMutation.isPending || updateMutation.isPending,
    isError: createMutation.isError || updateMutation.isError,
    error: createMutation.error || updateMutation.error,
  };
};
