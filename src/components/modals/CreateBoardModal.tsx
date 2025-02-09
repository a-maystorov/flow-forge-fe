import { useAuth } from '@features/auth/hooks';
import { Box, Button, Group, Modal, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import BoardService from '../../services/BoardService';
import ColumnService from '../../services/ColumnService';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, 'Column name is required'),
      })
    )
    .default([]),
});

type FormValues = z.infer<typeof createBoardSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateBoardModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm({
    initialValues: {
      name: '',
      columns: [],
    },
    validate: zodResolver(createBoardSchema),
  });

  const { mutateAsync: createBoard, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const board = await BoardService.createBoard({ name: values.name });
      return board;
    },
    onSuccess: () => {
      form.reset();
    },
    onError: (error) => {
      console.error('Failed to create board:', error);
      form.setFieldError('name', error instanceof Error ? error.message : 'Failed to create board');
    },
  });

  const { mutateAsync: createColumns } = useMutation({
    mutationFn: async ({ boardId, columnNames }: { boardId: string; columnNames: string[] }) => {
      await ColumnService.createBatchColumns(boardId, columnNames);
    },
    onError: (error) => {
      console.error('Failed to create columns:', error);
      form.setFieldError(
        'columns',
        error instanceof Error ? error.message : 'Failed to create columns'
      );
    },
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      const board = await createBoard(values);
      if (values.columns?.length) {
        await createColumns({
          boardId: board._id,
          columnNames: values.columns.map((c) => c.name),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['boards'] });
      onClose();
      navigate(`/boards/${board._id}`);
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const addColumn = () => {
    form.insertListItem('columns', { name: '' });
  };

  const removeColumn = (index: number) => {
    form.removeListItem('columns', index);
  };

  return (
    <Modal.Root opened={isOpen} onClose={onClose} size={480} centered p="xl">
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header p="md">
          <Modal.Title fw={500} fz="h2">
            Add New Board
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body p="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Board Name
                </Text>
                <TextInput placeholder="e.g. Web Design" {...form.getInputProps('name')} />
              </Stack>

              <Stack gap="xs">
                <Text size="sm" fw={500} hidden={form.values.columns.length === 0}>
                  Board Columns
                </Text>
                <Stack gap="xs">
                  {form.values.columns.map((_, index) => (
                    <Group key={index} wrap="nowrap" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <TextInput {...form.getInputProps(`columns.${index}.name`)} />
                      </Box>

                      <Button
                        variant="subtle"
                        color="gray"
                        onClick={() => removeColumn(index)}
                        px="xs"
                        style={{ marginTop: 1 }}
                      >
                        X
                      </Button>
                    </Group>
                  ))}

                  <Tooltip
                    label="Guest users are limited to 3 columns"
                    position="bottom"
                    disabled={!user?.isGuest || form.values.columns.length < 3}
                  >
                    <Button
                      variant="light"
                      fullWidth
                      onClick={addColumn}
                      disabled={user?.isGuest && form.values.columns.length >= 3}
                    >
                      <Group gap={4} align="center">
                        <Text component="span" size="md" style={{ top: 1 }}>
                          +
                        </Text>
                        <Title order={3}>Add New Column</Title>
                      </Group>
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>

              <Button type="submit" loading={isPending} fullWidth>
                Create New Board
              </Button>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
