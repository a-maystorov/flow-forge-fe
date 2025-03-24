import { useCreateBatchSubtasks } from '@/features/subtasks/hooks';
import { DescriptionEditor } from '@/shared/components/description-editor';
import { sanitizerConfig } from '@/shared/constants/html';
import { Box, Button, Flex, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import DOMPurify from 'dompurify';
import { z } from 'zod';
import { useCreateTask } from '../../hooks';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, 'Subtask title is required'),
      })
    )
    .optional()
    .default([]),
});

type FormValues = z.infer<typeof createTaskSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  boardId: string;
}

export function CreateTaskModal({ isOpen, onClose, columnId, boardId }: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
      subtasks: [],
    },
    validate: zodResolver(createTaskSchema),
  });

  const { createTask, isCreatingTask } = useCreateTask(boardId, columnId);
  const { createBatchSubtasks, isCreatingBatchSubtasks } = useCreateBatchSubtasks();

  const handleSubmit = (values: FormValues) => {
    const sanitizedDescription = DOMPurify.sanitize(values.description, sanitizerConfig);

    createTask(
      { title: values.title, description: sanitizedDescription },
      {
        onSuccess: (newTask) => {
          if (values.subtasks.length > 0) {
            const subtaskTitles = values.subtasks.map((subtask) => subtask.title);
            createBatchSubtasks(
              {
                boardId,
                columnId,
                taskId: newTask._id,
                subtaskTitles,
              },
              {
                onSuccess: () => {
                  form.reset();
                  onClose();
                },
              }
            );
          } else {
            form.reset();
            onClose();
          }
        },
      }
    );
  };

  const addSubtask = () => {
    form.insertListItem('subtasks', { title: '' });
  };

  const removeSubtask = (index: number) => {
    form.removeListItem('subtasks', index);
  };

  return (
    <Modal.Root
      opened={isOpen}
      onClose={onClose}
      size="xl"
      aria-labelledby="create-task-title"
      trapFocus
    >
      <Modal.Overlay />
      <Modal.Content role="dialog" aria-modal="true">
        <Modal.Header>
          <Modal.Title id="create-task-title">Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="e.g. Take coffee break"
                {...form.getInputProps('title')}
                autoFocus
                aria-required="true"
              />

              <Box>
                <Text fw={500} size="md" id="task-description-label">
                  Description
                </Text>

                <DescriptionEditor
                  content={form.values.description}
                  onChange={(content) => form.setFieldValue('description', content)}
                  aria-labelledby="task-description-label"
                />
              </Box>

              <Stack gap="xs">
                <Text size="sm" fw={500} hidden={form.values.subtasks.length === 0}>
                  Subtasks
                </Text>
                <Stack gap="xs">
                  {form.values.subtasks.map((_, index) => (
                    <Group key={index} wrap="nowrap" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <TextInput
                          placeholder="e.g. Make coffee, Add sugar"
                          {...form.getInputProps(`subtasks.${index}.title`)}
                        />
                      </Box>

                      <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => removeSubtask(index)}
                        px="xs"
                        style={{ marginTop: 1 }}
                        title="Remove subtask"
                      >
                        X
                      </Button>
                    </Group>
                  ))}

                  <Button variant="light" fullWidth onClick={addSubtask}>
                    <Group gap={4} align="center">
                      <Text component="span" size="md" style={{ top: 1 }}>
                        +
                      </Text>
                      <Title order={3}>Add New Subtask</Title>
                    </Group>
                  </Button>
                </Stack>
              </Stack>

              <Flex mt="md" gap="lg">
                <Button variant="outline" onClick={onClose} type="button" fullWidth>
                  Cancel
                </Button>
                <Button type="submit" loading={isCreatingTask || isCreatingBatchSubtasks} fullWidth>
                  Create Task
                </Button>
              </Flex>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
