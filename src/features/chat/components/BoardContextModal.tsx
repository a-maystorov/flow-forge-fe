import CheckIcon from '@/assets/icons/CheckIcon';
import ChevronDownIcon from '@/assets/icons/ChevronDownIcon';
import ChevronRightIcon from '@/assets/icons/ChevronRightIcon';
import CircleDotIcon from '@/assets/icons/CircleDotIcon';
import LayoutColumnsIcon from '@/assets/icons/LayoutColumnsIcon';
import { useBoard } from '@/features/boards/hooks';
import { BoardContext } from '@/models/BoardContext';
import Column from '@/models/Column';
import Subtask from '@/models/Subtask';
import Task from '@/models/Task';
import { RichTextContent } from '@/shared/components/rich-text-content';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';
import { notifyUser } from '@/utils/notificationUtils';
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Modal,
  ScrollArea,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useBoardContextOperations } from '../hooks';
import { chatService } from '../services/ChatService';

// Extended interfaces for comparison objects
interface ComparisonColumn extends Column {
  isNew?: boolean;
  isChanged?: boolean;
  isDeleted?: boolean;
}

interface ComparisonTask extends Task {
  isNew?: boolean;
  isChanged?: boolean;
  isDeleted?: boolean;
}

interface ComparisonSubtask extends Subtask {
  isNew?: boolean;
  isChanged?: boolean;
  isDeleted?: boolean;
}

interface BoardContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardContext?: BoardContext;
  chat: { _id: string; boardId?: string };
}

