'use server';

import fs from 'fs';
import path from 'path';

export async function getAssetFileContent(category: string, id: string, filePath: string): Promise<string | null> {
  try {
    const baseDir = path.join(process.cwd(), 'generated', 'content', category, id);
    const fullPath = path.join(baseDir, filePath);
    
    // Path traversal protection
    if (!fullPath.startsWith(baseDir)) {
      return null;
    }

    if (fs.existsSync(fullPath)) {
      return await fs.promises.readFile(fullPath, 'utf-8');
    }
    return null;
  } catch (e) {
    return null;
  }
}
