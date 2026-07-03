import fs from 'fs';
import path from 'path';
import * as toml from 'toml';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class PythonParser implements Parser {
  name = 'python';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    const pyprojectPath = path.join(ctx.assetDir, 'pyproject.toml');
    if (!fs.existsSync(pyprojectPath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(pyprojectPath, 'utf-8');
      const data = toml.parse(content);
      
      const partial: Partial<Asset> = {
        dependencies: []
      };

      const project = data.project || data.tool?.poetry || {};

      if (project.name) partial.name = project.name;
      if (project.description) partial.description = project.description;
      if (project.version) partial.version = project.version;
      
      if (project.dependencies && Array.isArray(project.dependencies)) {
        partial.dependencies?.push(...project.dependencies);
      }

      return partial;
    } catch (error) {
      console.warn(`Failed to parse pyproject.toml in ${ctx.assetDir}`, error);
      return {};
    }
  }
}
