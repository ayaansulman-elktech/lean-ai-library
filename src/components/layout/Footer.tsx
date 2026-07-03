export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 bg-muted/20">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built as the static documentation site for the Lean AI Factory.
        </p>
      </div>
    </footer>
  );
}
