import { useMutation, useQueryClient } from '@tanstack/react-query';
import { columnService } from '../services';
import { notifications } from '@mantine/notifications';

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();

  const createColumnMutation = useMutation({
    mutationFn: (name: string) => columnService.createColumn(boardId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifications.show({
        title: 'Column created',
        message: 'Column has been successfully created',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Column creation failed',
        message: error.message,
        color: 'red',
      });
    },
  });

  return {
    createColumn: createColumnMutation.mutate,
    isCreatingColumn: createColumnMutation.isPending,
  };
}
