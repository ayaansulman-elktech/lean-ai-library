import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight">Lean AI Library</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Link
              href="/categories"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Categories
            </Link>
            <Link
              href="https://github.com/shaz-ik/lean-ai-factory"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              GitHub
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
