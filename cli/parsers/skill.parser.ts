import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';
import { extractMetadataFromMarkdown } from '../core/markdown';

export class SkillParser implements Parser {
  name = 'skill';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const skillPath = path.join(ctx.assetDir, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(skillPath, 'utf-8');
      const { data, content: markdownContent } = matter(content);
      
      const partial: Partial<Asset> = {
        skill: markdownContent,
      };

      const extracted = extractMetadataFromMarkdown(markdownContent);

      partial.name = data.name || extracted.title;
      partial.description = data.description || extracted.description;
      if (data.category) partial.category = data.category;
      
      // If shortDescription isn't there, we can guess it later or use description
      if (!data.shortDescription && partial.description) {
        partial.shortDescription = partial.description.split('\n')[0].slice(0, 150);
      }

      return partial;
    } catch (error) {
      console.warn(`Failed to parse SKILL.md in ${ctx.assetDir}`, error);
      return {};
    }
  }
}
