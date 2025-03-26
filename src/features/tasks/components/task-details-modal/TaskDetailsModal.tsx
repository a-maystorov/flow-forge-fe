import { DescriptionEditor } from '@/shared/components/description-editor';
import { TaskActionMenu } from '@/shared/components/task-action-menu';
import { sanitizerConfig } from '@/shared/constants/html';
import { notifyUser } from '@/utils/notificationUtils';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useState } from 'react';
import { useDeleteTask, useTaskFromBoard, useUpdateTask } from '../../hooks';
// TODO: move to shared
import { CreateSubtaskModal } from '@/features/subtasks/components';
import { useUpdateSubtask } from '@/features/subtasks/hooks/useUpdateSubtask';
import { RichTextContent } from '../rich-text-content/RichTextContent';

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
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      isEditing: false,
    },
  });

  // Update form values when task data changes or becomes available
  useEffect(() => {
    if (task) {
      const sanitizedDescription = DOMPurify.sanitize(task.description || '', sanitizerConfig);
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
  }, [form]);

  const cancelEditing = useCallback(() => {
    if (task) {
      form.setValues({
        title: task.title,
        description: task.description || '',
        isEditing: false,
      });
    }
  }, [form, task]);

  const handleCloseAttempt = useCallback(() => {
    if (form.values.isEditing) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        cancelEditing();
        onClose();
      }
    } else {
      onClose();
    }
  }, [form.values.isEditing, cancelEditing, onClose]);

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
    (subtaskId: string, completed: boolean) => {
      if (!task) return;

      const subtaskToUpdate = task.subtasks.find((s) => s._id === subtaskId);
      if (!subtaskToUpdate) return;

      updateSubtask({
        subtaskId,
        title: subtaskToUpdate.title,
        description: subtaskToUpdate.description || '',
        completed,
      });
    },
    [task, updateSubtask]
  );

  if (!task && !isFetchingTask) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleCloseAttempt}
      title={
        <Text size="lg" fw={600}>
          {form.values.isEditing ? 'Edit Task' : 'Task Details'}
        </Text>
      }
      size="xl"
      aria-labelledby="task-details-title"
      trapFocus
    >
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
            <Group justify="space-between" mb="xs">
              <Text fw={600} size="md">
                {task?.title}
              </Text>
              <TaskActionMenu
                onEdit={startEditing}
                onDelete={() => {
                  deleteTask(taskId, {
                    onSuccess: () => {
                      onClose();
                    },
                  });
                }}
                additionalActions={[
                  {
                    label: 'Add Subtask',
                    onClick: () => setOpenSubtaskModal(true),
                  },
                ]}
              />
            </Group>

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
                            color: subtask.completed ? theme.colors['lines-dark'][0] : undefined,
                          }}
                        >
                          {subtask.title}
                        </Text>
                      </Group>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          notifyUser.info(
                            'Coming Soon',
                            'Subtask details modal will be implemented next'
                          );
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
                <RichTextContent html={task.description} />
              </Box>
            )}
          </>
        )}
      </Box>

      <CreateSubtaskModal
        isOpen={openSubtaskModal}
        onClose={() => setOpenSubtaskModal(false)}
        boardId={boardId}
        columnId={columnId}
        taskId={taskId}
      />
    </Modal>
  );
}
