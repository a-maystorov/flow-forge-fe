import { Button, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCreateColumn } from '../../hooks';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

interface FormValues {
  name: string;
}

export function CreateColumnModal({ isOpen, onClose, boardId }: Props) {
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
    },
    // TODO: Use zod validation
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
    },
  });

  const { createColumn, isCreatingColumn } = useCreateColumn(boardId);

  const handleSubmit = (values: FormValues) => {
    createColumn(values.name, {
      onSuccess: () => {
        onClose();
        form.reset();
      },
    });
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create Column">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="Name" placeholder="Enter column name" {...form.getInputProps('name')} />
          <Button type="submit" loading={isCreatingColumn}>
            Create Column
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
