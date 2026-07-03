import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { rm } from 'fs/promises';

export interface ReaderOptions {
  local?: string;
  repo?: string;
}

export class RepositoryReader {
  private tempDir: string | null = null;
  private targetDir: string = '.';

  constructor(private options: ReaderOptions) {}

  async prepare(): Promise<string> {
    if (this.options.local) {
      this.targetDir = path.resolve(this.options.local);
      if (!fs.existsSync(this.targetDir)) {
        throw new Error(`Local directory not found: ${this.targetDir}`);
      }
      return this.targetDir;
    }

    if (this.options.repo) {
      this.tempDir = path.resolve(process.cwd(), '.tmp-factory');
      if (fs.existsSync(this.tempDir)) {
        await rm(this.tempDir, { recursive: true, force: true });
      }
      console.log(`Cloning repository ${this.options.repo}...`);
      const git = simpleGit();
      await git.clone(this.options.repo, this.tempDir);
      this.targetDir = this.tempDir;
      return this.targetDir;
    }

    // Default to current directory
    this.targetDir = process.cwd();
    return this.targetDir;
  }

  async cleanup(): Promise<void> {
    if (this.tempDir && fs.existsSync(this.tempDir)) {
      console.log('Cleaning up temporary repository...');
      await rm(this.tempDir, { recursive: true, force: true });
    }
  }
}
