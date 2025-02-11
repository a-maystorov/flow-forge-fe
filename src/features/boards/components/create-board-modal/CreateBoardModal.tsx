import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useCreateBoard } from '../../hooks';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
});

type FormValues = z.infer<typeof createBoardSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: Props) {
  const { createBoard, isLoading, error } = useCreateBoard();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: zodResolver(createBoardSchema),
  });

  const handleSubmit = (values: FormValues) => {
    createBoard(values);
    form.reset();
    onClose();
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create New Board" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Board Name"
            placeholder="Enter board name"
            error={error}
            {...form.getInputProps('name')}
            data-autofocus
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create Board
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
