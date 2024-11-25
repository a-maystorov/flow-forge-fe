import { colorsTuple, createTheme, rem } from '@mantine/core';

const theme = createTheme({
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
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
});

export default theme;
