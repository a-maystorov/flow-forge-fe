import { CreateSubtaskModal, SubtaskDetailsModal } from '@/features/subtasks/components';
import { useDeleteSubtask, useUpdateSubtask } from '@/features/subtasks/hooks';
import Subtask from '@/models/Subtask';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { RichTextContent } from '@/shared/components/rich-text-content';
import { TaskActionMenu } from '@/shared/components/task-action-menu';
import { sanitizerConfig } from '@/shared/constants/html';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
  type MantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import { useDeleteTask, useTaskFromBoard, useUpdateTask } from '../../hooks';
import { convertMarkdownToHtml } from '@/utils/markdownUtils';

interface FormValues {
  title: string;
  description: string;
  isEditing: boolean;
}

interface Props {
  taskId: string;
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({ taskId, boardId, columnId, isOpen, onClose }: Props) {
  const theme = useMantineTheme();
  const { task, isFetchingTask } = useTaskFromBoard(boardId, taskId);
  const { updateTask, isUpdatingTask } = useUpdateTask(boardId, columnId, taskId);
  const { deleteTask } = useDeleteTask(boardId, columnId);
  const { updateSubtask, isUpdatingSubtask } = useUpdateSubtask(boardId, columnId, taskId);
  const [openSubtaskModal, setOpenSubtaskModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [isSubtaskDetailsModalOpen, setIsSubtaskDetailsModalOpen] = useState(false);
  const { deleteSubtask } = useDeleteSubtask(boardId, columnId, taskId);
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      isEditing: false,
    },
  });

  useEffect(() => {
    if (task) {
      const htmlContent = convertMarkdownToHtml(task.description || '');
      const sanitizedDescription = DOMPurify.sanitize(htmlContent, sanitizerConfig);
      form.setValues({
        title: task.title,
        description: sanitizedDescription,
        isEditing: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]); // Deliberately omitting form from dependencies to prevent infinite updates

  const startEditing = useCallback(() => {
    form.setFieldValue('isEditing', true);
    form.resetDirty();
  }, [form]);

  const cancelEditing = useCallback(() => {
    if (task) {
      const htmlContent = convertMarkdownToHtml(task.description || '');
      const sanitizedDescription = DOMPurify.sanitize(htmlContent, sanitizerConfig);
      form.setValues({
        title: task.title,
        description: sanitizedDescription,
        isEditing: false,
      });
    }
  }, [form, task]);

  const handleCloseAttempt = useCallback(() => {
    if (!form.values.isEditing) {
      onClose();
      return;
    }

    if (!form.isDirty()) {
      cancelEditing();
      return;
    }

    if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
      cancelEditing();
    }
  }, [form, cancelEditing, onClose]);

  const handleFormSubmit = useCallback(
    (values: FormValues) => {
      if (!task) return;

      const originalValues = {
        title: task.title,
        description: task.description || '',
        isEditing: true,
      };

      const finalDescription = DOMPurify.sanitize(values.description, sanitizerConfig);

      updateTask(
        { title: values.title, description: finalDescription },
        {
          onSuccess: () => {
            form.setValues({
              ...values,
              description: finalDescription,
              isEditing: false,
            });
          },
          onError: () => {
            form.setValues(originalValues);
          },
        }
      );
    },
    [form, task, updateTask]
  );

  const handleSubtaskToggle = useCallback(
    (subtaskId: string, newStatus: boolean) => {
      if (!task) return;

      const subtaskToUpdate = task.subtasks.find((s) => s._id === subtaskId);
      if (!subtaskToUpdate) return;

      // Only ask for confirmation when marking as completed
      if (newStatus) {
        if (window.confirm('Are you sure you want to mark this subtask as completed?')) {
          updateSubtask({
            subtaskId,
            title: subtaskToUpdate.title,
            description: subtaskToUpdate.description || '',
            completed: newStatus,
          });
        }
      } else {
        // No confirmation needed for marking as incomplete
        updateSubtask({
          subtaskId,
          title: subtaskToUpdate.title,
          description: subtaskToUpdate.description || '',
          completed: newStatus,
        });
      }
    },
    [task, updateSubtask]
  );

  const getCompletedTextColor = (isCompleted: boolean, theme: MantineTheme) => {
    return isCompleted ? theme.colors['lines-dark'][0] : undefined;
  };

  if (!task && !isFetchingTask) {
    return null;
  }

  return (
    <Modal.Root
      opened={isOpen}
      onClose={handleCloseAttempt}
      size="xl"
      aria-labelledby="task-details-title"
      trapFocus
    >
      <Modal.Overlay />
      <Modal.Content role="dialog" aria-modal="true">
        <Modal.Header>
          <Modal.Title id="task-details-title">
            <Text size="lg" fw={600}>
              {form.values.isEditing ? 'Edit Task' : 'Task Details'}
            </Text>
          </Modal.Title>
          {!form.values.isEditing && (
            <TaskActionMenu
              onEdit={startEditing}
              onDelete={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete this task? This action cannot be undone.'
                  )
                ) {
                  deleteTask(taskId, {
                    onSuccess: () => {
                      onClose();
                    },
                  });
                }
              }}
              additionalActions={[
                {
                  label: 'Add Subtask',
                  onClick: () => setOpenSubtaskModal(true),
                },
              ]}
            />
          )}
        </Modal.Header>
        <Modal.Body>
          <Box>
            {form.values.isEditing ? (
              <form onSubmit={form.onSubmit(handleFormSubmit)}>
                <TextInput
                  mb={16}
                  required
                  label="Title"
                  placeholder="Enter a title for this task"
                  {...form.getInputProps('title')}
                  aria-label="Task title"
                />

                <DescriptionEditor
                  content={form.values.description}
                  onChange={(value) => form.setFieldValue('description', value)}
                  editable={true}
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    type="submit"
                    loading={isUpdatingTask}
                    disabled={!form.values.title}
                    aria-label="Save task changes"
                  >
                    Save
                  </Button>
                  <Button onClick={cancelEditing} variant="outline" aria-label="Cancel editing">
                    Cancel
                  </Button>
                </Group>
              </form>
            ) : (
              <>
                <Text fw={600} size="md" mb="md">
                  {task?.title}
                </Text>

                <Box mb="md">
                  <Text fw={500} size="md" mb="xs" aria-label="Subtasks">
                    Subtasks
                  </Text>

                  {task?.subtasks && task.subtasks.length > 0 && (
                    <Stack gap="xs">
                      {task.subtasks.map((subtask) => (
                        <Group key={subtask._id} gap="sm" wrap="nowrap" justify="space-between">
                          <Group gap="sm" wrap="nowrap">
                            <Checkbox
                              checked={subtask.completed}
                              onChange={() => handleSubtaskToggle(subtask._id, !subtask.completed)}
                              aria-label={`Mark subtask ${subtask.title} as ${
                                subtask.completed ? 'incomplete' : 'complete'
                              }`}
                              disabled={isUpdatingSubtask}
                            />
                            <Text
                              style={{
                                textDecoration: subtask.completed ? 'line-through' : 'none',
                                color: getCompletedTextColor(subtask.completed, theme),
                              }}
                            >
                              {subtask.title}
                            </Text>
                          </Group>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSelectedSubtask(subtask);
                              setIsSubtaskDetailsModalOpen(true);
                            }}
                          >
                            Details
                          </Button>
                        </Group>
                      ))}
                    </Stack>
                  )}

                  {task?.subtasks && task.subtasks.length === 0 && (
                    <Text c="dimmed" size="sm">
                      No subtasks yet. Add one to track progress.
                    </Text>
                  )}
                </Box>

                {task?.description && (
                  <Box mb="md">
                    <Text fw={500} size="md" mb="xs">
                      Description
                    </Text>
                    <RichTextContent html={convertMarkdownToHtml(task.description)} />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Modal.Body>
      </Modal.Content>

      <CreateSubtaskModal
        isOpen={openSubtaskModal}
        onClose={() => setOpenSubtaskModal(false)}
        boardId={boardId}
        columnId={columnId}
        taskId={taskId}
      />

      {selectedSubtask && (
        <SubtaskDetailsModal
          subtask={selectedSubtask}
          boardId={boardId}
          columnId={columnId}
          taskId={taskId}
          isOpen={isSubtaskDetailsModalOpen}
          onClose={() => {
            setIsSubtaskDetailsModalOpen(false);
            setSelectedSubtask(null);
          }}
          onDelete={(subtaskId) => {
            deleteSubtask(subtaskId, {
              onSuccess: () => {
                setIsSubtaskDetailsModalOpen(false);
                setSelectedSubtask(null);
              },
            });
          }}
        />
      )}
    </Modal.Root>
  );
}
