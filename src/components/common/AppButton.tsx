import { Button, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';

export default function AppButton() {
  const [count, setCount] = useState(0);
  const theme = useMantineTheme();

  return (
    <Button bg={theme.colors.deepBlue[5]} onClick={() => setCount((prev) => prev + 1)}>
      <Title order={1}>Count: {count}</Title>
    </Button>
  );
}
