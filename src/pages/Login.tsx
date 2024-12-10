import { Button, Container, Paper, PasswordInput, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to the previous page or home
  const from = location.state.from.pathname || '/';

  // Form setup with zod validation
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: zodResolver(loginSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { email: string; password: string }) => {
      await login(values.email, values.password);
    },
    onSuccess: () => {
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      form.setFieldError('password', 'Invalid email or password');
    },
  });

  const handleSubmit = (values: { email: string; password: string }) => {
    mutate(values);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome back!</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            withAsterisk
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            withAsterisk
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth mt="xl" type="submit" loading={isPending}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
