import Task from '@/models/Task';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { sanitizerConfig } from '@/shared/constants/html';
import { Box, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import { useUpdateTask } from '../../hooks';
import { RichTextContent } from '../rich-text-content/RichTextContent';

interface FormValues {
  title: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  boardId: string;
  columnId: string;
}

export function TaskDetailsModal({ isOpen, onClose, task, boardId, columnId }: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) => (value.trim() ? null : 'Title is required'),
    },
  });

  const { updateTask, isUpdatingTask } = useUpdateTask(boardId, columnId, task?._id || '');

  useEffect(() => {
    if (task) {
      form.setValues({
        title: task.title,
        description: task.description || '',
      });
      setEditingTitle(false);
      setEditingDescription(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]); // Deliberately omitting form from dependencies to prevent infinite updates

  if (!task) {
    return null;
  }

  const handleSubmit = form.onSubmit((values) => {
    let finalDescription = values.description;
    if (editingDescription) {
      finalDescription = DOMPurify.sanitize(values.description, sanitizerConfig);
    }

    updateTask(
      {
        title: values.title,
        description: finalDescription,
      },
      {
        onSuccess: () => {
          setEditingTitle(false);
          setEditingDescription(false);
        },
      }
    );
  });

  // Use form values for display instead of task prop directly
  // This ensures we see updates immediately after saving
  const displayTitle = form.values.title || task.title;

  // Always use form values for display - they get initialized from task in useEffect
  // This ensures we don't lose content when toggling edit mode
  const displayDescription = form.values.description || task.description || '';

  return (
    <Modal opened={isOpen} onClose={onClose} title="Task Details" size="xl">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {editingTitle ? (
            <TextInput
              label="Title"
              placeholder="Task title"
              required
              {...form.getInputProps('title')}
              autoFocus
            />
          ) : (
            <Box onClick={() => setEditingTitle(true)} style={{ cursor: 'pointer' }}>
              <Text size="sm" fw={500} c="dimmed">
                Title
              </Text>
              <Text size="lg" fw={700}>
                {displayTitle}
              </Text>
            </Box>
          )}

          <Box>
            <Text size="sm" fw={500} c="dimmed">
              Description
            </Text>

            {editingDescription ? (
              <DescriptionEditor
                content={form.values.description}
                onChange={(content) => form.setFieldValue('description', content)}
              />
            ) : (
              <Box onClick={() => setEditingDescription(true)} style={{ cursor: 'pointer' }}>
                <RichTextContent html={displayDescription} />
              </Box>
            )}
          </Box>

          {(editingTitle || editingDescription) && (
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => {
                  form.reset();
                  setEditingTitle(false);
                  setEditingDescription(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isUpdatingTask}>
                Save Changes
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Modal>
  );
}
