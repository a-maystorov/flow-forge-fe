import { useConvertTempAccount } from '@/features/auth/hooks';
import { SignupCredentials } from '@/features/auth/types';
import { Button, Modal, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';

interface ConvertAccountModalProps {
  opened: boolean;
  onClose: () => void;
}

const convertAccountSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function ConvertAccountModal({ opened, onClose }: ConvertAccountModalProps) {
  const { convertAccount, isLoading, error } = useConvertTempAccount();

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: zodResolver(convertAccountSchema),
  });

  const handleSubmit = (values: SignupCredentials) => {
    convertAccount(values, {
      onSuccess: () => {
        onClose();
        form.reset();
      },
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Register Your Account" centered size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Title order={3} ta="center">
            Keep your boards forever
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Register your account to prevent it from expiring and keep all your boards and data.
          </Text>

          <TextInput
            label="Username"
            placeholder="Your username"
            required
            {...form.getInputProps('username')}
          />

          <TextInput
            label="Email"
            placeholder="you@example.com"
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            {...form.getInputProps('password')}
          />

          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your password"
            required
            {...form.getInputProps('confirmPassword')}
          />

          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}

          <Button type="submit" fullWidth mt="md" loading={isLoading}>
            Register Account
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
