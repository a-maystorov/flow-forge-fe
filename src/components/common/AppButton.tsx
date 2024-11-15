import { Button } from "@mantine/core";
import { useState } from "react";

export default function AppButton() {
  const [count, setCount] = useState(0);

  return (
    <Button bg="red.5" onClick={() => setCount((prev) => prev + 1)}>
      Count: {count}
    </Button>
  );
}
