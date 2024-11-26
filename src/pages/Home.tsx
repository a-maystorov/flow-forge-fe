import { Flex, Title } from '@mantine/core';
import ColorSchemeToggle from '../components/ColorSchemeToggle';

export default function Home() {
  return (
    <Flex align="center" justify="center" direction="column" gap="lg" h="100vh" w="100%">
      <Title order={1}>Home</Title>
      <ColorSchemeToggle />
    </Flex>
  );
}
