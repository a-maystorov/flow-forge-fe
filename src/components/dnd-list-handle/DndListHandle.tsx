import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Box, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import cx from 'clsx';
import { useMemo } from 'react';
import GripVerticalIcon from '../../assets/icons/GripVerticalIcon';
import Board from '../../models/Board';
import Task from '../../models/Task';
import TaskService from '../../services/TaskService';
import classes from './DndListHandle.module.css';

interface Props {
  tasks: Task[];
  boardId: string;
  columnId: string;
}

export function DndListHandle({ tasks, boardId, columnId }: Props) {
  const queryClient = useQueryClient();
  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';
  const theme = useMantineTheme();

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.position - b.position);
  }, [tasks]);

  const { mutate: reorderTask } = useMutation({
    mutationFn: ({ taskId, newPosition }: { taskId: string; newPosition: number }) => {
      return TaskService.reorderTask(boardId, columnId, taskId, newPosition);
    },
    onMutate: async ({ taskId, newPosition }) => {
      await queryClient.cancelQueries({ queryKey: ['board', boardId] });

      const board = queryClient.getQueryData<Board>(['board', boardId]);
      if (!board) {
        return { previousBoard: null };
      }

      const updatedBoard = {
        ...board,
        columns: board.columns.map((col) => {
          if (col._id !== columnId) {
            return col;
          }

          const taskToMove = col.tasks.find((t) => t._id === taskId);
          if (!taskToMove) {
            return col;
          }

          if (taskToMove.position === newPosition) {
            return col;
          }

          const updatedTasks = col.tasks.map((task) => {
            if (task._id === taskId) {
              return { ...task, position: newPosition };
            }
            const oldPosition = taskToMove.position;

            if (oldPosition < newPosition) {
              // Moving down
              if (task.position > oldPosition && task.position <= newPosition) {
                return { ...task, position: task.position - 1 };
              }
            } else {
              // Moving up
              if (task.position >= newPosition && task.position < oldPosition) {
                return { ...task, position: task.position + 1 };
              }
            }
            return task;
          });

          return {
            ...col,
            tasks: updatedTasks,
          };
        }),
      };

      const previousBoard = board;
      queryClient.setQueryData(['board', boardId], updatedBoard);

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

  return (
    <DragDropContext
      onDragEnd={({ destination, source, draggableId }) => {
        if (!destination) {
          return;
        }

        if (destination.index === source.index) {
          return;
        }

        reorderTask({
          taskId: draggableId,
          newPosition: destination.index,
        });
      }}
    >
      <Droppable droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <Box {...provided.droppableProps} ref={provided.innerRef}>
            {sortedTasks.map((task, index) => (
              <Draggable key={task._id} index={index} draggableId={task._id}>
                {(provided, snapshot) => (
                  <Box
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                    className={cx(classes.item, {
                      [classes.itemDragging]: snapshot.isDragging,
                    })}
                    bg={isDarkColorScheme ? theme.colors['dark-gray'][0] : theme.colors.white[0]}
                  >
                    <Box {...provided.dragHandleProps} className={classes.dragHandle}>
                      <GripVerticalIcon w={20} h={20} />
                    </Box>
                    <Title order={6} fw={500} className={classes.taskTitle}>
                      {task.title}
                    </Title>
                  </Box>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </DragDropContext>
  );
}
