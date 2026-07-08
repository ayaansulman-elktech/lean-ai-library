import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';
import { extractMetadataFromMarkdown } from '../core/markdown';

export class ReadmeParser implements Parser {
  name = 'readme';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const readmePath = path.join(ctx.assetDir, 'README.md');
    // Also check for readme.md (case insensitive in some cases, but sticking to standard for now)
    if (!fs.existsSync(readmePath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(readmePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);
      
      const partial: Partial<Asset> = {
        readme: markdownContent,
      };

      const extracted = extractMetadataFromMarkdown(markdownContent);

      partial.name = data.name || extracted.title;
      partial.description = data.description || extracted.description;
      if (data.shortDescription) partial.shortDescription = data.shortDescription;
      if (data.category) partial.category = data.category;
      
      return partial;
    } catch (error) {
      console.warn(`Failed to parse README.md in ${ctx.assetDir}`, error);
      return {};
    }
  }
}
