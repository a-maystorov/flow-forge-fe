import Task from '@/models/Task';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { TaskActionMenu } from '@/shared/components/task-action-menu';
import { sanitizerConfig } from '@/shared/constants/html';
import { Box, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useEffect } from 'react';
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
      const sanitizedDescription = task.description
        ? DOMPurify.sanitize(task.description, sanitizerConfig)
        : '';
      form.setValues({
        title: task.title,
        description: sanitizedDescription,
        isEditing: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]); // Deliberately omitting form from dependencies to prevent infinite updates

  const startEditing = () => {
    form.setFieldValue('isEditing', true);
  };

  const cancelEditing = () => {
    form.setFieldValue('isEditing', false);
  };

  const handleSubmit = form.onSubmit((values) => {
    let finalDescription = values.description;
    if (values.isEditing) {
      finalDescription = DOMPurify.sanitize(values.description, sanitizerConfig);
    }

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
  });

  const handleDeleteTask = () => {
    deleteTask(task._id);
    onClose();
  };

  return (
    <Modal.Root opened={isOpen} onClose={onClose} size="xl">
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Task Details</Modal.Title>
          <TaskActionMenu onEdit={startEditing} onDelete={handleDeleteTask} />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <Box>
                <Group justify="space-between" align="flex-start">
                  {form.values.isEditing ? (
                    <>
                      <TextInput
                        label="Title"
                        placeholder="Task title"
                        required
                        {...form.getInputProps('title')}
                        autoFocus
                        style={{ flexGrow: 1 }}
                      />
                    </>
                  ) : (
                    <>
                      <Box>
                        <Text size="sm" fw={500} c="dimmed">
                          Title
                        </Text>
                        <Text size="lg" fw={700}>
                          {form.values.title}
                        </Text>
                      </Box>
                    </>
                  )}
                </Group>
              </Box>

              <Box>
                <Text size="sm" fw={500} c="dimmed">
                  Description
                </Text>

                {form.values.isEditing ? (
                  <DescriptionEditor
                    content={form.values.description}
                    onChange={(content) => form.setFieldValue('description', content)}
                  />
                ) : (
                  <Box>
                    <RichTextContent html={form.values.description} />
                  </Box>
                )}
              </Box>

              {form.values.isEditing && (
                <Group justify="flex-end" mt="md">
                  <Button onClick={cancelEditing} variant="subtle" color="gray">
                    Cancel
                  </Button>

                  <Button type="submit" loading={isUpdatingTask}>
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
