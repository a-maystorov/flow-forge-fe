import { Flex, Title } from '@mantine/core';
import TestAuthService from '../components/TestAuthService';

export default function Home() {
  return (
    <Flex align="center" justify="center" direction="column" gap="lg" h="100vh" w="100%">
      <Title order={1}>Home</Title>
      <TestAuthService />
    </Flex>
  );
}
