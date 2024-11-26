import { useMantineTheme } from '@mantine/core';

interface Props {
  w: number;
  h: number;
  title: string;
}

export default function KanbanLogo({ w, h, title }: Props) {
  const theme = useMantineTheme();
  const primaryColor = theme.colors['main-purple'][0];

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 25"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <title>{title}</title>
      <rect width="6" height="25" rx="2" fill={primaryColor} />
      <rect opacity="0.75" x="9" width="6" height="25" rx="2" fill={primaryColor} />
      <rect opacity="0.5" x="18" width="6" height="25" rx="2" fill={primaryColor} />
    </svg>
  );
}
