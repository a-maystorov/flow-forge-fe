import { Button, Container, Divider, Stack, Text, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';

export default function Welcome() {
  const navigate = useNavigate();

  const handleGuestSession = async () => {
    try {
      await authService.createGuestSession();
      navigate('/');
    } catch (error) {
      console.error('Error creating guest session:', error);
    }
  };

  return (
    <Container size="md" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Stack gap="xl" align="center" style={{ width: '100%' }}>
        <Title order={1}>Welcome to FlowForge</Title>
        <Text size="lg" ta="center" c="dimmed">
          🚧 We&apos;re currently in development, making things awesome for you! 🚧
        </Text>
        <Stack gap="md" style={{ width: '100%', maxWidth: 300 }}>
          <Button variant="filled" size="lg" fullWidth onClick={() => navigate('/login')}>
            Login
          </Button>

          <Button variant="light" size="lg" fullWidth onClick={() => navigate('/signup')}>
            Sign Up
          </Button>

          <Divider label="or" labelPosition="center" mt="lg" />

          <Button variant="subtle" size="lg" fullWidth onClick={handleGuestSession}>
            Continue as Guest
          </Button>

          <Text size="sm" c="dimmed" ta="center">
            Guest users are limited and last 7 days. All boards will be deleted after the session
            expires.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
