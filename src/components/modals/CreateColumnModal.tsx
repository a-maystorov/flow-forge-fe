import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ColumnService from '../../services/ColumnService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

interface FormValues {
  name: string;
}

export default function CreateColumnModal({ isOpen, onClose, boardId }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => (!value ? 'Name is required' : null),
    },
  });

  const { mutate: createColumn, isPending } = useMutation({
    mutationFn: (values: FormValues) => ColumnService.createColumn(boardId, values.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
      form.reset();
      onClose();
    },
  });

  const handleSubmit = (values: FormValues) => {
    createColumn(values);
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create New Column" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Name"
          placeholder="Enter column name"
          required
          {...form.getInputProps('name')}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" loading={isPending}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
