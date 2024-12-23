import { Group, NavLink, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SplitBoardIcon from '../../assets/icons/SplitBoardIcon';
import CreateBoardModal from '../modals/CreateBoardModal';
import styles from './CreateBoardButton.module.css';

export default function CreateBoardButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <NavLink
        href="#"
        label={
          <Group gap={4} align="center">
            <Text component="span" size="md" style={{ top: 1 }}>
              +
            </Text>
            <Title order={3}>Create New Board</Title>
          </Group>
        }
        leftSection={<SplitBoardIcon h={16} w={16} />}
        onClick={open}
        classNames={styles}
        py="md"
        px={{ base: '2lg', md: 'xl' }}
      />
      <CreateBoardModal isOpen={opened} onClose={close} />
    </>
  );
}
