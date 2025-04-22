import { Button, Stack, Box, Text, Loader, Card } from '@mantine/core';
import { useChatSessions, useCreateChatSession } from '../hooks';
import { ChatSession } from '@/models/ChatSession';

interface ChatSessionListProps {
  sessions?: ChatSession[];
  onSessionClick: (sessionId: string) => void;
}

export function ChatSessionList({ sessions, onSessionClick }: ChatSessionListProps) {
  const { isLoading, isError } = useChatSessions();
  const { mutate: createSession } = useCreateChatSession();

  // Create a new session
  const handleNewSession = () => {
    createSession({
      title: `Chat ${(sessions?.length || 0) + 1}`,
    });
  };

  if (isLoading) {
    return (
      <Box py="xl" ta="center">
        <Loader size="sm" />
        <Text size="sm" c="dimmed" mt="xs">
          Loading chat sessions...
        </Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box py="md" ta="center">
        <Text c="dimmed">Failed to load sessions</Text>
        <Text size="xs" c="dimmed" mt="xs">
          The AI Chat backend feature appears to be unavailable. Make sure the backend API is
          properly set up.
        </Text>
        <Text size="xs" c="red" mt="xs">
          Error: 400 Bad Request
        </Text>
      </Box>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Box py="md" ta="center">
        <Text c="dimmed">No chat sessions yet</Text>
        <Button onClick={handleNewSession} variant="light" size="xs" mt="md">
          Start a new chat
        </Button>
      </Box>
    );
  }

  return (
    <Stack gap="xs" p="xs">
      {sessions.map((session) => (
        <Card
          key={session._id}
          shadow="sm"
          p="xs"
          radius="md"
          withBorder
          style={{ cursor: 'pointer' }}
          onClick={() => onSessionClick(session._id)}
        >
          <Text size="sm" fw={500}>
            {session.title || 'Untitled Chat'}
          </Text>
          {/* Date temporarily removed until backend issue is fixed */}
        </Card>
      ))}
    </Stack>
  );
}
