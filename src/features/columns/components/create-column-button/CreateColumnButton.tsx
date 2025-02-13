import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import classes from './CreateColumnButton.module.css';

interface Props {
  onClick: () => void;
}

export function CreateColumnButton({ onClick }: Props) {
  return (
    <Button
      leftSection={<IconPlus size={16} />}
      onClick={onClick}
      radius="lg"
      className={classes.button}
    >
      Create Column
    </Button>
  );
}
