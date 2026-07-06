import { Asset } from '../../src/lib/types/asset';
import { Parser, ParserContext } from '../parsers/base';
import { MetadataParser } from '../parsers/metadata.parser';
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
      new MetadataParser(),  // metadata.json (Highest priority)
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

  private cleanDescription(desc: string | undefined): string {
    if (!desc) return 'No description';
    
    // Strip markdown formatting
    let clean = desc
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Italic
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/#/g, '') // Headers
      .replace(/\n/g, ' ') // Newlines
      .trim();

    // Small to the point: limit to 70 characters and add ellipsis if needed
    if (clean.length > 70) {
      clean = clean.slice(0, 67).trim() + '...';
    }

    return clean || 'No description';
  }

  private normalize(partial: Partial<Asset>): Asset {
    return {
      id: partial.id || 'unknown-id',
      name: partial.name || partial.id || 'Unknown Asset',
      type: partial.type || 'other',
      category: partial.category || 'other',
      description: partial.description || 'No description provided.',
      shortDescription: this.cleanDescription(partial.shortDescription || partial.description?.split('\n')[0]),
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