export function BoardContextModal({ isOpen, onClose, boardContext, chat }: BoardContextModalProps) {
  const { handleBoardContext, isLoading } = useBoardContextOperations();
  const [isAccepting, setIsAccepting] = useState(false);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string | null>('suggestion');
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const { board: currentBoard, isFetchingBoard } = useBoard(chat.boardId);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('suggestion');
    }
  }, [isOpen]);

  if (!boardContext) {
    return null;
  }

  const handleAccept = async () => {
    if (!boardContext) return;

    setIsAccepting(true);
    try {
      const freshChat = await chatService.getChat(chat._id);

      if (freshChat) {
        handleBoardContext(freshChat, boardContext);
        queryClient.invalidateQueries({ queryKey: ['chats', chat._id] });
        onClose();
      }
    } catch (error) {
      console.error('[ERROR] BoardContextModal - Error accepting board context:', error);
      notifyUser.error('Error', 'Failed to accept board');
    } finally {
      setIsAccepting(false);
    }
  };

  // Function to identify what's new or changed in the suggested board compared to current board
  const getChanges = () => {
    if (!currentBoard) return boardContext;

    // Deep clone to avoid modifying the original objects
    const changesContext = JSON.parse(JSON.stringify(boardContext));

    // Process columns
    changesContext.columns = changesContext.columns.map((suggestedColumn: ComparisonColumn) => {
      const typedColumn = suggestedColumn as ComparisonColumn;
      // First try to find by exact name match
      let existingColumn = currentBoard.columns.find(
        (col) => col.name.toLowerCase() === typedColumn.name.toLowerCase()
      );

      // If no match by name, try to find by ID if available
      if (!existingColumn && typedColumn._id) {
        existingColumn = currentBoard.columns.find((col) => col._id === typedColumn._id);

        // If found by ID but names don't match, it's been renamed
        if (
          existingColumn &&
          existingColumn.name.toLowerCase() !== typedColumn.name.toLowerCase()
        ) {
          typedColumn.isChanged = true;
        }
      }

      if (!existingColumn) {
        // New column
        typedColumn.isNew = true;
        return typedColumn;
      }

      // Existing column - check for task changes
      typedColumn.tasks = typedColumn.tasks.map((suggestedTask: ComparisonTask) => {
        const typedTask = suggestedTask as ComparisonTask;
        // Find matching task by title (case insensitive)
        const existingTask = existingColumn?.tasks.find(
          (task) => task.title.toLowerCase() === typedTask.title.toLowerCase()
        );

        if (!existingTask) {
          // New task
          typedTask.isNew = true;
          return typedTask;
        }

        // Check if description is different
        if (typedTask.description !== existingTask.description) {
          typedTask.isChanged = true;
        }

        // Check subtasks
        typedTask.subtasks = typedTask.subtasks.map((suggestedSubtask: ComparisonSubtask) => {
          const typedSubtask = suggestedSubtask as ComparisonSubtask;
          // Find matching subtask by title (case insensitive)
          const existingSubtask = existingTask.subtasks.find(
            (subtask) => subtask.title.toLowerCase() === typedSubtask.title.toLowerCase()
          );

          if (!existingSubtask) {
            // New subtask
            typedSubtask.isNew = true;
          } else if (typedSubtask.description !== existingSubtask.description) {
            // Changed subtask
            typedSubtask.isChanged = true;
          }

          return typedSubtask;
        });

        // Check for deleted subtasks
        const deletedSubtasks = existingTask.subtasks.filter(
          (existingSubtask) =>
            !typedTask.subtasks.some(
              (suggestedSubtask) =>
                suggestedSubtask.title.toLowerCase() === existingSubtask.title.toLowerCase()
            )
        );

        // Add deleted subtasks with isDeleted flag
        deletedSubtasks.forEach((deletedSubtask) => {
          const subtaskToAdd = JSON.parse(JSON.stringify(deletedSubtask)) as ComparisonSubtask;
          subtaskToAdd.isDeleted = true;
          typedTask.subtasks.push(subtaskToAdd);
        });

        return typedTask;
      });

      // Check for deleted tasks
      const deletedTasks = existingColumn?.tasks.filter(
        (existingTask) =>
          !typedColumn.tasks.some(
            (suggestedTask) =>
              suggestedTask.title.toLowerCase() === existingTask.title.toLowerCase()
          )
      );

      // Add deleted tasks with isDeleted flag
      deletedTasks.forEach((deletedTask) => {
        const taskToAdd = JSON.parse(JSON.stringify(deletedTask)) as ComparisonTask;
        taskToAdd.isDeleted = true;
        typedColumn.tasks.push(taskToAdd);
      });

      // Only include tasks that are new or changed
      if (activeTab === 'changes') {
        typedColumn.tasks = typedColumn.tasks.filter(
          (task: ComparisonTask) =>
            task.isNew ||
            task.isChanged ||
            task.isDeleted ||
            task.subtasks.some((st: ComparisonSubtask) => st.isNew || st.isChanged || st.isDeleted)
        );
      }

      return typedColumn;
    });

    // Check for deleted columns
    const deletedColumns = currentBoard.columns.filter(
      (existingColumn) =>
        !changesContext.columns.some(
          (suggestedColumn: ComparisonColumn) =>
            suggestedColumn.name.toLowerCase() === existingColumn.name.toLowerCase()
        )
    );

    // Add deleted columns with isDeleted flag
    deletedColumns.forEach((deletedColumn) => {
      const columnToAdd = JSON.parse(JSON.stringify(deletedColumn)) as ComparisonColumn;
      columnToAdd.isDeleted = true;
      changesContext.columns.push(columnToAdd);
    });

    // In changes view, only show columns that have new/modified/deleted content or are new/deleted themselves
    if (activeTab === 'changes') {
      changesContext.columns = changesContext.columns.filter(
        (col: ComparisonColumn) =>
          col.isNew ||
          col.isDeleted ||
          col.tasks.some(
            (task: ComparisonTask) =>
              task.isNew ||
              task.isChanged ||
              task.isDeleted ||
              task.subtasks.some(
                (subtask: ComparisonSubtask) =>
                  subtask.isNew || subtask.isChanged || subtask.isDeleted
              )
          )
      );
    }

    return changesContext;
  };

  const contextToShow = activeTab === 'suggestion' ? boardContext : getChanges();
  const showChangesTab = !!currentBoard && !isFetchingBoard;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Board Suggestion"
      styles={{ title: { fontWeight: 600 } }}
      size="xl"
      padding="md"
    >
      <Box p="md">
        {showChangesTab && (
          <Tabs value={activeTab} onChange={(value) => setActiveTab(value as string)} mb="lg">
            <Tabs.List>
              <Tabs.Tab value="suggestion">Suggestion</Tabs.Tab>
              <Tabs.Tab value="changes">Changes</Tabs.Tab>
            </Tabs.List>
          </Tabs>
        )}

        <Box mb="lg">
          <Flex align="center" gap="sm" mb="xs">
            <LayoutColumnsIcon w={20} h={20} />
            <Title order={3}>{contextToShow.name}</Title>
          </Flex>
          <Text c="dimmed">{contextToShow.description}</Text>
        </Box>

        <Divider mb="md" />

        <ScrollArea h={400} scrollbarSize={6} type="auto">
          {contextToShow.columns &&
            contextToShow.columns.map((column: ComparisonColumn) => (
              <Box key={column._id} mb="xl">
                <Flex align="center" mb="sm">
                  <Box
                    w={4}
                    h={24}
                    mr={10}
                    bg={
                      column.isNew
                        ? 'green'
                        : column.isChanged
                          ? 'yellow'
                          : column.isDeleted
                            ? 'red'
                            : undefined
                    }
                  />
                  <Title
                    order={4}
                    fw={600}
                    style={{
                      textDecoration: column.isDeleted ? 'line-through' : undefined,
                      color: column.isDeleted ? 'var(--mantine-color-red-8)' : undefined,
                    }}
                  >
                    {column.name}
                  </Title>
                  {column.isNew && (
                    <Badge color="green" variant="light" ml="xs" size="sm">
                      New
                    </Badge>
                  )}
                  {column.isChanged && (
                    <Badge color="yellow" variant="light" ml="xs" size="sm">
                      Modified
                    </Badge>
                  )}
                  {column.isDeleted && (
                    <Badge color="red" variant="light" ml="xs" size="sm">
                      Deleted
                    </Badge>
                  )}
                  {column.tasks.length > 0 && (
                    <Text size="xs" c="dimmed" ml={8}>
                      {column.tasks.length} tasks
                    </Text>
                  )}
                </Flex>

                {column.tasks.length > 0 ? (
                  column.tasks.map((task: ComparisonTask) => (
                    <Box
                      key={task._id}
                      p="md"
                      mb="md"
                      style={{
                        borderLeft: task.isNew
                          ? '2px solid var(--mantine-color-green-7)'
                          : task.isChanged
                            ? '2px solid var(--mantine-color-yellow-7)'
                            : task.isDeleted
                              ? '2px solid var(--mantine-color-red-7)'
                              : undefined,
                        paddingLeft:
                          task.isNew || task.isChanged || task.isDeleted
                            ? 'calc(1rem - 2px)'
                            : undefined,
                        backgroundColor: task.isNew
                          ? 'rgba(0, 128, 0, 0.07)'
                          : task.isChanged
                            ? 'rgba(255, 204, 0, 0.07)'
                            : task.isDeleted
                              ? 'rgba(255, 76, 76, 0.07)'
                              : undefined,
                        borderRadius: '4px',
                      }}
                    >
                      <Flex align="center" gap="xs" mb="xs">
                        <Title
                          order={5}
                          fw={600}
                          style={{
                            textDecoration: task.isDeleted ? 'line-through' : undefined,
                            color: task.isDeleted ? 'var(--mantine-color-red-8)' : undefined,
                          }}
                        >
                          {task.title}
                        </Title>
                        {task.isNew && (
                          <Badge color="green" variant="light" size="sm">
                            New
                          </Badge>
                        )}
                        {task.isChanged && (
                          <Badge color="yellow" variant="light" size="sm">
                            Modified
                          </Badge>
                        )}
                        {task.isDeleted && (
                          <Badge color="red" variant="light" size="sm">
                            Deleted
                          </Badge>
                        )}
                      </Flex>
                      <Text size="sm" mb="md" lineClamp={activeTab === 'changes' ? undefined : 2}>
                        <RichTextContent html={convertMarkdownToHtml(task.description ?? '')} />
                      </Text>

                      {task.subtasks.length > 0 && (
                        <>
                          <Text size="xs" c="dimmed" mb="xs">
                            {task.subtasks.length} subtasks
                          </Text>
                          <Box ml="sm">
                            {task.subtasks.map((subtask: ComparisonSubtask) => (
                              <Box key={subtask._id} mb="xs">
                                <Flex
                                  gap="xs"
                                  align="center"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    const newSet = new Set(expandedSubtasks);
                                    if (newSet.has(subtask._id)) {
                                      newSet.delete(subtask._id);
                                    } else {
                                      newSet.add(subtask._id);
                                    }
                                    setExpandedSubtasks(newSet);
                                  }}
                                  title="Click to expand details"
                                >
                                  <Box
                                    w={16}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {subtask.description ? (
                                      expandedSubtasks.has(subtask._id) ? (
                                        <ChevronDownIcon w={14} h={14} />
                                      ) : (
                                        <ChevronRightIcon w={14} h={14} />
                                      )
                                    ) : null}
                                  </Box>

                                  <CircleDotIcon
                                    w={12}
                                    h={12}
                                    c={
                                      subtask.isNew
                                        ? 'var(--mantine-color-green-7)'
                                        : subtask.isChanged
                                          ? 'var(--mantine-color-yellow-7)'
                                          : subtask.isDeleted
                                            ? 'var(--mantine-color-red-7)'
                                            : undefined
                                    }
                                  />
                                  <Text
                                    size="sm"
                                    fw={
                                      subtask.isNew || subtask.isChanged || subtask.isDeleted
                                        ? 500
                                        : undefined
                                    }
                                    style={{
                                      textDecoration: subtask.isDeleted
                                        ? 'line-through'
                                        : undefined,
                                      color: subtask.isDeleted
                                        ? 'var(--mantine-color-red-8)'
                                        : undefined,
                                    }}
                                  >
                                    {subtask.title}
                                    {subtask.isNew && (
                                      <Badge color="green" variant="filled" size="xs" ml="xs">
                                        New
                                      </Badge>
                                    )}
                                    {subtask.isChanged && (
                                      <Badge color="yellow" variant="filled" size="xs" ml="xs">
                                        Modified
                                      </Badge>
                                    )}
                                    {subtask.isDeleted && (
                                      <Badge color="red" variant="filled" size="xs" ml="xs">
                                        Deleted
                                      </Badge>
                                    )}
                                  </Text>
                                </Flex>
                                {/* Show description if expanded */}
                                {expandedSubtasks.has(subtask._id) && subtask.description && (
                                  <Box
                                    ml={28}
                                    mt={5}
                                    pl={10}
                                    style={{
                                      borderLeft: subtask.isNew
                                        ? '1px solid var(--mantine-color-green-7)'
                                        : subtask.isChanged
                                          ? '1px solid var(--mantine-color-yellow-7)'
                                          : subtask.isDeleted
                                            ? '1px solid var(--mantine-color-red-7)'
                                            : '1px solid var(--mantine-color-gray-4)',
                                      backgroundColor: 'rgba(0,0,0,0.02)',
                                      borderRadius: '0 0 4px 0',
                                      padding: '8px 10px',
                                    }}
                                  >
                                    <RichTextContent
                                      html={convertMarkdownToHtml(subtask.description)}
                                    />
                                  </Box>
                                )}
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  ))
                ) : (
                  <Text c="dimmed" fs="italic" size="sm">
                    No tasks in this column
                  </Text>
                )}
              </Box>
            ))}

          {activeTab === 'changes' && contextToShow.columns.length === 0 && (
            <Flex direction="column" align="center" justify="center" h={200}>
              <Text size="lg" fw={500} mb="xs">
                No Changes Detected
              </Text>
              <Text c="dimmed" ta="center">
                The suggested board matches the current board structure.
              </Text>
            </Flex>
          )}
        </ScrollArea>

        <Divider my="md" />

        <Flex justify="flex-end" gap="md">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            leftSection={<CheckIcon w={16} h={16} />}
            onClick={handleAccept}
            loading={isLoading || isAccepting}
          >
            Accept
          </Button>
        </Flex>
      </Box>
    </Modal>
  );
}
