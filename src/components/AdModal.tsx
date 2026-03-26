import { useState, useEffect } from "react";
import { X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function AdModal({ isOpen, onClose, onComplete }: AdModalProps) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (!isOpen) { setCountdown(5); setCanSkip(false); return; }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { setCanSkip(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {canSkip ? "Reklama zakończona - kliknij kontynuuj" : `Poczekaj ${countdown}s...`}
          </div>
          {canSkip && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="p-6">
          <div className="w-full min-h-[250px] bg-secondary/50 rounded-lg flex items-center justify-center border border-border/50">
            <div className="text-center text-muted-foreground">
              <p className="text-sm font-medium">Reklama</p>
              <p className="text-xs mt-1">Ładowanie reklamy...</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Reklamy wspierają nasz serwis i pozwalają oferować darmowe pobieranie
          </p>
        </div>
        <div className="h-1 bg-secondary">
          <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${((5 - countdown) / 5) * 100}%` }} />
        </div>
        <div className="p-4">
          <Button onClick={onComplete} disabled={!canSkip} className="w-full">
            {canSkip ? "Kontynuuj do pobrania" : `Poczekaj ${countdown}s...`}
          </Button>
        </div>
      </div>
    </div>
  );
}
