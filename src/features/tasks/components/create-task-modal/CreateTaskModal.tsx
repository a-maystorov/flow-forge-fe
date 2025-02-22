import { Button, Modal, Stack, TextInput, Textarea } from '@mantine/core';
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
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Add New Task"
      centered
      styles={{
        title: {
          fontWeight: 600,
          fontSize: '18px',
        },
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Title"
            placeholder="e.g. Take coffee break"
            required
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Description"
            placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
            minRows={3}
            {...form.getInputProps('description')}
          />

          <Button type="submit" fullWidth loading={isCreatingTask}>
            Create Task
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
