import { Button, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <MantineProvider>
      <Button bg="red.5" onClick={() => setCount((prev) => prev + 1)}>
        Count: {count}
      </Button>
    </MantineProvider>
  );
}

export default App;
