import fs from 'fs';
import path from 'path';

export async function getAssetReadme(category: string, id: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'generated', 'content', category, id, 'README.md');
    if (fs.existsSync(filePath)) {
      return await fs.promises.readFile(filePath, 'utf-8');
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function getAssetSkill(category: string, id: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'generated', 'content', category, id, 'SKILL.md');
    if (fs.existsSync(filePath)) {
      return await fs.promises.readFile(filePath, 'utf-8');
    }
    return null;
  } catch (e) {
    return null;
  }
}
