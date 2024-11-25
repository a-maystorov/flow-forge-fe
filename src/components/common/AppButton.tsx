import { Button, Title } from '@mantine/core';
import { useState } from 'react';

export default function AppButton() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount((prev) => prev + 1)}>
      <Title order={1}>Count: {count}</Title>
    </Button>
  );
}
