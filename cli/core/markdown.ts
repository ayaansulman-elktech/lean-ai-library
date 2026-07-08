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
  let descriptionLines: string[] = [];
  let descriptionBlocks = 0;

  for (const token of tokens) {
    if (!title && token.type === 'heading' && token.depth === 1) {
      title = token.text;
      continue;
    }

    // If we've already found a title and we hit another heading, stop gathering description
    if (title && token.type === 'heading') {
      break;
    }

    if (token.type === 'paragraph') {
      descriptionLines.push(token.text.replace(/\n/g, ' ').trim());
      descriptionBlocks++;
    } else if (token.type === 'list') {
      // Collect list items
      const items = token.items.map((item: any) => `- ${item.text.replace(/\n/g, ' ').trim()}`);
      descriptionLines.push(items.join(' '));
      descriptionBlocks++;
    }

    if (descriptionBlocks >= 3) {
      break;
    }
  }

  const description = descriptionLines.length > 0 ? descriptionLines.join(' ') : undefined;

  return { title, description };
}
