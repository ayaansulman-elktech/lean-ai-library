import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { rm } from 'fs/promises';

export interface ReaderOptions {
  local?: string;
  repo?: string;
  branch?: string;
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
      
      let cloneUrl = this.options.repo;
      const token = process.env.FACTORY_TOKEN || process.env.GITHUB_TOKEN;
      if (token) {
        try {
          const urlObj = new URL(cloneUrl);
          if (urlObj.hostname === 'github.com') {
            urlObj.username = 'x-access-token';
            urlObj.password = token;
            cloneUrl = urlObj.toString();
          }
        } catch (e) {
          // Ignore invalid URLs
        }
      }

      console.log(`Cloning repository ${this.options.repo}${this.options.branch ? ` (branch: ${this.options.branch})` : ''}...`);
      const git = simpleGit();
      
      try {
        if (this.options.branch) {
          await git.clone(cloneUrl, this.tempDir, ['-b', this.options.branch]);
        } else {
          await git.clone(cloneUrl, this.tempDir);
        }
      } catch (err: any) {
        // Obfuscate token in error message if it fails
        const errorMsg = err.message || String(err);
        if (token) {
          throw new Error(errorMsg.replace(token, '***'));
        }
        throw err;
      }
      
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
