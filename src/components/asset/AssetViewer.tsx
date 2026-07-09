'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FileTreeNode } from '@/lib/types/asset';

interface AssetViewerProps {
  category: string;
  assetName: string;
  fileTree?: FileTreeNode[];
  readmeContent?: string | null;
  skillContent?: string | null;
  repository?: { url?: string; branch?: string; path?: string };
}

function buildAsciiTreeLines(nodes: FileTreeNode[], prefix = ''): { node: FileTreeNode; prefix: string; isLast: boolean }[] {
  let lines: { node: FileTreeNode; prefix: string; isLast: boolean }[] = [];

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    lines.push({ node, prefix, isLast });

    if (node.children && node.children.length > 0) {
      const childPrefix = `${prefix}${isLast ? '    ' : '│   '}`;
      lines = lines.concat(buildAsciiTreeLines(node.children, childPrefix));
    }
  });

  return lines;
}

function findFirstPdf(nodes: FileTreeNode[]): FileTreeNode | null {
  for (const node of nodes) {
    if (node.type === 'file' && node.name.toLowerCase().endsWith('.pdf')) {
      return node;
    }
    if (node.children) {
      const found = findFirstPdf(node.children);
      if (found) return found;
    }
  }
  return null;
}

export function AssetViewer({ category, assetName, fileTree, readmeContent, skillContent, repository }: AssetViewerProps) {
  const defaultPdf = fileTree ? findFirstPdf(fileTree) : null;
  const [activeFile, setActiveFile] = useState<FileTreeNode | null>(defaultPdf);

  const fileName = activeFile?.name.toLowerCase();
  const isReadme = fileName === 'readme.md';
  const isSkill = fileName === 'skill.md';
  const isPdf = fileName?.endsWith('.pdf');
  
  const showTree = !activeFile || (!isReadme && !isSkill && !isPdf);
  const treeLines = fileTree ? buildAsciiTreeLines(fileTree) : [];
  const activeContent = isReadme ? readmeContent : isSkill ? skillContent : null;

  let pdfUrl = '';
  if (isPdf && activeFile && repository) {
    const rawBase = repository.url?.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '') || '';
    const branch = repository.branch || 'main';
    // Path inside the repo
    const pdfPath = `${repository.path}/${activeFile.path}`;
    // E.g., https://raw.githubusercontent.com/ayaansulman-elktech/lean-ai-library/main/agents/test-agent/file.pdf
    pdfUrl = `${rawBase}/${branch}/${pdfPath}`;
  }

  return (
    <section className="flex min-w-0 flex-col h-full min-h-0">
      <div
        className={`flex-1 min-h-0 flex flex-col overflow-hidden rounded-[14px] ${
          showTree ? 'bg-[#1f1f1f] text-[#f3f3f3]' : 'bg-[#d9d9d9] text-black'
        }`}
      >
        {showTree ? (
          <div className="flex-1 overflow-auto scrollbar-hide px-6 md:px-[69px] py-8 md:py-[44px] font-mono text-lg md:text-[24px] leading-[1.48] tracking-[0]">
            <div>{assetName}/</div>
            {treeLines.map(line => {
              const marker = line.isLast ? '└── ' : '├── ';
              const isDir = line.node.type === 'directory';
              const name = `${line.node.name}${isDir ? '/' : ''}`;

              return (
                <div key={line.node.path} className="flex whitespace-pre">
                  <span>{line.prefix}{marker}</span>
                  <button
                    type="button"
                    onClick={() => setActiveFile(line.node)}
                    className="text-left transition-colors hover:text-[#007aff]"
                  >
                    {name}
                  </button>
                </div>
              );
            })}
          </div>
        ) : isPdf ? (
          <iframe 
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            className="w-full h-full border-none bg-white flex-1"
            title={activeFile.name}
          />
        ) : activeContent ? (
          <pre className="flex-1 overflow-auto scrollbar-hide whitespace-pre-wrap px-6 md:px-[26px] py-6 md:py-[25px] font-mono text-base md:text-[20px] leading-[1.48] tracking-[0] text-black">
            {activeContent}
          </pre>
        ) : (
          <div className="flex-1 flex items-center justify-center font-mono text-base md:text-[20px] text-black/50">
            Preview not available
          </div>
        )}
      </div>
    </section>
  );
}
