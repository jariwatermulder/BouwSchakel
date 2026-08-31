import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Nette, consistente foutmelding voor formulieren. Verschijnt met een subtiele
 * fade + korte shake (reduced-motion-veilig). Gebruikt role="alert" zodat
 * schermlezers de melding aankondigen.
 */
export function FormAlert({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "bs-shake flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700",
        className,
      )}
    >
      <span aria-hidden className="mt-px shrink-0 font-bold">
        !
      </span>
      <span>{children}</span>
    </div>
  );
}
