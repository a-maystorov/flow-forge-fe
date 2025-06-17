import { useSocket } from '@/features/chat/context/SocketContext';
import { notifyUser } from '@/utils/notificationUtils';
import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

interface CreateChatModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateChatModal({ opened, onClose }: CreateChatModalProps) {
  const { createChat, isLoading } = useSocket();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      title: '',
    },
    validate: {
      title: (value) => (value.trim() ? null : 'Title is required'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    setError(null);
    try {
      // Create chat via socket
      createChat(values.title);

      // Show success notification
      notifyUser.success('Chat created', 'New chat has been created');

      // Reset form and close modal
      form.reset();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create chat';
      setError(errorMessage);
      notifyUser.error('Chat creation failed', errorMessage);
    }
  });

  const handleClose = () => {
    form.reset();
    setError(null);
    onClose();
  };

  return (
    <Modal title="Create New Chat" opened={opened} onClose={handleClose} size="sm">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Chat Title"
          placeholder="Enter chat title"
          required
          error={error}
          {...form.getInputProps('title')}
          data-autofocus
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Create
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
