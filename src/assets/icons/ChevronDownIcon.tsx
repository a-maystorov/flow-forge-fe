import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  w?: number;
  h?: number;
  c?: string;
}

export default function ChevronDownIcon({ w = 24, h = 24, c, ...props }: Props) {
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
}
