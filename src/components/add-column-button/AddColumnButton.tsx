import { Button, Group, Text, Title } from '@mantine/core';

interface Props {
  onClick?: () => void;
}

export default function AddColumnButton({ onClick }: Props) {
  return (
    <Button size="md" radius="xl" px="lg" onClick={onClick}>
      <Group gap={4} align="center">
        <Text component="span" size="md" style={{ top: 1 }}>
          +
        </Text>
        <Title order={3}>Add New Column</Title>
      </Group>
    </Button>
  );
}
