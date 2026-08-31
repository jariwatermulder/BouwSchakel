"use client";

import { useEffect, useState } from "react";

/**
 * Voortgangsbalk die bij het verschijnen rustig vult van 0 naar `value`%.
 * Respecteert prefers-reduced-motion (dan direct op eindwaarde).
 */
export function AnimatedBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const [breedte, setBreedte] = useState(0);
  const doel = Math.max(0, Math.min(100, value));

  useEffect(() => {
    const id = requestAnimationFrame(() => setBreedte(doel));
    return () => cancelAnimationFrame(id);
  }, [doel]);

  return (
    <div
      className={`bg-surface-muted h-2.5 w-full overflow-hidden rounded-full ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={doel}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="bg-accent-500 h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
        style={{ width: `${breedte}%` }}
      />
    </div>
  );
}
