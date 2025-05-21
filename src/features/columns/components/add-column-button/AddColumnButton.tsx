import { useUser } from '@/features/auth/hooks';
import { Button, Text, Tooltip, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import classes from './AddColumnButton.module.css';

interface Props {
  onClick: () => void;
  columnCount?: number;
}

export function AddColumnButton({ onClick, columnCount = 0 }: Props) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const isDarkColorScheme = colorScheme === 'dark';
  const { user } = useUser();

  const isUnregisteredUser = user && !user.email;
  const hasReachedColumnLimit = isUnregisteredUser && columnCount >= 3;

  const button = (
    <Button
      variant="default"
      className={classes.button}
      data-dark={isDarkColorScheme || undefined}
      data-light={!isDarkColorScheme || undefined}
      onClick={hasReachedColumnLimit ? undefined : onClick}
      style={{ flexShrink: 0, cursor: hasReachedColumnLimit ? 'not-allowed' : 'pointer' }}
      disabled={hasReachedColumnLimit || undefined}
    >
      <Text fz={theme.fontSizes.xl} fw={600} className={classes.text}>
        + Add Column
      </Text>
    </Button>
  );

  return hasReachedColumnLimit ? (
    <Tooltip
      label="Unregistered users are limited to 3 columns. Register to create more."
      position="top"
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
}
