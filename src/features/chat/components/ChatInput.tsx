import { SendIcon } from '@/assets/icons/SendIcon';
import { useSocket } from '@/features/chat/context';
import {
  ActionIcon,
  Box,
  Flex,
  Textarea,
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (form.values.message.trim()) {
        handleSubmit();
      }
    }
  };

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
        zIndex: 10,
        marginBottom: '8px',
      }}
    >
      <Flex gap="sm">
        <Textarea
          placeholder="Type your message..."
          flex={1}
          autosize
          minRows={1}
          maxRows={4}
          {...form.getInputProps('message')}
          disabled={disabled || !activeChatId || isSending}
          onKeyDown={handleKeyDown}
          styles={{
            input: {
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
            },
          }}
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
