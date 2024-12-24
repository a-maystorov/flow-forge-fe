import { Button, Stack, Text } from '@mantine/core';

interface Props {
  onClick?: () => void;
}

export default function NewColumnButton({ onClick }: Props) {
  return (
    <Button
      variant="default"
      w={300}
      h="100%"
      mih={200}
      onClick={onClick}
      styles={(theme) => ({
        root: {
          backgroundColor: theme.colors.dark[6],
          border: 'none',
          '&:hover': {
            backgroundColor: theme.colors.dark[5],
          },
        },
      })}
    >
      <Stack align="center" gap={4}>
        <Text size="xl" fw={300}>
          +
        </Text>
        <Text size="sm" c="dimmed">
          New Column
        </Text>
      </Stack>
    </Button>
  );
}
