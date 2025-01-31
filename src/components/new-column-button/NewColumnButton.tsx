import { Button, Title, useMantineColorScheme } from '@mantine/core';
import classes from './NewColumnButton.module.css';

interface Props {
  onClick?: () => void;
}
export default function NewColumnButton({ onClick }: Props) {
  const { colorScheme } = useMantineColorScheme({ keepTransitions: true });
  const isDarkColorScheme = colorScheme === 'dark';

  return (
    <Button
      variant="default"
      className={classes.button}
      data-dark={isDarkColorScheme || undefined}
      data-light={!isDarkColorScheme || undefined}
      onClick={onClick}
    >
      <Title order={1} fw={600} className={classes.title}>
        + New Column
      </Title>
    </Button>
  );
}
