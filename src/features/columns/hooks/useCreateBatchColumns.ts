import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';

export function useCreateBatchColumns() {
  const queryClient = useQueryClient();

  const createBatchColumnsMutation = useMutation({
    mutationFn: (params: { boardId: string; columnNames: string[] }) =>
      columnService.createBatchColumns(params.boardId, params.columnNames),
    onSuccess: (_, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return {
    createBatchColumns: createBatchColumnsMutation.mutate,
    isCreatingBatchColumns: createBatchColumnsMutation.isPending,
  };
}
