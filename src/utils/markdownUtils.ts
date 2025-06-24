import { marked } from 'marked';

/**
 * Converts markdown to HTML using the synchronous version of marked
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) {
    return '';
  }
  return marked.parse(markdown, { async: false });
}
