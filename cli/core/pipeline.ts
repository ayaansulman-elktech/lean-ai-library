import { Asset } from '../../src/lib/types/asset';
import { Parser, ParserContext } from '../parsers/base';
import { ArticleParser } from '../parsers/article.parser';
import { SkillParser } from '../parsers/skill.parser';
import { ReadmeParser } from '../parsers/readme.parser';
import { PackageParser } from '../parsers/package.parser';
import { PythonParser } from '../parsers/python.parser';
import { GithubParser } from '../parsers/github.parser';
import { ImageParser } from '../parsers/image.parser';

export class ExtractionPipeline {
  private parsers: Parser[];

  constructor() {
    // Order matters for normalization, but we merge them in reverse priority 
    // so the highest priority overwrites the lower priority.
    // However, it's easier to just run them and merge carefully.
    this.parsers = [
      new GithubParser(),    // Lowest priority (folder name, git)
      new PythonParser(),    // pyproject.toml
      new PackageParser(),   // package.json
      new ReadmeParser(),    // README.md frontmatter
      new SkillParser(),     // SKILL.md frontmatter
      new ArticleParser(),   // article.json (Highest priority)
      new ImageParser()      // Orthogonal concern
    ];
  }

  async process(ctx: ParserContext): Promise<Asset> {
    const partials = await Promise.all(this.parsers.map(p => p.parse(ctx)));

    // Merge partials in order of priority (Github -> Python -> Package -> Readme -> Skill -> Metadata -> Image)
    const merged: Partial<Asset> = {
      keywords: [],
      dependencies: [],
      related: [],
      assets: [],
      examples: []
    };

    for (const partial of partials) {
      // For arrays, we might want to merge or overwrite. We'll merge unique items for dependencies.
      if (partial.dependencies) {
        merged.dependencies = Array.from(new Set([...(merged.dependencies || []), ...partial.dependencies]));
      }
      if (partial.keywords) {
        merged.keywords = Array.from(new Set([...(merged.keywords || []), ...partial.keywords]));
      }
      if (partial.assets) {
        merged.assets = partial.assets; // Usually just driven by ImageParser
      }
      
      // For primitive fields, later parsers overwrite earlier ones (higher priority)
      Object.keys(partial).forEach((key) => {
        const k = key as keyof Asset;
        if (k !== 'dependencies' && k !== 'keywords' && k !== 'assets' && partial[k] !== undefined) {
          (merged as any)[k] = partial[k];
        }
      });
    }

    return this.normalize(merged);
  }

  private normalize(partial: Partial<Asset>): Asset {
    return {
      id: partial.id || 'unknown-id',
      name: partial.name || partial.id || 'Unknown Asset',
      type: partial.type || 'other',
      category: partial.category || 'other',
      description: partial.description || 'No description provided.',
      shortDescription: partial.shortDescription || partial.name || partial.id || 'No description',
      keywords: partial.keywords || [],
      version: partial.version,
      githubPath: partial.githubPath || '',
      readme: partial.readme,
      skill: partial.skill,
      assets: partial.assets || [],
      examples: partial.examples || [],
      dependencies: partial.dependencies || [],
      related: partial.related || []
    };
  }
}
