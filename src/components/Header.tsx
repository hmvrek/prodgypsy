import { Link2 } from "lucide-react";

export function Header() {
  return (
    <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20 border border-primary/30">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              GypsyCFG
            </h1>
            <p className="text-xs text-muted-foreground">Config Links</p>
          </div>
        </div>
      </div>
    </header>
  );
}
