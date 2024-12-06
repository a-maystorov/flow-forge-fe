import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

export default function Login() {
  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome!</Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" href="/signup">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack gap="md">
          <TextInput label="Username" placeholder="Your username" required />
          <TextInput label="Email" placeholder="you@flowforge.dev" required />
          <PasswordInput label="Password" placeholder="Your password" required />
        </Stack>
        <Button fullWidth mt="xl">
          Sign up
        </Button>
      </Paper>
    </Container>
  );
}
