import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import BoardService from '../../services/BoardService';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
});

type FormValues = z.infer<typeof createBoardSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: zodResolver(createBoardSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) => BoardService.createBoard(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to create board:', error);
      form.setFieldError('name', 'Failed to create board');
    },
  });

  const handleSubmit = (values: FormValues) => {
    mutate(values);
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create Board" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Board Name"
            placeholder="Enter board name"
            withAsterisk
            {...form.getInputProps('name')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>

            <Button type="submit" loading={isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
