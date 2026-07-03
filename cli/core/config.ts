import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface LeanLibraryConfig {
  source: {
    repository: string;
    branch?: string;
  };
  output: {
    directory: string;
  };
  deployment: {
    provider: string;
  };
  search: {
    engine: string;
  };
  site: {
    title: string;
    description: string;
  };
}

export function loadConfig(): LeanLibraryConfig {
  const configPath = path.join(process.cwd(), 'lean-library.config.yaml');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('lean-library.config.yaml not found at project root');
  }

  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as LeanLibraryConfig;
}
