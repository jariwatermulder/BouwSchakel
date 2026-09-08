"use client";

export function PrintKnop({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      Afdrukken
    </button>
  );
}
