import Task from '@/models/Task';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { TaskActionMenu } from '@/shared/components/task-action-menu';
import { sanitizerConfig } from '@/shared/constants/html';
import { notifyUser } from '@/utils/notificationUtils';
import { Box, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useRef } from 'react';
import { useDeleteTask, useUpdateTask } from '../../hooks';
import { RichTextContent } from '../rich-text-content/RichTextContent';

interface FormValues {
  title: string;
  description: string;
  isEditing: boolean;
}

interface Props {
  task: Task;
  boardId: string;
  columnId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailsModal({ task, boardId, columnId, isOpen, onClose }: Props) {
  const editingNotificationRef = useRef(false);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      isEditing: false,
    },
    validate: {
      title: (value) => (value.trim() ? null : 'Title is required'),
    },
  });

  const { updateTask, isUpdatingTask } = useUpdateTask(boardId, columnId, task?._id || '');
  const { deleteTask } = useDeleteTask(boardId, columnId);

  useEffect(() => {
    if (task) {
      form.setValues({
        title: task.title,
        description: task.description || '',
        isEditing: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]); // Deliberately omitting form from dependencies to prevent infinite updates

  const startEditing = useCallback(() => {
    form.setFieldValue('isEditing', true);
  }, [form]);

  const cancelEditing = useCallback(() => {
    form.setFieldValue('isEditing', false);
  }, [form]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      form.onSubmit((values) => {
        const finalDescription = values.isEditing
          ? DOMPurify.sanitize(values.description, sanitizerConfig)
          : values.description;

        const originalValues = {
          title: task.title,
          description: task.description || '',
          isEditing: values.isEditing,
        };

        updateTask(
          {
            title: values.title,
            description: finalDescription,
          },
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
      })(event);
    },
    [form, task, updateTask]
  );

  const handleDeleteTask = useCallback(() => {
    deleteTask(task._id);
    onClose();
  }, [deleteTask, onClose, task._id]);

  const handleDescriptionChange = useCallback(
    (content: string) => form.setFieldValue('description', content),
    [form]
  );

  const handleClose = useCallback(() => {
    if (form.values.isEditing) {
      if (!editingNotificationRef.current) {
        editingNotificationRef.current = true;

        notifyUser.warning(
          'Unsaved changes',
          'Please click "Cancel" to exit edit mode before closing this task.'
        );

        setTimeout(() => {
          editingNotificationRef.current = false;
        }, 1000);
      }

      return;
    }

    onClose();
  }, [form.values.isEditing, onClose]);

  return (
    <Modal.Root
      opened={isOpen}
      onClose={handleClose}
      size="xl"
      aria-labelledby="task-details-title"
      trapFocus
    >
      <Modal.Overlay />
      <Modal.Content role="dialog" aria-modal="true">
        <Modal.Header>
          <Modal.Title id="task-details-title">Task Details</Modal.Title>
          <TaskActionMenu onEdit={startEditing} onDelete={handleDeleteTask} />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Box>
                <Group justify="space-between" align="flex-start">
                  {form.values.isEditing ? (
                    <TextInput
                      label="Title"
                      placeholder="Task title"
                      required
                      {...form.getInputProps('title')}
                      autoFocus
                      style={{ flexGrow: 1 }}
                      aria-required="true"
                    />
                  ) : (
                    <Box>
                      <Text size="sm" fw={500} c="dimmed" id="task-title-label">
                        Title
                      </Text>
                      <Text size="lg" fw={700} aria-labelledby="task-title-label">
                        {form.values.title}
                      </Text>
                    </Box>
                  )}
                </Group>
              </Box>

              <Box>
                <Text size="sm" fw={500} c="dimmed" id="task-description-label">
                  Description
                </Text>

                {form.values.isEditing ? (
                  <DescriptionEditor
                    content={form.values.description}
                    onChange={handleDescriptionChange}
                    aria-labelledby="task-description-label"
                  />
                ) : (
                  <Box>
                    <RichTextContent
                      html={form.values.description}
                      aria-labelledby="task-description-label"
                    />
                  </Box>
                )}
              </Box>

              {form.values.isEditing && (
                <Group justify="flex-end" mt="md">
                  <Button
                    onClick={cancelEditing}
                    variant="subtle"
                    color="gray"
                    aria-label="Cancel editing"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    loading={isUpdatingTask}
                    aria-label="Save changes"
                    aria-busy={isUpdatingTask}
                  >
                    Save Changes
                  </Button>
                </Group>
              )}
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
