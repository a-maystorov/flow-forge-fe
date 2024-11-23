import { MantineColorsTuple, DefaultMantineColor } from '@mantine/core';

type ExtendedCustomColors = 'deepBlue' | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
