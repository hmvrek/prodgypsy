import { useState, useEffect, useRef } from "react";
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
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  // Load ad script when modal opens
  useEffect(() => {
    if (!isOpen || !adContainerRef.current) return;

    // Clear previous content
    adContainerRef.current.innerHTML = '';

    // Smartlink ad - open in background on modal show
    const smartlinkOpened = sessionStorage.getItem('smartlink_shown');
    if (!smartlinkOpened) {
      window.open('https://www.profitablecpmratenetwork.com/jtxkezrckp?key=9ef4988aeb53b1c1e12e8b363b9eb2fe', '_blank');
      sessionStorage.setItem('smartlink_shown', 'true');
    }

    // Native banner inside modal
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl28979415.profitablecpmratenetwork.com/12799f25dcbfc1f66c9e1995edc89367/invoke.js';
    
    const container = document.createElement('div');
    container.id = 'container-12799f25dcbfc1f66c9e1995edc89367-modal';
    
    adContainerRef.current.appendChild(container);
    adContainerRef.current.appendChild(script);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {canSkip ? "Ad completed - Click continue" : `Please wait ${countdown}s...`}
          </div>
          {canSkip && (
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Ad Content Area */}
        <div className="p-6">
          <div
            ref={adContainerRef}
            className="w-full min-h-[250px] bg-secondary/50 rounded-lg flex items-center justify-center border border-border/50 overflow-hidden"
          >
            <div className="text-center text-muted-foreground">
              <p className="text-sm font-medium">Advertisement</p>
              <p className="text-xs mt-1">Loading ad content...</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Ads support our service and allow us to offer free downloads
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          />
        </div>

        {/* Continue Button */}
        <div className="p-4">
          <Button
            onClick={onComplete}
            disabled={!canSkip}
            className="w-full"
          >
            {canSkip ? "Continue to download" : `Wait ${countdown}s...`}
          </Button>
        </div>
      </div>
    </div>
  );
}
