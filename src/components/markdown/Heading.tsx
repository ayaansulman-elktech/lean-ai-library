import React, { ReactNode } from 'react';

export function Heading({ level, children, id }: { level: number; children: ReactNode; id?: string }) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
  
  const baseClasses = "scroll-m-20 font-bold tracking-tight";
  
  const sizeClasses: Record<number, string> = {
    1: "text-4xl lg:text-5xl mb-6",
    2: "text-3xl first:mt-0 mt-12 mb-6 border-b border-border pb-2",
    3: "text-2xl mt-8 mb-4",
    4: "text-xl mt-6 mb-3",
    5: "text-lg mt-4 mb-2",
    6: "text-base mt-4 mb-2",
  };

  return (
    <Tag id={id} className={`group relative ${baseClasses} ${sizeClasses[level]}`}>
      <a 
        href={`#${id}`} 
        className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity select-none no-underline"
        aria-hidden="true"
      >
        #
      </a>
      {children}
    </Tag>
  );
}
