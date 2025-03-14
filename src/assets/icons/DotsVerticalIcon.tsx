import { useMantineTheme } from '@mantine/core';

export default function DotsVerticalIcon() {
  const theme = useMantineTheme();
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 5 20" fill="none">
      <circle cx="2.30769" cy="2.30769" r="2.30769" fill={theme.colors['medium-gray'][0]} />
      <circle cx="2.30769" cy="9.99995" r="2.30769" fill={theme.colors['medium-gray'][0]} />
      <circle cx="2.30769" cy="17.6923" r="2.30769" fill={theme.colors['medium-gray'][0]} />
    </svg>
  );
}
