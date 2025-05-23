import { useBoard } from '@/features/boards/hooks/useBoard';
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
  Text,
  TextInput,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useCallback, useEffect } from 'react';
import { useUpdateSubtask } from '../../hooks';
import { getSubtaskFromBoard } from '../../selectors/subtaskSelectors';

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
  const { board } = useBoard(boardId);

  const latestSubtask = getSubtaskFromBoard(board, taskId, subtask?._id) || subtask;

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      completed: false,
      isEditing: false,
    },
  });

  useEffect(() => {
    if (latestSubtask) {
      const sanitizedDescription = DOMPurify.sanitize(
        latestSubtask.description || '',
        sanitizerConfig
      );
      form.setValues({
        title: latestSubtask.title,
        description: sanitizedDescription,
        completed: latestSubtask.completed,
        isEditing: form.values.isEditing, // Preserve editing state
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestSubtask]); // Use latestSubtask instead of subtask to catch updates

  const startEditing = useCallback(() => {
    form.setFieldValue('isEditing', true);
    form.resetDirty();
  }, [form]);

  const cancelEditing = useCallback(() => {
    if (latestSubtask) {
      form.setValues({
        title: latestSubtask.title,
        description: latestSubtask.description || '',
        completed: latestSubtask.completed,
        isEditing: false,
      });
    }
  }, [form, latestSubtask]);

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
      if (!latestSubtask) return;

      const originalValues = {
        title: latestSubtask.title,
        description: latestSubtask.description || '',
        completed: latestSubtask.completed,
        isEditing: true,
      };

      const finalDescription = DOMPurify.sanitize(values.description, sanitizerConfig);

      updateSubtask(
        {
          subtaskId: latestSubtask._id,
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
    [form, latestSubtask, updateSubtask]
  );

  const handleStatusToggle = useCallback(() => {
    const newStatus = !form.values.completed;

    // Only ask for confirmation when marking as completed
    if (newStatus) {
      if (window.confirm('Are you sure you want to mark this subtask as completed?')) {
        form.setFieldValue('completed', newStatus);
        updateSubtask({
          subtaskId: latestSubtask._id,
          title: form.values.title,
          description: form.values.description,
          completed: newStatus,
        });
      }
    } else {
      // No confirmation needed when marking as incomplete
      form.setFieldValue('completed', newStatus);
      updateSubtask({
        subtaskId: latestSubtask._id,
        title: form.values.title,
        description: form.values.description,
        completed: newStatus,
      });
    }
  }, [form, latestSubtask, updateSubtask]);

  if (!latestSubtask) {
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
                  onDelete?.(latestSubtask._id);
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
                    aria-label={`Mark subtask ${latestSubtask.title} as ${
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
                    {latestSubtask.title}
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
