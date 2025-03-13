import Task from '@/models/Task';
import { Box, Modal, Stack, Text } from '@mantine/core';
import DOMPurify from 'dompurify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

function RichTextContent({ html }: { html: string }) {
  const sanitizedHtml = DOMPurify.sanitize(html);
  return <Box dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}

export function TaskDetailsModal({ isOpen, onClose, task }: Props) {
  if (!task) {
    return null;
  }

  return (
    <Modal opened={isOpen} onClose={onClose} title="Task Details" size="xl" centered>
      <Stack gap="md">
        <Box>
          <Text fw={700} size="lg">
            Title
          </Text>
          <Text>{task.title}</Text>
        </Box>
        <Box>
          <Text fw={700} size="lg">
            Description
          </Text>
          {task.description ? (
            <RichTextContent html={task.description} />
          ) : (
            <Text>No description</Text>
          )}
        </Box>
      </Stack>
    </Modal>
  );
}
