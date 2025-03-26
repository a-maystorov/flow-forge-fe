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

type ModalAction =
  | { type: 'openCreateColumn' }
  | { type: 'closeCreateColumn' }
  | { type: 'addTask'; columnId: string }
  | { type: 'closeTaskModal' }
  | { type: 'openTaskDetails'; task: Task };

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

  const hasBoards = useMemo(() => Boolean(boards.length), [boards.length]);

  const boardTitle = useMemo(() => {
    if (board?.name && hasBoards) {
      return `${board.name} | Flow Forge`;
    }
    return 'Flow Forge';
  }, [board?.name, hasBoards]);

  useEffect(() => {
    document.title = boardTitle;
  }, [boardTitle]);

  const handleModalAction = useCallback(
    (action: ModalAction) => {
      switch (action.type) {
        case 'openCreateColumn':
          setIsCreateColumnModalOpen(true);
          break;
        case 'closeCreateColumn':
          setIsCreateColumnModalOpen(false);
          break;
        case 'addTask':
          setSelectedColumnId(action.columnId);
          break;
        case 'closeTaskModal':
          setSelectedColumnId(null);
          break;
        case 'openTaskDetails':
          setSelectedTask(action.task);
          taskDetailsHandlers.open();
          break;
      }
    },
    [taskDetailsHandlers]
  );

  const columnIds = useMemo(
    () => board?.columns.map((column) => column._id) || [],
    [board?.columns]
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
        // Verify column IDs are valid before moving
        if (columnIds.includes(sourceColId) && columnIds.includes(targetColId)) {
          moveTask({
            sourceColumnId: sourceColId,
            taskId: draggableId,
            targetColumnId: targetColId,
          });
        }
      }
    },
    [moveTask, reorderTask, columnIds]
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
        onAddTask={(columnId) => handleModalAction({ type: 'addTask', columnId })}
        onTaskClick={(task) => handleModalAction({ type: 'openTaskDetails', task })}
        onCreateColumn={() => handleModalAction({ type: 'openCreateColumn' })}
      />

      <CreateColumnModal
        isOpen={isCreateColumnModalOpen}
        onClose={() => handleModalAction({ type: 'closeCreateColumn' })}
        boardId={boardId}
      />

      <CreateTaskModal
        isOpen={selectedColumnId !== null}
        onClose={() => handleModalAction({ type: 'closeTaskModal' })}
        columnId={selectedColumnId ?? ''}
        boardId={boardId}
      />

      {selectedTask && (
        <TaskDetailsModal
          isOpen={taskDetailsOpened}
          onClose={taskDetailsHandlers.close}
          taskId={selectedTask._id}
          boardId={boardId}
          columnId={selectedTask.columnId}
        />
      )}
    </DragDropContext>
  );
}
