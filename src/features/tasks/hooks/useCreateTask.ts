import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services';
import { notifications } from '@mantine/notifications';

export const useCreateTask = (boardId: string, columnId: string) => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      taskService.createTask(boardId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      notifications.show({
        title: 'Task created',
        message: 'Task has been successfully created',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Task creation failed',
        message: error.message,
        color: 'red',
      });
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
  };
};
