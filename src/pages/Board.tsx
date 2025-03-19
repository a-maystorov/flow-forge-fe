import { BoardColumns, EmptyBoard } from '@/features/boards/components';
import { useBoard, useBoards } from '@/features/boards/hooks';
import { CreateColumnModal } from '@/features/columns/components';
import { CreateTaskModal } from '@/features/tasks/components/create-task-modal';
import { TaskDetailsModal } from '@/features/tasks/components/task-details-modal';
import { useMoveTask, useReorderTask } from '@/features/tasks/hooks';
import Task from '@/models/Task';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useDisclosure } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Home } from '../pages';
import NotFound from './not-found/NotFound';

export default function Board() {
  const { boardId } = useParams();

  const { boards = [] } = useBoards();
  const { board, isFetchingBoard } = useBoard(boardId);
  const { reorderTask } = useReorderTask(boardId);
  const { moveTask } = useMoveTask(boardId);

  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [taskDetailsOpened, taskDetailsHandlers] = useDisclosure(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const handleOpenCreateColumnModal = useCallback(() => {
    setIsCreateColumnModalOpen(true);
  }, []);

  const handleCloseCreateColumnModal = useCallback(() => {
    setIsCreateColumnModalOpen(false);
  }, []);

  const handleAddTask = useCallback((columnId: string) => {
    setSelectedColumnId(columnId);
  }, []);

  const handleCloseTaskModal = useCallback(() => {
    setSelectedColumnId(null);
  }, []);

  const handleTaskClick = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      taskDetailsHandlers.open();
    },
    [taskDetailsHandlers]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source, draggableId } = result;

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
    },
    [moveTask, reorderTask]
  );

  if (!boardId) {
    return <NotFound />;
  }

  if (!hasBoards) {
    return <Home />;
  }

  if (!board || isFetchingBoard) {
    return null;
  }

  if (board.columns.length === 0) {
    return <EmptyBoard boardId={boardId} />;
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <BoardColumns
        board={board}
        onAddTask={handleAddTask}
        onTaskClick={handleTaskClick}
        onCreateColumn={handleOpenCreateColumnModal}
      />

      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={handleCloseCreateColumnModal}
        boardId={boardId}
      />

      <CreateTaskModal
        isOpen={selectedColumnId !== null}
        onClose={handleCloseTaskModal}
        columnId={selectedColumnId ?? ''}
        boardId={boardId}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={taskDetailsOpened}
          onClose={taskDetailsHandlers.close}
          task={selectedTask}
          boardId={boardId}
          columnId={selectedTask.columnId}
        />
      )}
    </DragDropContext>
  );
}
