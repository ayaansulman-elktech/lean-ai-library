import { ReactNode } from 'react';
import { Copy } from 'lucide-react';

interface CodeBlockProps {
  children?: ReactNode;
  className?: string;
  inline?: boolean;
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
  if (inline) {
    return (
      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-primary">
        {children}
      </code>
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden my-6 border border-border">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          className="p-1.5 bg-background/20 hover:bg-background/40 backdrop-blur-sm rounded-md text-foreground transition-colors"
          title="Copy code"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
      <pre className={`p-4 overflow-x-auto text-sm ${className || ''}`}>
        <code>{children}</code>
      </pre>
    </div>
  );
}
