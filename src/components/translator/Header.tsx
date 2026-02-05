 import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 px-4 md:px-6 border-b border-border">
      <div className="flex items-center gap-2">
        <img src="/envoy.png" alt="Envoy logo" className="h-8 w-8" />
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Translator</h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleTheme}
        aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="h-10 w-10"
      >
        {theme === "light" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
