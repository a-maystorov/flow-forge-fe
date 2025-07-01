import { sanitizerConfig } from '@/shared/constants/html';
import DOMPurify from 'dompurify';
import styles from './RichTextContent.module.css';

interface Props {
  html: string;
  onClick?: () => void;
}

export function RichTextContent({ html, onClick }: Props) {
  const sanitizedHtml = DOMPurify.sanitize(html, sanitizerConfig);

  return (
    <span
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      onClick={onClick}
      className={`${styles.container} ${onClick ? '' : styles.readOnly}`}
    />
  );
}
