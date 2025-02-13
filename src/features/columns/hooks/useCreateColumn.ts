import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => columnService.createColumn(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    createColumn: createColumnMutation.mutate,
    isCreating: createColumnMutation.isPending,
  };
}
