import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Parser, ParserContext } from './base';
import { Asset } from '../../src/lib/types/asset';

export class ArticleParser implements Parser {
  name = 'article';

  async parse(ctx: ParserContext): Promise<Partial<Asset>> {
    let targetPath = path.join(ctx.assetDir, 'article.json');
    let isLegacy = false;

    if (!fs.existsSync(targetPath)) {
      // Fallback to metadata.json for backwards compatibility
      targetPath = path.join(ctx.assetDir, 'metadata.json');
      isLegacy = true;
      if (!fs.existsSync(targetPath)) {
        return {};
      }
    }

    try {
      const content = await fs.promises.readFile(targetPath, 'utf-8');
      const data = JSON.parse(content);
      
      // Normalize 'key words' to 'keywords'
      if (data['key words']) {
        data.keywords = data['key words'];
        delete data['key words'];
      }

      this.validate(data, ctx.assetDir);

      return data as Partial<Asset>;
    } catch (error) {
      console.warn(chalk.yellow(`Failed to parse ${isLegacy ? 'metadata.json' : 'article.json'} in ${ctx.assetDir}: ${(error as Error).message}`));
      return {};
    }
  }

  private validate(data: any, dir: string) {
    const warn = (msg: string) => console.warn(chalk.yellow(`[Validation Warning] ${dir}/article.json: ${msg}`));

    if (!data.type) warn("Missing mandatory field: 'type'");
    else if (data.type.length > 12) warn(`'type' exceeds 12 characters ("${data.type}")`);
    else if (!['pdf', 'md', 'folder', 'fileorother'].includes(data.type)) {
      warn(`'type' should be one of pdf, md, folder, fileorother. Found: "${data.type}"`);
    }

    if (!data.category) warn("Missing mandatory field: 'category'");
    else if (data.category.length > 40) warn(`'category' exceeds 40 characters (${data.category.length} chars)`);

    if (!data.name) warn("Missing mandatory field: 'name'");
    else if (data.name.length > 18) warn(`'name' exceeds 18 characters (${data.name.length} chars)`);

    if (!data.shortDescription) warn("Missing mandatory field: 'shortDescription'");
    else if (data.shortDescription.length > 42) warn(`'shortDescription' exceeds 42 characters (${data.shortDescription.length} chars)`);

    if (!data.description) warn("Missing mandatory field: 'description'");
    else if (data.description.length > 260) warn(`'description' exceeds 260 characters (${data.description.length} chars)`);

    if (!data.keywords) warn("Missing mandatory field: 'keywords'");
    else if (!Array.isArray(data.keywords)) warn("'keywords' must be an array of strings");
    else {
      if (data.keywords.length > 12) warn(`'keywords' array exceeds 12 items (${data.keywords.length} items)`);
      data.keywords.forEach((kw: string) => {
        if (kw.length > 24) warn(`Keyword "${kw}" exceeds 24 characters`);
      });
    }
  }
}
