import { useMutation, useQueryClient } from '@tanstack/react-query';
import Board from '../models/Board';
import Column from '../models/Column';
import TaskService from '../services/TaskService';
import { moveTaskBetweenColumns, updateTaskPosition } from '../utils/taskUtils';

export default function useTask(boardId: string) {
  const queryClient = useQueryClient();

  const reorderTask = useMutation({
    mutationFn: ({
      columnId,
      taskId,
      newPosition,
    }: {
      columnId: string;
      taskId: string;
      newPosition: number;
    }) => TaskService.reorderTask(boardId, columnId, taskId, newPosition),
    onMutate: async ({ columnId, taskId, newPosition }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });
      const previousBoard = queryClient.getQueryData(['board', boardId]);

      queryClient.setQueryData(['board', boardId], (old: Board) => ({
        ...old,
        columns: old.columns.map((col: Column) =>
          col._id === columnId
            ? {
                ...col,
                tasks: updateTaskPosition(col.tasks, taskId, newPosition),
              }
            : col
        ),
      }));

      return { previousBoard };
    },
    onError: (_, __, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const moveTask = useMutation({
    mutationFn: ({
      sourceColumnId,
      targetColumnId,
      taskId,
    }: {
      sourceColumnId: string;
      targetColumnId: string;
      taskId: string;
    }) => TaskService.moveTask(boardId, sourceColumnId, taskId, targetColumnId),
    onMutate: async ({ sourceColumnId, targetColumnId, taskId }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });
      const previousBoard = queryClient.getQueryData(['board', boardId]);

      queryClient.setQueryData(['board', boardId], (old: Board) => ({
        ...old,
        columns: moveTaskBetweenColumns(old.columns, sourceColumnId, targetColumnId, taskId),
      }));

      return { previousBoard };
    },
    onError: (_, __, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const createTask = useMutation({
    mutationFn: ({
      columnId,
      data,
    }: {
      columnId: string;
      data: { title: string; description?: string };
    }) => TaskService.createTask(boardId, columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const updateTask = useMutation({
    mutationFn: ({
      columnId,
      taskId,
      data,
    }: {
      columnId: string;
      taskId: string;
      data: { title?: string; description?: string };
    }) => TaskService.updateTask(boardId, columnId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: ({ columnId, taskId }: { columnId: string; taskId: string }) =>
      TaskService.deleteTask(boardId, columnId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  return {
    reorderTask: reorderTask.mutate,
    moveTask: moveTask.mutate,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
  };
}
