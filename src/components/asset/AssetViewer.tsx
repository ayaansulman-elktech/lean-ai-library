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

export function AssetViewer({ category, assetName, fileTree, readmeContent, skillContent }: AssetViewerProps) {
  const [activeFile, setActiveFile] = useState<FileTreeNode | null>(null);

  const fileName = activeFile?.name.toLowerCase();
  const isReadme = fileName === 'readme.md';
  const isSkill = fileName === 'skill.md';
  const showTree = !activeFile || (!isReadme && !isSkill);
  const treeLines = fileTree ? buildAsciiTreeLines(fileTree) : [];
  const activeContent = isReadme ? readmeContent : isSkill ? skillContent : null;

  return (
    <section className="flex min-w-0 flex-col">
      <Link
        href={`/categories/${category}`}
        className="mb-[39px] inline-flex w-fit items-center gap-[17px] text-[14px] leading-none text-black transition-colors hover:text-[#007aff]"
      >
        <ArrowLeft className="h-[19px] w-[19px]" strokeWidth={2} />
        back to previous page
      </Link>

      <div
        className={`min-h-[852px] overflow-hidden rounded-[14px] ${
          showTree ? 'bg-[#1f1f1f] text-[#f3f3f3]' : 'bg-[#d9d9d9] text-black'
        }`}
      >
        {showTree ? (
          <div className="px-[69px] pt-[44px] font-mono text-[24px] leading-[1.48] tracking-[0]">
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
        ) : activeContent ? (
          <pre className="h-full min-h-[852px] overflow-auto whitespace-pre-wrap px-[26px] py-[25px] font-mono text-[20px] leading-[1.48] tracking-[0] text-black">
            {activeContent}
          </pre>
        ) : (
          <div className="flex min-h-[852px] items-center justify-center font-mono text-[20px] text-black/50">
            Preview not available
          </div>
        )}
      </div>
    </section>
  );
}
