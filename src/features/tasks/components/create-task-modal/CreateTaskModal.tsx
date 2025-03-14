import { DescriptionEditor } from '@/shared/components/description-editor';
import { Box, Button, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateTask } from '../../hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  columnId: string;
  boardId: string;
}

interface FormValues {
  title: string;
  description: string;
}

export function CreateTaskModal({ isOpen, onClose, columnId, boardId }: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      description: '',
    },
    validate: {
      title: (value) => (!value ? 'Title is required' : null),
    },
  });

  const { createTask, isCreatingTask } = useCreateTask(boardId, columnId);

  const handleSubmit = (values: FormValues) => {
    createTask(values, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Add New Task" size="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="e.g. Take coffee break"
            required
            {...form.getInputProps('title')}
          />

          <Box>
            <Text fw={500} size="md">
              Description
            </Text>

            <DescriptionEditor
              content={form.values.description}
              onChange={(content) => form.setFieldValue('description', content)}
            />
          </Box>

          <Button type="submit" fullWidth loading={isCreatingTask}>
            Create Task
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
