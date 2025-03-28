import { useMemo } from 'react';
import { MantineTheme } from '@mantine/core';

interface CompletionStyles {
  textDecoration: string;
  color: string | undefined;
}

/**
 * A custom hook to provide consistent styling for completed items.
 * Returns text decoration and color styles based on completion status.
 */
export function useCompletionStyles(isCompleted: boolean, theme: MantineTheme): CompletionStyles {
  return useMemo(
    () => ({
      textDecoration: isCompleted ? 'line-through' : 'none',
      color: isCompleted ? theme.colors['lines-dark'][0] : undefined,
    }),
    [isCompleted, theme]
  );
}
