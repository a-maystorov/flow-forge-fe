import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';

export function useCreateBatchColumns(boardId: string) {
  const queryClient = useQueryClient();

  const createBatchColumnsMutation = useMutation({
    mutationFn: (columnNames: string[]) => columnService.createBatchColumns(boardId, columnNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      // TODO: Add notification
      console.error(error);
    },
  });

  return {
    createBatchColumns: createBatchColumnsMutation.mutate,
    isCreating: createBatchColumnsMutation.isPending,
  };
}
