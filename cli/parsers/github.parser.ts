import path from 'path';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class GithubParser implements Parser {
  name = 'github';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    // Relative path from the repository root
    const relativePath = path.relative(ctx.repoDir, ctx.assetDir).replace(/\\/g, '/');
    
    const parts = relativePath.split('/');
    let category = 'other';
    let id = parts[parts.length - 1];
    let type: Asset['type'] = 'other';

    const pathStr = relativePath.toLowerCase();

    // Extract category dynamically from the new Isomorphic structure: libraries/<category>/blocks/<id>
    if (parts[0] === 'libraries' && parts.length >= 3) {
      category = parts[1]; // e.g., 'agents', 'ios-ready', 'models'
      // Assign types based on some simple heuristics or default to library
      if (category === 'agents') type = 'agent';
      else if (category === 'models') type = 'model';
      else if (category === 'ios-ready' || category === 'ai-farm') type = 'application';
      else type = 'library';
    } else {
      // Fallback for root-level stuff if they still exist
      if (pathStr.includes('agent')) {
        category = 'agents';
        type = 'agent';
      } else {
        category = 'code-library';
        type = 'library';
      }
    }

    return {
      id,
      category,
      type,
      githubPath: relativePath
    };
  }
}
