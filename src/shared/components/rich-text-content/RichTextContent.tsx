import { sanitizerConfig } from '@/shared/constants/html';
import { Box } from '@mantine/core';
import DOMPurify from 'dompurify';
import styles from './RichTextContent.module.css';

interface Props {
  html: string;
  onClick?: () => void;
}

export function RichTextContent({ html, onClick }: Props) {
  const sanitizedHtml = DOMPurify.sanitize(html, sanitizerConfig);

  return (
    <Box
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      onClick={onClick}
      className={`${styles.container} ${onClick ? '' : styles.readOnly}`}
    />
  );
}
