import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Generator, GeneratorContext } from './base';
import { AssetIndex, Asset, FileTreeNode } from '../../src/lib/types/asset';
import { extractToc } from '../core/markdown';

async function buildFileTree(dirPath: string, rootPath: string): Promise<FileTreeNode[]> {
  const tree: FileTreeNode[] = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (['.git', 'node_modules', '.next', 'dist', 'build'].includes(entry.name)) continue;
    
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      const children = await buildFileTree(fullPath, rootPath);
      tree.push({
        name: entry.name,
        type: 'directory',
        path: relPath,
        children
      });
    } else {
      tree.push({
        name: entry.name,
        type: 'file',
        path: relPath
      });
    }
  }

  // Sort: directories first, then files
  tree.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });

  return tree;
}

export class ContentGenerator implements Generator {
  name = 'content';

  async generate(ctx: GeneratorContext): Promise<void> {
    for (const asset of ctx.assets) {
      try {
        const assetDir = path.join(ctx.outputDir, 'content', asset.category, asset.id);
        await fs.promises.mkdir(assetDir, { recursive: true });

        // 1. Compute TOC
        const toc = extractToc(asset.readme);

        // 2. Compute Related Assets
        // Combine manual related with auto-computed (same category, shared keywords, shared dependencies)
        let relatedSet = new Set(asset.related || []);
        
        if (relatedSet.size < 4) {
          const candidates = ctx.assets
            .filter(a => a.id !== asset.id)
            .map(a => {
              let score = 0;
              if (a.category === asset.category) score += 2;
              const sharedKeywords = a.keywords.filter(k => asset.keywords.includes(k));
              score += sharedKeywords.length;
              const sharedDeps = a.dependencies.filter(d => asset.dependencies.includes(d));
              score += sharedDeps.length * 2;
              return { id: a.id, score };
            })
            .filter(a => a.score > 0)
            .sort((a, b) => b.score - a.score);

          for (const candidate of candidates) {
            relatedSet.add(candidate.id);
            if (relatedSet.size >= 4) break;
          }
        }

        const coverImage = asset.assets.find(img => img.src.includes('cover')) || asset.assets[0];

        const sourceAssetDir = path.join(ctx.sourceDir, asset.githubPath);
        let fileTree: FileTreeNode[] = [];
        let lastUpdated: string | undefined;

        if (fs.existsSync(sourceAssetDir)) {
           fileTree = await buildFileTree(sourceAssetDir, sourceAssetDir);
           try {
             // Get the last commit date for this directory
             const gitLogCmd = `git log -1 --format=%cd --date=short -- "${sourceAssetDir}"`;
             lastUpdated = execSync(gitLogCmd, { cwd: ctx.sourceDir, stdio: 'pipe' }).toString().trim();
           } catch (e) {
             // Fallback to current date or ignore
           }
        }

        // 3. Build AssetIndex
        const indexData: AssetIndex = {
          schemaVersion: '1.0.0',
          metadata: {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            category: asset.category,
            version: asset.version,
            description: asset.description,
            shortDescription: asset.shortDescription,
            keywords: asset.keywords,
            lastUpdated,
          },
          content: {
            hasReadme: !!asset.readme,
            hasSkill: !!asset.skill,
          },
          assets: {
            cover: coverImage ? path.basename(coverImage.src) : null,
            images: asset.assets.map(img => path.basename(img.src)),
          },
          examples: asset.examples,
          dependencies: asset.dependencies,
          related: Array.from(relatedSet),
          toc,
          repository: {
            ...ctx.repoInfo,
            path: asset.githubPath
          },
          fileTree
        };

        // Write index.json
        const indexPath = path.join(assetDir, 'index.json');
        await fs.promises.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');

        // Write README.md if it exists
        if (asset.readme) {
          const readmePath = path.join(assetDir, 'README.md');
          await fs.promises.writeFile(readmePath, asset.readme, 'utf-8');
        }

        // Write SKILL.md if it exists
        if (asset.skill) {
          const skillPath = path.join(assetDir, 'SKILL.md');
          await fs.promises.writeFile(skillPath, asset.skill, 'utf-8');
        }

      } catch (error) {
        console.warn(`\n⚠ ${asset.name}`);
        console.warn(`  Failed to generate content: ${(error as Error).message}`);
        console.warn(`  Continuing...`);
      }
    }
  }
}
