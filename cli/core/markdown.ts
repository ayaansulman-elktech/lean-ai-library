import { marked } from 'marked';
import GithubSlugger from 'github-slugger';
import { TocEntry } from '../../src/lib/types/asset';

export function extractToc(markdown?: string): TocEntry[] {
  if (!markdown) return [];
  
  const slugger = new GithubSlugger();
  const tokens = marked.lexer(markdown);
  const toc: TocEntry[] = [];

  tokens.forEach(token => {
    if (token.type === 'heading') {
      // Only include h1, h2, h3
      if (token.depth <= 3) {
        toc.push({
          depth: token.depth,
          title: token.text,
          slug: slugger.slug(token.text)
        });
      }
    }
  });

  return toc;
}

export function extractMetadataFromMarkdown(markdown?: string): { title?: string; description?: string } {
  if (!markdown) return {};
  
  const tokens = marked.lexer(markdown);
  let title: string | undefined;
  let description: string | undefined;

  for (const token of tokens) {
    if (!title && token.type === 'heading' && token.depth === 1) {
      title = token.text;
    }
    if (!description && token.type === 'paragraph') {
      description = token.text.replace(/\n/g, ' ').trim();
    }
    if (title && description) break;
  }

  return { title, description };
}
