import { Button } from '@mantine/core';

interface Props {
  onClick: () => void;
}

export default function AddTaskButton({ onClick }: Props) {
  return (
    <Button variant="filled" onClick={onClick} miw={190}>
      Add New Task
    </Button>
  );
}
