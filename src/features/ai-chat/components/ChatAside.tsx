import { Box, Button, Divider, Group, Tabs, Title } from '@mantine/core';
import { useState } from 'react';
import { useCreateChatSession, useChatSessions } from '../hooks';
import { ChatSession } from './ChatSession';
import { ChatSessionList } from './ChatSessionList';

export function ChatAside() {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('sessions');

  const { data: sessions } = useChatSessions();
  const { mutate: createSession } = useCreateChatSession();

  // Handle new chat button click
  const handleNewChat = () => {
    createSession({
      title: `Chat ${(sessions?.length || 0) + 1}`,
    });
  };

  // Switch to a chat session
  const handleSessionClick = (sessionId: string) => {
    setActiveSession(sessionId);
    setActiveTab('activeChat');
  };

  // Return to sessions list
  const handleBackToSessions = () => {
    setActiveTab('sessions');
    setActiveSession(null);
  };

  return (
    <Box>
      <Group justify="space-between" p="md">
        <Title order={4}>AI Assistant</Title>
        <Button onClick={handleNewChat} size="xs">
          New Chat
        </Button>
      </Group>
      <Divider mb="md" />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
          {activeSession && <Tabs.Tab value="activeChat">Chat</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel value="sessions">
          <ChatSessionList sessions={sessions || []} onSessionClick={handleSessionClick} />
        </Tabs.Panel>

        <Tabs.Panel value="activeChat">
          {activeSession && (
            <>
              <Button onClick={handleBackToSessions} variant="subtle" size="xs" mb="md">
                Back to Sessions
              </Button>
              <ChatSession sessionId={activeSession} />
            </>
          )}
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
