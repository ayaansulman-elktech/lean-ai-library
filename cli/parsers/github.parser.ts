import path from 'path';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class GithubParser implements Parser {
  name = 'github';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    // Relative path from the repository root
    const relativePath = path.relative(ctx.repoDir, ctx.assetDir).replace(/\\/g, '/');
    
    // Guess category from the first folder (e.g., 'agents/security-review' -> 'agents')
    const parts = relativePath.split('/');
    let category = parts.length > 1 ? parts[0] : 'other';
    let id = parts[parts.length - 1];

    // Infer type from category
    let type: Asset['type'] = 'other';
    const catLower = category.toLowerCase();
    if (catLower.includes('agent')) type = 'agent';
    else if (catLower.includes('librar')) type = 'library';
    else if (catLower.includes('model')) type = 'model';
    else if (catLower.includes('app')) type = 'application';
    else if (catLower.includes('pipeline')) type = 'pipeline';

    return {
      id,
      category,
      type,
      githubPath: relativePath
    };
  }
}
