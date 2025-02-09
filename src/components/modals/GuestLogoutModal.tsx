import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function GuestLogoutModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <Modal opened={isOpen} onClose={onClose} title="Confirm Logout" centered>
      <Stack gap="md">
        <Text>
          Are you sure you want to log out? As a guest user, all your boards and data will be
          permanently deleted.
        </Text>

        <Text size="sm" c="dimmed">
          This action cannot be undone.
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>

          <Button color="red" onClick={onConfirm}>
            Logout & Delete Data
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
