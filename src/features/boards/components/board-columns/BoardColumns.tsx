import { DndListHandle } from '@/components/dnd-list-handle/DndListHandle';
import { AddColumnButton } from '@/features/columns/components';
import { AddTaskButton } from '@/features/tasks/components/add-task-button';
import Board from '@/models/Board';
import Task from '@/models/Task';
import { Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';

interface BoardColumnsProps {
  board: Board;
  onAddTask: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
  onCreateColumn: () => void;
}

export function BoardColumns({ board, onAddTask, onTaskClick, onCreateColumn }: BoardColumnsProps) {
  const theme = useMantineTheme();

  const columnTasksMap = useMemo(() => {
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
        [...tasks].sort((a, b) => a.position - b.position)
      );
    });

    return taskMap;
  }, [board]);

  return (
    <Flex align="flex-start" h="100%" gap={theme.spacing['2lg']}>
      {board.columns.map((column) => {
        const columnTasks = columnTasksMap.get(column._id) || [];

        return (
          <Stack key={column._id} w={300}>
            <Text fw={600} size="lg">
              {column.name}
            </Text>
            <AddTaskButton onClick={() => onAddTask(column._id)} />
            <Stack gap="xs">
              <DndListHandle columnId={column._id} onTaskClick={onTaskClick} tasks={columnTasks} />
            </Stack>
          </Stack>
        );
      })}
      <AddColumnButton onClick={onCreateColumn} />
    </Flex>
  );
}
