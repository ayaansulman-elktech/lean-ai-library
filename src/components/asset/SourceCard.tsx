import { Code, Folder, GitBranch, GitCommit, Clock } from 'lucide-react';
import { AssetIndex } from '@/lib/types/asset';

interface SourceCardProps {
  repo: AssetIndex['repository'];
}

export function SourceCard({ repo }: SourceCardProps) {
  if (!repo || !repo.url) return null;

  const repoPathUrl = `${repo.url}/tree/${repo.branch}/${repo.path}`;
  const commitUrl = `${repo.url}/commit/${repo.commit}`;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-6 mt-16">
      <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <Code className="w-5 h-5" />
        Source Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <Folder className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Folder</span>
            <a href={repoPathUrl} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
              {repo.path}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Branch</span>
            <a href={`${repo.url}/tree/${repo.branch}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors">
              {repo.branch}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GitCommit className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Commit</span>
            <a href={commitUrl} target="_blank" rel="noreferrer" className="text-sm font-medium font-mono hover:text-primary transition-colors">
              {repo.commit?.substring(0, 7)}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Repository</span>
            <a href={repo.url} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
              {repo.url.replace('https://github.com/', '')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
