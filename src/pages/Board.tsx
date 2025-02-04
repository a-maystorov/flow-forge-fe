import { DragDropContext } from '@hello-pangea/dnd';
import { Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import AddColumnButton from '../components/add-column-button';
import AddTaskButton from '../components/add-task-button';
import { DndListHandle } from '../components/dnd-list-handle/DndListHandle';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import CreateColumnModal from '../components/modals/CreateColumnModal';
import NewColumnButton from '../components/new-column-button';
import useBoard from '../hooks/useBoard';
import useBoards from '../hooks/useBoards';
import { Home } from '../pages';
import Board from '../models/Board';
import Task from '../models/Task';
import TaskService from '../services/TaskService';
import Column from '../models/Column';

export default function BoardPage() {
  const { boardId } = useParams();
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const { data: boards = [] } = useBoards();
  const { data: board, isLoading: isLoadingBoard } = useBoard(boardId ?? '');

  // TODO: modularize
  // Helper functions for optimistic updates
  const updateTaskPosition = (tasks: Task[], taskId: string, newPosition: number): Task[] => {
    const taskIndex = tasks.findIndex((t) => t._id === taskId);
    if (taskIndex === -1) {
      return tasks;
    }

    const updatedTasks = [...tasks];
    const [task] = updatedTasks.splice(taskIndex, 1);
    updatedTasks.splice(newPosition, 0, { ...task, position: newPosition });

    return updatedTasks.map((t, index) => ({
      ...t,
      position: index,
    }));
  };

  const moveTaskBetweenColumns = (
    columns: Column[],
    sourceColumnId: string,
    targetColumnId: string,
    taskId: string
  ): Column[] => {
    return columns.map((col) => {
      // Remove from source column
      if (col._id === sourceColumnId) {
        const remainingTasks = col.tasks.filter((t) => t._id !== taskId);
        const updatedTasks = remainingTasks.map((t, index) => ({
          ...t,
          position: index,
        }));

        return {
          ...col,
          tasks: updatedTasks,
        };
      }

      // Add to target column
      if (col._id === targetColumnId) {
        const task = columns
          .find((c) => c._id === sourceColumnId)
          ?.tasks.find((t) => t._id === taskId);

        if (!task) {
          return col;
        }

        const updatedTasks = [
          ...col.tasks,
          {
            ...task,
            columnId: targetColumnId,
            position: col.tasks.length,
          },
        ];

        return {
          ...col,
          tasks: updatedTasks,
        };
      }

      return col;
    });
  };

  const { mutate: reorderTask } = useMutation({
    mutationFn: ({
      columnId,
      taskId,
      newPosition,
    }: {
      columnId: string;
      taskId: string;
      newPosition: number;
    }) => {
      return TaskService.reorderTask(boardId ?? '', columnId, taskId, newPosition);
    },
    onMutate: async ({ columnId, taskId, newPosition }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });
      const previousBoard = queryClient.getQueryData<Board>(['board', boardId]);

      if (!previousBoard) {
        return { previousBoard: null };
      }

      const updatedBoard = {
        ...previousBoard,
        columns: previousBoard.columns.map((col) => {
          if (col._id !== columnId) {
            return col;
          }

          return {
            ...col,
            tasks: updateTaskPosition(col.tasks, taskId, newPosition),
          };
        }),
      };

      queryClient.setQueryData<Board>(['board', boardId], updatedBoard);
      return { previousBoard };
    },
    onError: (_, __, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData<Board>(['board', boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const { mutate: moveTask } = useMutation({
    mutationFn: ({
      sourceColumnId,
      taskId,
      targetColumnId,
    }: {
      sourceColumnId: string;
      taskId: string;
      targetColumnId: string;
    }) => {
      return TaskService.moveTask(boardId ?? '', sourceColumnId, taskId, targetColumnId);
    },
    onMutate: async ({ sourceColumnId, taskId, targetColumnId }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });
      const previousBoard = queryClient.getQueryData<Board>(['board', boardId]);

      if (!previousBoard) {
        return { previousBoard: null };
      }

      const updatedBoard = {
        ...previousBoard,
        columns: moveTaskBetweenColumns(
          previousBoard.columns,
          sourceColumnId,
          targetColumnId,
          taskId
        ),
      };

      queryClient.setQueryData<Board>(['board', boardId], updatedBoard);
      return { previousBoard };
    },
    onError: (_, __, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData<Board>(['board', boardId], context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    },
  });

  const columnTasksMap = useMemo(() => {
    if (!board) {
      return new Map();
    }

    const taskMap = new Map();
    board.columns.forEach((col) => {
      taskMap.set(col._id, []);
    });

    board.columns.forEach((col) => {
      col.tasks.forEach((task) => {
        const tasks = taskMap.get(task.columnId) || [];
        tasks.push(task);
        taskMap.set(task.columnId, tasks);
      });
    });

    taskMap.forEach((tasks, columnId) => {
      taskMap.set(
        columnId,
        tasks.sort((a: Task, b: Task) => a.position - b.position)
      );
    });

    return taskMap;
  }, [board]);

  useEffect(() => {
    const title = board?.name ?? (boards.length ? 'Select a board' : 'No boards');
    document.title = `${title} | FlowForge`;

    const titleElements = document.querySelectorAll('[data-board-title]');
    titleElements.forEach((element) => {
      element.textContent = title;
    });
  }, [board?.name, boards.length]);

  if (boards.length === 0) {
    return <Home />;
  }

  if (isLoadingBoard) {
    return null; // TODO: Add loading state
  }

  if (!board?.columns?.length) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Stack align="center" gap="lg">
          <Text c={theme.colors['medium-gray'][0]} fz="h2" fw={600} ta="center">
            This board is empty. Create a new column to get started.
          </Text>
          <AddColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />
          <CreateColumnModal
            isOpen={isCreateColumnModalOpen}
            onClose={() => setIsCreateColumnModalOpen(false)}
            boardId={boardId ?? ''}
          />
        </Stack>
      </Flex>
    );
  }

  return (
    <DragDropContext
      onDragEnd={({ destination, source, draggableId }) => {
        if (!destination) {
          return;
        }

        const sourceColId = source.droppableId;
        const targetColId = destination.droppableId;

        if (sourceColId === targetColId) {
          if (source.index !== destination.index) {
            reorderTask({
              columnId: sourceColId,
              taskId: draggableId,
              newPosition: destination.index,
            });
          }
        } else {
          moveTask({
            sourceColumnId: sourceColId,
            taskId: draggableId,
            targetColumnId: targetColId,
          });
        }
      }}
    >
      <Flex align="flex-start" h="100%" gap={theme.spacing['2lg']}>
        {board.columns.map((column) => {
          const columnTasks = columnTasksMap.get(column._id) || [];

          return (
            <Stack key={column._id} w={300}>
              <Text fw={600} size="lg">
                {column.name}
              </Text>
              <AddTaskButton onClick={() => setSelectedColumnId(column._id)} />
              <Stack gap="xs">
                <DndListHandle tasks={columnTasks} columnId={column._id} />
              </Stack>
            </Stack>
          );
        })}
        <NewColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />
      </Flex>
      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => setIsCreateColumnModalOpen(false)}
        boardId={boardId ?? ''}
      />
      <CreateTaskModal
        isOpen={selectedColumnId !== null}
        onClose={() => setSelectedColumnId(null)}
        columnId={selectedColumnId ?? ''}
        boardId={boardId ?? ''}
      />
    </DragDropContext>
  );
}
