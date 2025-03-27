import { RichTextContent } from '@/features/tasks/components/rich-text-content/RichTextContent';
import Subtask from '@/models/Subtask';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { TaskActionMenu } from '@/shared/components/task-action-menu';
import { sanitizerConfig } from '@/shared/constants/html';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect } from 'react';
import { useUpdateSubtask } from '../../hooks';

interface FormValues {
  title: string;
  description: string;
  completed: boolean;
  isEditing: boolean;
}

interface Props {
  subtask: Subtask;
  boardId: string;
  columnId: string;
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (subtaskId: string) => void;
}

export function SubtaskDetailsModal({
  subtask,
  boardId,
  columnId,
  taskId,
  isOpen,
  onClose,
  onDelete,
}: Props) {
  const theme = useMantineTheme();
  const { updateSubtask, isUpdatingSubtask } = useUpdateSubtask(boardId, columnId, taskId);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      completed: false,
      isEditing: false,
    },
  });

  // Update form values when subtask data changes or becomes available
  useEffect(() => {
    if (subtask) {
      const sanitizedDescription = DOMPurify.sanitize(subtask.description || '', sanitizerConfig);
      form.setValues({
        title: subtask.title,
        description: sanitizedDescription,
        completed: subtask.completed,
        isEditing: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtask]); // Deliberately omitting form from dependencies to prevent infinite updates

  const startEditing = useCallback(() => {
    form.setFieldValue('isEditing', true);
  }, [form]);

  const cancelEditing = useCallback(() => {
    if (subtask) {
      form.setValues({
        title: subtask.title,
        description: subtask.description || '',
        completed: subtask.completed,
        isEditing: false,
      });
    }
  }, [form, subtask]);

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
      if (!subtask) return;

      const originalValues = {
        title: subtask.title,
        description: subtask.description || '',
        completed: subtask.completed,
        isEditing: true,
      };

      const finalDescription = DOMPurify.sanitize(values.description, sanitizerConfig);

      updateSubtask(
        {
          subtaskId: subtask._id,
          title: values.title,
          description: finalDescription,
          completed: values.completed,
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
    },
    [form, subtask, updateSubtask]
  );

  const handleStatusToggle = useCallback(() => {
    const newStatus = !form.values.completed;

    // Only ask for confirmation when marking as completed
    if (newStatus) {
      if (window.confirm('Are you sure you want to mark this subtask as completed?')) {
        form.setFieldValue('completed', newStatus);
        updateSubtask({
          subtaskId: subtask._id,
          title: form.values.title,
          description: form.values.description,
          completed: newStatus,
        });
      }
    } else {
      // No confirmation needed when marking as incomplete
      form.setFieldValue('completed', newStatus);
      updateSubtask({
        subtaskId: subtask._id,
        title: form.values.title,
        description: form.values.description,
        completed: newStatus,
      });
    }
  }, [form, subtask, updateSubtask]);

  if (!subtask) {
    return null;
  }

  return (
    <Modal.Root
      opened={isOpen}
      onClose={handleCloseAttempt}
      size="xl"
      aria-labelledby="subtask-details-title"
      trapFocus
    >
      <Modal.Overlay />
      <Modal.Content role="dialog" aria-modal="true">
        <Modal.Header>
          <Modal.Title id="subtask-details-title">
            <Text size="lg" fw={600}>
              {form.values.isEditing ? 'Edit Subtask' : 'Subtask Details'}
            </Text>
          </Modal.Title>
          {!form.values.isEditing && (
            <TaskActionMenu
              onEdit={startEditing}
              onDelete={() => {
                if (window.confirm('Are you sure you want to delete this subtask?')) {
                  onDelete?.(subtask._id);
                  onClose();
                }
              }}
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
                  placeholder="Enter a title for this subtask"
                  {...form.getInputProps('title')}
                  aria-label="Subtask title"
                />

                <DescriptionEditor
                  content={form.values.description}
                  onChange={(value) => form.setFieldValue('description', value)}
                  editable={true}
                />

                <Checkbox
                  mt={16}
                  label="Completed"
                  {...form.getInputProps('completed', { type: 'checkbox' })}
                  aria-label="Mark subtask as completed"
                />

                <Group justify="flex-end" mt="md">
                  <Button
                    type="submit"
                    loading={isUpdatingSubtask}
                    disabled={!form.values.title}
                    aria-label="Save subtask changes"
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
                <Group gap="sm" wrap="nowrap" mb="md" align="center">
                  <Checkbox
                    checked={form.values.completed}
                    onChange={handleStatusToggle}
                    aria-label={`Mark subtask ${subtask.title} as ${
                      form.values.completed ? 'incomplete' : 'complete'
                    }`}
                    disabled={isUpdatingSubtask}
                  />
                  <Text
                    fw={600}
                    size="md"
                    style={{
                      textDecoration: form.values.completed ? 'line-through' : 'none',
                      color: form.values.completed ? theme.colors['lines-dark'][0] : undefined,
                    }}
                  >
                    {subtask.title}
                  </Text>
                </Group>

                {form.values.description && (
                  <Box mb="md">
                    <Text fw={500} size="md" mb="xs">
                      Description
                    </Text>
                    <RichTextContent html={form.values.description} />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
