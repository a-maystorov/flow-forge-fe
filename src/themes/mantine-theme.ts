import { colorsTuple, createTheme, DEFAULT_THEME, mergeMantineTheme, rem } from '@mantine/core';

const overrides = createTheme({
  cursorType: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  primaryColor: 'main-purple',
  colors: {
    black: colorsTuple('#000112'),
    'very-dark-gray': colorsTuple('#20212C'),
    'dark-gray': colorsTuple('#2B2C37'),
    'lines-dark': colorsTuple('#3E3F4E'),
    'medium-gray': colorsTuple('#828FA3'),
    'lines-light': colorsTuple('#E4EBFA'),
    'light-gray': colorsTuple('#F4F7FD'),
    white: colorsTuple('#FFFFFF'),
    'main-purple': colorsTuple('#635FC7'),
    'main-purple-hover': colorsTuple('#A8A4FF'),
    red: colorsTuple('#EA5555'),
    'red-hover': colorsTuple('#FF9898'),
  },
  headings: {
    // fallback
    fontFamily: `Plus Jakarta Sans, sans-serif, ${DEFAULT_THEME.fontFamily}`,
    sizes: {
      h1: { fontSize: rem(24), lineHeight: rem(30) }, // XL
      h2: { fontSize: rem(18), lineHeight: rem(23) }, // L
      h3: { fontSize: rem(15), lineHeight: rem(19) }, // M
      h4: { fontSize: rem(12), lineHeight: rem(15) }, // S
    },
    fontWeight: 'bold', // 700
  },
  radius: {
    lg: rem(20),
    xl: rem(24),
  },
  spacing: {
    '2lg': rem(24),
  },
});

const theme = mergeMantineTheme(DEFAULT_THEME, overrides);

export default theme;
