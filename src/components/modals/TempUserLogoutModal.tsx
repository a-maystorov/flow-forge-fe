import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface Props {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TempUserLogoutModal({ opened, onClose, onConfirm }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Logout"
      centered
      withCloseButton={false}
    >
      <Stack gap="md">
        <Text>
          Are you sure you want to log out? You&apos;ll be able to continue with the same temporary
          account when you return by clicking &quot;Continue as Temporary User&quot;.
        </Text>

        <Text size="sm" c="dimmed">
          However, remember that temporary accounts eventually expire. To permanently preserve your
          work, convert to a full account using the &quot;Convert to Permanent Account&quot; option
          in the navbar menu (⋮).
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm}>
            Logout
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
