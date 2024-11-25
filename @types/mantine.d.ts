import { MantineColorsTuple, DefaultMantineColor } from '@mantine/core';

type ExtendedCustomColors =
  | 'black'
  | 'very-dark-gray'
  | 'dark-gray'
  | 'lines-dark'
  | 'medium-gray'
  | 'lines-light'
  | 'light-gray'
  | 'white'
  | 'main-purple'
  | 'main-purple-hover'
  | 'red'
  | 'red-hover'
  | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>;
  }
}
