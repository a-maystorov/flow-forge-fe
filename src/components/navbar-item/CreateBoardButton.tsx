import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SplitBoardIcon from '../../assets/icons/SplitBoardIcon';
import CreateBoardModal from '../modals/CreateBoardModal';

export default function CreateBoardButton() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button
        variant="subtle"
        leftSection={<SplitBoardIcon h={16} w={16} />}
        onClick={open}
        fullWidth
      >
        Create New Board
      </Button>
      <CreateBoardModal isOpen={opened} onClose={close} />
    </>
  );
}
