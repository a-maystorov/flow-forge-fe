import { SendIcon } from '@/assets/icons/SendIcon';
import { useSocket } from '@/features/chat/context';
import {
  ActionIcon,
  Box,
  Flex,
  TextInput,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

interface ChatInputProps {
  disabled?: boolean;
}

export function ChatInput({ disabled }: ChatInputProps) {
  const theme = useMantineTheme();
  const { sendMessage: socketSendMessage, activeChatId } = useSocket();
  const [isSending, setIsSending] = useState(false);

  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  const form = useForm({
    initialValues: {
      message: '',
    },
    validate: {
      message: (value) => (value.trim() ? null : 'Cannot send empty message'),
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (!activeChatId) return;

    setIsSending(true);
    try {
      socketSendMessage(values.message);
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      p="md"
      style={{
        borderTop: `1px solid ${
          isDarkColorScheme ? theme.colors['lines-dark'][0] : theme.colors['lines-light'][0]
        }`,
        position: 'relative',
        zIndex: 10, // Ensure chat input is above other elements
        marginBottom: '8px', // Add some space at bottom to avoid overlay
      }}
    >
      <Flex gap="sm">
        <TextInput
          placeholder="Type your message..."
          flex={1}
          {...form.getInputProps('message')}
          disabled={disabled || !activeChatId || isSending}
        />
        <ActionIcon
          type="submit"
          variant="filled"
          color={theme.colors['main-purple'][0]}
          disabled={disabled || !activeChatId || isSending || !form.values.message.trim()}
          loading={isSending}
        >
          <SendIcon />
        </ActionIcon>
      </Flex>
    </Box>
  );
}
