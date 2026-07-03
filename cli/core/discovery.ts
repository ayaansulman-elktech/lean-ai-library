import fs from 'fs';
import path from 'path';

export interface DiscoveryOptions {
  ignoreDirs?: string[];
  indicatorFiles?: string[];
}

const DEFAULT_OPTIONS: DiscoveryOptions = {
  ignoreDirs: ['.git', '.github', 'node_modules', 'dist', 'build', '.next', 'coverage', '__pycache__', 'venv', 'cli', 'src', 'public'],
  indicatorFiles: ['README.md', 'SKILL.md', 'metadata.json', 'pyproject.toml', 'package.json']
};

export class AssetDiscovery {
  private options: DiscoveryOptions;

  constructor(options: Partial<DiscoveryOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async discover(baseDir: string): Promise<string[]> {
    const candidates: string[] = [];

    const walk = async (currentDir: string) => {
      const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

      let isCandidate = false;

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!this.options.ignoreDirs?.includes(entry.name)) {
            await walk(path.join(currentDir, entry.name));
          }
        } else if (entry.isFile()) {
          if (this.options.indicatorFiles?.includes(entry.name)) {
            isCandidate = true;
          }
        }
      }

      if (isCandidate && currentDir !== baseDir) {
        candidates.push(currentDir);
      }
    };

    await walk(baseDir);
    return candidates;
  }
}
