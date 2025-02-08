import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function DeleteBoardModal({ opened, onClose, onConfirm, loading }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Board" centered>
      <Stack>
        <Text size="sm">
          Are you sure you want to delete this board? This action cannot be undone.
        </Text>

        <Group justify="flex-end" mt="lg">
          <Button variant="light" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            Delete Board
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
