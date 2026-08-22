import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "border-border bg-surface text-foreground placeholder:text-foreground-muted focus-visible:border-navy-500 h-11 w-full rounded-lg border px-3 text-sm",
        "aria-[invalid=true]:border-red-500",
        className,
      )}
      {...props}
    />
  );
});
