'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FileTreeNode } from '@/lib/types/asset';

interface AssetViewerProps {
  category: string;
  assetId: string;
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

export function AssetViewer({ category, assetId, assetName, fileTree, readmeContent, skillContent, repository }: AssetViewerProps) {
  const defaultPdf = fileTree ? findFirstPdf(fileTree) : null;
  const [activeFile, setActiveFile] = useState<FileTreeNode | null>(defaultPdf);
  const [mdContent, setMdContent] = useState<string | null>(null);
  const [isLoadingMd, setIsLoadingMd] = useState(false);

  const fileName = activeFile?.name.toLowerCase();
  const isReadme = fileName === 'readme.md';
  const isSkill = fileName === 'skill.md';
  const isPdf = fileName?.endsWith('.pdf');
  const isMd = fileName?.endsWith('.md');

  const showTree = !activeFile || (!isMd && !isPdf);
  const treeLines = fileTree ? buildAsciiTreeLines(fileTree) : [];

  useEffect(() => {
    if (isMd && activeFile) {
      if (isReadme && readmeContent) {
        setMdContent(readmeContent);
      } else if (isSkill && skillContent) {
        setMdContent(skillContent);
      } else if (repository && repository.url) {
        setIsLoadingMd(true);
        const rawBase = repository.url.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '');
        const branch = repository.branch || 'main';
        const mdPath = `${repository.path}/${activeFile.path}`;
        const mdUrl = `${rawBase}/${branch}/${mdPath}`;
        
        fetch(mdUrl)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch');
            return res.text();
          })
          .then((content) => {
            setMdContent(content);
          })
          .catch(() => setMdContent(null))
          .finally(() => setIsLoadingMd(false));
      } else {
        setMdContent(null);
      }
    } else {
      setMdContent(null);
    }
  }, [isMd, isReadme, isSkill, activeFile, readmeContent, skillContent, category, assetId, repository]);

  let pdfUrl = '';
  if (isPdf && activeFile && repository) {
    const rawBase = repository.url?.replace('github.com', 'raw.githubusercontent.com').replace(/\.git$/, '') || '';
    const branch = repository.branch || 'main';
    const pdfPath = `${repository.path}/${activeFile.path}`;
    pdfUrl = `${rawBase}/${branch}/${pdfPath}`;
  }

  return (
    <section className="flex min-w-0 flex-col h-full min-h-0">
      <div
        className={`flex-1 min-h-0 flex flex-col overflow-hidden rounded-[14px] ${isPdf ? 'bg-[#d9d9d9] text-black' : 'bg-[#1f1f1f] text-[#f3f3f3]'
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
          <div className="flex-1 flex flex-col bg-transparent">
            <div className="border-b border-[#c4c4c4] p-4 flex items-center shrink-0">
              <button
                onClick={() => setActiveFile(null)}
                className="flex items-center gap-2 text-[14px] text-[#f3f3f3] hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                back to files
              </button>
            </div>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              className="w-full flex-1 border-none"
              title={activeFile.name}
            />
          </div>
        ) : isMd ? (
          <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
            <div className="border-b border-[#333333] p-4 flex items-center shrink-0 bg-transparent z-10">
              <button
                onClick={() => setActiveFile(null)}
                className="flex items-center gap-2 text-[14px] text-[#f3f3f3] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                back to files
              </button>
            </div>
            <div className="flex-1 overflow-auto scrollbar-hide p-8 md:p-12">
              {isLoadingMd ? (
                <div className="flex w-full h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : mdContent ? (
                <div
                  className="
                  text-white
                  [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6
                  [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-4 [&>h2]:mt-8
                  [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mb-3 [&>h3]:mt-6
                  [&>h4]:text-lg [&>h4]:font-bold [&>h4]:mb-2 [&>h4]:mt-4
                  [&>p]:mb-4 [&>p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                  [&_li]:mb-1
                  [&_a]:text-[#007aff] [&_a]:hover:underline
                  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-300 [&_blockquote]:mb-4
                  [&_pre]:bg-[#2a2a2a] [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
                  [&_code]:font-mono [&_code]:text-sm
                  [&>p>code]:bg-[#2a2a2a] [&>p>code]:px-1.5 [&>p>code]:py-0.5 [&>p>code]:rounded-md
                  [&_li>code]:bg-[#2a2a2a] [&_li>code]:px-1.5 [&_li>code]:py-0.5 [&_li>code]:rounded-md
                  [&_table]:w-full [&_table]:mb-4 [&_table]:border-collapse
                  [&_th]:border [&_th]:border-gray-700 [&_th]:p-2 [&_th]:bg-[#2a2a2a] [&_th]:text-left
                  [&_td]:border [&_td]:border-gray-700 [&_td]:p-2
                "
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                  >
                    {mdContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="flex w-full h-full items-center justify-center font-mono text-gray-400">
                  Failed to load content.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center font-mono text-base md:text-[20px] text-black/50">
            Preview not available
          </div>
        )}
      </div>
    </section>
  );
}
