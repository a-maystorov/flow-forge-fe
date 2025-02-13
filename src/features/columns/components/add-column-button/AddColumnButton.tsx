import { Button, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import classes from './AddColumnButton.module.css';

interface Props {
  onClick: () => void;
}

export function AddColumnButton({ onClick }: Props) {
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDarkColorScheme = colorScheme === 'dark';

  return (
    <Button
      variant="default"
      className={classes.button}
      data-dark={isDarkColorScheme || undefined}
      data-light={!isDarkColorScheme || undefined}
      onClick={onClick}
      leftSection={<IconPlus size={16} className={classes.icon} />}
    >
      <Text fz={theme.fontSizes.xl} fw={600} className={classes.text}>
        New Column
      </Text>
    </Button>
  );
}
