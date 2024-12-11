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
import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { UserSignupPayload } from '../models/User';
import UserService from '../services/UserService';

const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default function Signup() {
  const { refetch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    validate: zodResolver(signupSchema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: UserSignupPayload) => UserService.register(values),
    onSuccess: async () => {
      await refetch();
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('Signup failed: ', error);
      form.setFieldError('password', error.message);
    },
  });

  const handleSubmit = (values: UserSignupPayload) => {
    mutate(values);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center">Welcome!</Title>

      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Already have an account?{' '}
        <Anchor size="sm" component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="Your username"
              withAsterisk
              {...form.getInputProps('username')}
            />

            <TextInput
              label="Email"
              placeholder="you@flowforge.dev"
              withAsterisk
              {...form.getInputProps('email')}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              withAsterisk
              {...form.getInputProps('password')}
            />
          </Stack>

          <Button fullWidth mt="xl" type="submit" loading={isPending} disabled={isPending}>
            Sign up
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
