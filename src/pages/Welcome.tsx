import { useTempSession } from '@features/auth/hooks';
import { Button, Container, Divider, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();
  const { createTempSession, isLoading } = useTempSession();

  return (
    <Container size="md" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Stack gap="xl" align="center" style={{ width: '100%' }}>
        <Title order={1}>Welcome to FlowForge</Title>
        <Text size="lg" ta="center" c="dimmed">
          🚧 Currently in development, making things awesome for you! 🚧
        </Text>
        <Stack gap="md" style={{ width: '100%', maxWidth: 300 }}>
          <Button variant="filled" size="lg" fullWidth onClick={() => navigate('/login')}>
            Login
          </Button>

          <Button variant="light" size="lg" fullWidth onClick={() => navigate('/signup')}>
            Sign Up
          </Button>

          <Divider label="or" labelPosition="center" mt="lg" />

          <Button
            variant="subtle"
            fullWidth
            onClick={() => createTempSession()}
            loading={isLoading}
            disabled={isLoading}
          >
            Continue as Temporary User
          </Button>

          <Text size="sm" c="dimmed" ta="center">
            Temporary accounts expire after 7 days. You need to register to keep your boards.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
