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
import { RichTextContent } from '@/features/tasks/components/rich-text-content/RichTextContent';
import Subtask from '@/models/Subtask';

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
    if (!subtask) return;

    const newCompletedStatus = !form.values.completed;

    updateSubtask(
      {
        subtaskId: subtask._id,
        title: form.values.title,
        description: form.values.description,
        completed: newCompletedStatus,
      },
      {
        onSuccess: () => {
          form.setFieldValue('completed', newCompletedStatus);
        },
      }
    );
  }, [form, subtask, updateSubtask]);

  if (!subtask) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={handleCloseAttempt}
      title={
        <Text size="lg" fw={600}>
          {form.values.isEditing ? 'Edit Subtask' : 'Subtask Details'}
        </Text>
      }
      size="xl"
      aria-labelledby="subtask-details-title"
      trapFocus
    >
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
            <Group justify="space-between" mb="xs" align="center">
              <Group gap="sm" wrap="nowrap">
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
              <TaskActionMenu
                onEdit={startEditing}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this subtask?')) {
                    onDelete?.(subtask._id);
                    onClose();
                  }
                }}
              />
            </Group>

            {form.values.description && (
              <Box mb="md" mt="lg">
                <Text fw={500} size="md" mb="xs">
                  Description
                </Text>
                <RichTextContent html={form.values.description} />
              </Box>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
}
