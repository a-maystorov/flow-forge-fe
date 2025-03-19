import { useBoard, useBoards } from '@/features/boards/hooks';
import {
  AddColumnButton,
  CreateColumnButton,
  CreateColumnModal,
} from '@/features/columns/components';
import { AddTaskButton } from '@/features/tasks/components/add-task-button';
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal';
import { TaskDetailsModal } from '@/features/tasks/components/task-details-modal';
import { useMoveTask, useReorderTask } from '@/features/tasks/hooks';
import Task from '@/models/Task';
import { DragDropContext } from '@hello-pangea/dnd';
import { Flex, Stack, Text, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndListHandle } from '../components/dnd-list-handle/DndListHandle';
import { Home } from '../pages';

export default function Board() {
  const { boardId } = useParams();
  const theme = useMantineTheme();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [taskDetailsOpened, taskDetailsHandlers] = useDisclosure(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { boards = [] } = useBoards();
  const { board, isFetchingBoard } = useBoard(boardId ?? '');
  const { reorderTask } = useReorderTask(boardId ?? '');
  const { moveTask } = useMoveTask(boardId ?? '');

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
        [...tasks].sort((a, b) => a.position - b.position)
      );
    });

    return taskMap;
  }, [board]);

  const hasBoards = Boolean(boards.length);
  const boardTitle = useMemo(() => {
    if (board?.name && hasBoards) {
      return `${board.name} | Flow Forge`;
    }
    return 'Flow Forge';
  }, [board?.name, hasBoards]);

  useEffect(() => {
    document.title = boardTitle;
  }, [boardTitle]);

  if (!hasBoards) {
    return <Home />;
  }

  if (!board || isFetchingBoard) {
    return null;
  }

  if (board.columns.length === 0) {
    return (
      <Flex align="center" justify="center" h="100%">
        <Stack align="center" gap="lg">
          <Text c={theme.colors['medium-gray'][0]} fz="h2" fw={600} ta="center">
            This board is empty. Create a new column to get started.
          </Text>

          <CreateColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />

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
                <DndListHandle
                  tasks={columnTasks}
                  columnId={column._id}
                  onTaskClick={(task) => {
                    setSelectedTask(task);
                    taskDetailsHandlers.open();
                  }}
                />
              </Stack>
            </Stack>
          );
        })}
        <AddColumnButton onClick={() => setIsCreateColumnModalOpen(true)} />
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

      {selectedTask && (
        <TaskDetailsModal
          isOpen={taskDetailsOpened}
          onClose={taskDetailsHandlers.close}
          task={selectedTask}
          boardId={boardId ?? ''}
          columnId={selectedTask.columnId}
        />
      )}
    </DragDropContext>
  );
}
