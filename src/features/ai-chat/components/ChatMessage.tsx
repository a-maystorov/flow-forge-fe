import RobotIcon from '@/assets/icons/RobotIcon';
import UserIcon from '@/assets/icons/UserIcon';
import { ChatMessage as ChatMessageType } from '@/models/ChatMessage';
import { Avatar, Box, Card, Group, Text } from '@mantine/core';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(message.content);
  }, [message.content]);

  return (
    <Box my="xs" style={{ alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
      <Card
        padding="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: isUser ? 'var(--mantine-color-blue-9)' : 'var(--mantine-color-dark-6)',
        }}
      >
        <Group gap="xs" mb="xs">
          <Avatar size="sm" color={isUser ? 'blue' : 'gray'} radius="xl">
            {isUser ? <UserIcon w={18} h={18} /> : <RobotIcon w={18} h={18} />}
          </Avatar>
          <Text size="sm" fw={500} c={isUser ? 'white' : undefined}>
            {isUser ? 'You' : 'Assistant'}
          </Text>
          <Text size="xs" c={isUser ? 'white' : 'dimmed'}>
            {message.createdAt
              ? formatDistanceToNow(new Date(message.createdAt)) + ' ago'
              : 'Just now'}
          </Text>
        </Group>

        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          className="rich-text-content"
          style={{
            color: isUser ? 'white' : undefined,
            wordBreak: 'break-word',
          }}
        />
      </Card>
    </Box>
  );
}
