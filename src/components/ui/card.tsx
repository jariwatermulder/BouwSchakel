import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "border-border bg-surface shadow-soft rounded-[var(--radius-card)] border p-6",
        interactive && "bs-lift",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Kaarttitel. Standaard een h3; geef `as` mee voor een logische koppenstructuur
 * (h1 op een pagina zonder andere hoofdkop, h2 voor hoofdsecties onder een h1).
 */
export function CardTitle({
  className,
  as: Tag = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }) {
  return (
    <Tag
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-foreground-muted mt-1 text-sm", className)}
      {...props}
    />
  );
}
