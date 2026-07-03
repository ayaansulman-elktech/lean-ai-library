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
