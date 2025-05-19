import { Button, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import classes from './AddColumnButton.module.css';

interface Props {
  onClick: () => void;
}

export function AddColumnButton({ onClick }: Props) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';

  return (
    <Button
      variant="default"
      className={classes.button}
      data-dark={isDarkColorScheme || undefined}
      data-light={!isDarkColorScheme || undefined}
      onClick={onClick}
      style={{ flexShrink: 0 }}
    >
      <Text fz={theme.fontSizes.xl} fw={600} className={classes.text}>
        + Add Column
      </Text>
    </Button>
  );
}
