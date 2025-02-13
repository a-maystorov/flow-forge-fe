import { Button } from '@mantine/core';
import classes from './CreateColumnButton.module.css';

interface Props {
  onClick: () => void;
}

export function CreateColumnButton({ onClick }: Props) {
  return (
    <Button onClick={onClick} radius="lg" className={classes.button} fz="md">
      + Create Column
    </Button>
  );
}
