import { SuggestionContent, SuggestionType } from '@/models/Suggestion';
import { notifyUser } from '@/utils/notificationUtils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { socketService } from '../services';
import { chatService } from '../services/chatService';

interface SuggestionPreviewState {
  visible: boolean;
  type: SuggestionType | null;
  content: SuggestionContent | null;
  suggestionId: string | null;
  isLoading: boolean;
  // Track if this suggestion is currently being processed
  isProcessing: boolean;
}

export const useSuggestionPreview = (sessionId: string | null) => {
  const queryClient = useQueryClient();

  const [preview, setPreview] = useState<SuggestionPreviewState>({
    visible: false,
    type: null,
    content: null,
    suggestionId: null,
    isLoading: false,
    isProcessing: false,
  });

  const acceptMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!sessionId) throw new Error('No active session');

      // Mark as processing to prevent rapid double-clicks
      if (suggestionId === preview.suggestionId) {
        setPreview((prev) => ({ ...prev, isProcessing: true }));
      }

      return chatService.acceptSuggestion(suggestionId);
    },
    onSuccess: () => {
      notifyUser.success('Suggestion accepted', 'The suggestion has been applied successfully');
      resetPreview();

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
        queryClient.invalidateQueries({ queryKey: ['boards'] });
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
    },
    onError: (error: Error) => {
      // Reset processing state on error
      setPreview((prev) => ({ ...prev, isProcessing: false }));
      notifyUser.error('Failed to accept suggestion', error.message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      if (!sessionId) throw new Error('No active session');

      // Mark as processing to prevent rapid double-clicks
      if (suggestionId === preview.suggestionId) {
        setPreview((prev) => ({ ...prev, isProcessing: true }));
      }

      return chatService.rejectSuggestion(suggestionId);
    },
    onSuccess: () => {
      notifyUser.success('Suggestion rejected', 'The suggestion has been dismissed');
      resetPreview();

      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['chatMessages', sessionId] });
    },
    onError: (error: Error) => {
      // Reset processing state on error
      setPreview((prev) => ({ ...prev, isProcessing: false }));
      notifyUser.error('Failed to reject suggestion', error.message);
    },
  });

  const resetPreview = useCallback(() => {
    setPreview({
      visible: false,
      type: null,
      content: null,
      suggestionId: null,
      isLoading: false,
      isProcessing: false,
    });
  }, []);

  const setupSocketEvents = useCallback(() => {
    if (!sessionId) {
      return;
    }

    socketService.on('suggestion_preview', (data) => {
      setPreview({
        visible: true,
        type: data.type,
        content: data.preview,
        suggestionId: data.suggestionId,
        isLoading: false,
        isProcessing: false,
      });
    });

    socketService.on('suggestion_status_update', (data) => {
      if (
        data.suggestionId === preview.suggestionId &&
        (data.status === 'accepted' || data.status === 'rejected')
      ) {
        resetPreview();
      }
    });

    return () => {
      socketService.off('suggestion_preview');
      socketService.off('suggestion_status_update');
    };
  }, [sessionId, preview.suggestionId, resetPreview]);

  // Setup socket events when the component mounts or sessionId changes
  useEffect(() => {
    const cleanup = setupSocketEvents();
    return () => {
      if (cleanup) cleanup();
    };
  }, [sessionId, setupSocketEvents]);

  return {
    preview,
    isLoading: preview.isLoading || acceptMutation.isPending || rejectMutation.isPending,
    acceptSuggestion: acceptMutation.mutate,
    rejectSuggestion: rejectMutation.mutate,
    resetPreview,
  };
};
