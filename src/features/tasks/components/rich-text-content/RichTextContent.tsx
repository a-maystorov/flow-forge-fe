import { Box } from '@mantine/core';
import DOMPurify from 'dompurify';
import styles from './RichTextContent.module.css';

export const sanitizerConfig = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'hr',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'sub',
    'sup',
    'span',
    'div',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'data-*'],
  ALLOW_DATA_ATTR: true,
};

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
