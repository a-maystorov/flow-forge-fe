import { Box, Button, Flex, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useCreateSubtask } from '../../hooks';
import { DescriptionEditor } from '@/shared/components/description-editor';
import DOMPurify from 'dompurify';
import { sanitizerConfig } from '@/shared/constants/html';

const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
});

type FormValues = z.infer<typeof createSubtaskSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columnId: string;
  taskId: string;
  onSuccess?: () => void;
}

export function CreateSubtaskModal({
  isOpen,
  onClose,
  boardId,
  columnId,
  taskId,
  onSuccess,
}: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: zodResolver(createSubtaskSchema),
  });

  const { createSubtask, isCreatingSubtask } = useCreateSubtask(boardId, columnId, taskId);

  const handleSubmit = (values: FormValues) => {
    const sanitizedDescription = DOMPurify.sanitize(values.description, sanitizerConfig);

    createSubtask(
      {
        title: values.title,
        description: sanitizedDescription,
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Modal.Root
      opened={isOpen}
      onClose={onClose}
      size="xl"
      aria-labelledby="create-subtask-title"
      trapFocus
    >
      <Modal.Overlay />
      <Modal.Content role="dialog" aria-modal="true">
        <Modal.Header>
          <Modal.Title id="create-subtask-title">Add New Subtask</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="e.g. Research competitors"
                {...form.getInputProps('title')}
                autoFocus
                aria-required="true"
              />

              <Box>
                <Text fw={500} size="md" id="subtask-description-label">
                  Description
                </Text>

                <DescriptionEditor
                  content={form.values.description}
                  onChange={(content) => form.setFieldValue('description', content)}
                  aria-labelledby="subtask-description-label"
                />
              </Box>

              <Flex mt="md" gap="lg">
                <Button variant="outline" onClick={onClose} type="button" fullWidth>
                  Cancel
                </Button>
                <Button type="submit" loading={isCreatingSubtask} fullWidth>
                  Create Subtask
                </Button>
              </Flex>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
