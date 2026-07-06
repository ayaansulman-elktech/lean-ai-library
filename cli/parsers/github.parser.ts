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

    // Map to specific categories based on path
    if (pathStr.startsWith('agents') || pathStr.includes('/skills') || pathStr.includes('/agent-core') || pathStr.includes('/memory')) {
      category = 'skills-library';
      type = 'agent';
    } else if (pathStr.startsWith('apps') || pathStr.includes('/ai-farm')) {
      category = 'ai-farm';
      type = 'application';
    } else if (pathStr.startsWith('pipelines') || pathStr.startsWith('scripts') || pathStr.startsWith('design-system') || pathStr.startsWith('_templates') || pathStr.includes('/code') || pathStr.includes('/render')) {
      category = 'code-library';
      type = 'library';
    } else if (pathStr.startsWith('reports') || pathStr.includes('/knowledge') || pathStr.includes('/rag')) {
      category = 'corpus-knowledge';
      type = 'library';
    } else if (pathStr.includes('/models') || pathStr.includes('/ml-core')) {
      category = 'model-library';
      type = 'model';
    } else if (pathStr.includes('/mcp')) {
      category = 'mcp-library';
      type = 'library';
    } else {
      // Fallback
      category = 'code-library';
      type = 'library';
    }

    return {
      id,
      category,
      type,
      githubPath: relativePath
    };
  }
}
