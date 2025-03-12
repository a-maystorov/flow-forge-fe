import Task from '@/models/Task';
import { Box, Modal, Stack, Text, Title } from '@mantine/core';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskDetailsModal({ isOpen, onClose, task }: Props) {
  if (!task) {
    return null;
  }

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<Title order={3}>Task Details</Title>}
      size="xl"
      centered
    >
      <Stack gap="md">
        <Box>
          <Title order={4}>Title</Title>
          <Text>{task.title}</Text>
        </Box>
        <Box>
          <Title order={4}>Description</Title>
          <Text>{task.description || 'No description'}</Text>
        </Box>
        {/* Additional task details can be added here as they become available */}
      </Stack>
    </Modal>
  );
}
