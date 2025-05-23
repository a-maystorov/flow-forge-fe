import { useUser } from '@/features/auth/hooks';
import { useCreateBatchColumns } from '@/features/columns/hooks';
import {
  Box,
  Button,
  Flex,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useCreateBoard } from '../../hooks';

const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, 'Column name is required'),
      })
    )
    .optional()
    .default([]),
});

type FormValues = z.infer<typeof createBoardSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardModal({ isOpen, onClose }: Props) {
  const { createBoard, isCreatingBoard } = useCreateBoard();
  const { createBatchColumns, isCreatingBatchColumns } = useCreateBatchColumns();
  const { user } = useUser();

  const isUnregisteredUser = user && !user.email;

  const form = useForm({
    initialValues: {
      name: '',
      columns: [],
    },
    validate: zodResolver(createBoardSchema),
  });

  const handleSubmit = async (values: FormValues) => {
    const columnNames = (values.columns ?? []).map((column) => column.name);

    createBoard(values.name, {
      onSuccess: (newBoard) => {
        if (columnNames.length > 0) {
          createBatchColumns(
            { boardId: newBoard._id, columnNames },
            {
              onSuccess: () => {
                onClose();
                form.reset();
              },
            }
          );
        } else {
          onClose();
          form.reset();
        }
      },
    });
  };

  const addColumn = () => {
    if (isUnregisteredUser && form.values.columns.length >= 3) {
      return;
    }

    form.insertListItem('columns', { name: '' });
  };

  const removeColumn = (index: number) => {
    form.removeListItem('columns', index);
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Create New Board" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Board Name"
            placeholder="Enter board name"
            {...form.getInputProps('name')}
            data-autofocus
          />

          <Stack gap="xs">
            <Text size="sm" fw={500} hidden={form.values.columns.length === 0}>
              Board Columns
            </Text>
            <Stack gap="xs">
              {form.values.columns.map((_, index) => (
                <Group key={index} wrap="nowrap" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <TextInput
                      placeholder="e.g. To Do, In Progress, Done"
                      {...form.getInputProps(`columns.${index}.name`)}
                    />
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

              {isUnregisteredUser && form.values.columns.length >= 3 ? (
                <Tooltip
                  label="Unregistered users are limited to 3 columns. Register to create more."
                  position="top"
                >
                  <Button
                    variant="light"
                    fullWidth
                    onClick={addColumn}
                    disabled={true}
                    style={{ cursor: 'not-allowed' }}
                  >
                    <Group gap={4} align="center">
                      <Text component="span" size="md" style={{ top: 1 }}>
                        +
                      </Text>
                      <Title order={3}>Add New Column</Title>
                    </Group>
                  </Button>
                </Tooltip>
              ) : (
                <Button variant="light" fullWidth onClick={addColumn}>
                  <Group gap={4} align="center">
                    <Text component="span" size="md" style={{ top: 1 }}>
                      +
                    </Text>
                    <Title order={3}>Add New Column</Title>
                  </Group>
                </Button>
              )}
            </Stack>
          </Stack>

          <Flex mt="md" gap="lg">
            <Button variant="outline" onClick={onClose} type="button" fullWidth>
              Cancel
            </Button>
            <Button type="submit" loading={isCreatingBoard || isCreatingBatchColumns} fullWidth>
              Create New Board
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  );
}
