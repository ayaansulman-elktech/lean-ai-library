import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';

export function Hero() {
  return (
    <section className="py-24 px-6 md:px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8">
        <BookOpen className="w-4 h-4" />
        <span>Lean AI Factory Portal</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
        Explore AI Agents, Libraries,<br className="hidden md:block" /> Models and Workflows
      </h1>
      
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
        Search hundreds of AI assets from Lean AI Factory. The single source of truth for all internal AI tools.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/categories" 
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium text-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
        >
          Browse Assets
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link 
          href="/manifest" 
          className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium text-lg hover:bg-secondary/80 transition-colors w-full sm:w-auto"
        >
          View Manifest
        </Link>
      </div>
    </section>
  );
}
