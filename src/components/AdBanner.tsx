import { useEffect, useRef } from "react";

interface AdBannerProps {
  type: "native" | "banner728x90";
  className?: string;
}

export function AdBanner({ type, className = "" }: AdBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || loaded.current) return;
    loaded.current = true;

    if (type === "native") {
      // Native Banner
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      script.src = "https://pl28979415.profitablecpmratenetwork.com/12799f25dcbfc1f66c9e1995edc89367/invoke.js";
      
      const container = document.createElement("div");
      container.id = "container-12799f25dcbfc1f66c9e1995edc89367";
      
      containerRef.current.appendChild(container);
      containerRef.current.appendChild(script);
    } else if (type === "banner728x90") {
      // Banner 728x90
      const optionsScript = document.createElement("script");
      optionsScript.textContent = `
        atOptions = {
          'key' : 'ef4e9cf95145c3327eb4a4802c9d502f',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement("script");
      invokeScript.src = "https://www.highperformanceformat.com/ef4e9cf95145c3327eb4a4802c9d502f/invoke.js";
      
      containerRef.current.appendChild(optionsScript);
      containerRef.current.appendChild(invokeScript);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [type]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center overflow-hidden ${className}`}
    />
  );
}
