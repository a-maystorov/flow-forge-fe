import { useMutation, useQueryClient } from '@tanstack/react-query';
import TaskService from '../services/TaskService';

interface CreateTaskParams {
  columnId: string;
  title: string;
  description?: string;
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ columnId, ...data }: CreateTaskParams) => {
      return TaskService.createTask(columnId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });
}
