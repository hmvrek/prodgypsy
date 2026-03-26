import { useEffect, useRef } from "react";

export function SocialBarAd() {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://pl28979417.profitablecpmratenetwork.com/69/86/55/698655f16e242381c00582d12262de0f.js";
    document.body.appendChild(script);

    return () => {
      try { document.body.removeChild(script); } catch {}
    };
  }, []);

  return null;
}
