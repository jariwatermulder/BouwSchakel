import Link from "next/link";
import { Icon } from "@/components/home/pictos";

/** Klikbare statistiekkaart voor dashboards: één cijfer, één label, één bestemming. */
export function StatKaart({
  href,
  icon,
  waarde,
  label,
  sub,
  delay,
  accent = false,
}: {
  href: string;
  icon: string;
  waarde: string | number;
  label: string;
  sub?: string;
  delay?: number;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bs-load border-border bg-surface shadow-soft hover:border-brand-500 group flex items-center gap-4 rounded-[var(--radius-card)] border p-5 transition-colors"
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          accent ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"
        }`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xl font-bold tabular-nums leading-tight">{waarde}</span>
        <span className="text-foreground-muted block text-sm">
          {label}
          {sub ? <span className="text-foreground-muted/80"> · {sub}</span> : null}
        </span>
      </span>
      <span
        aria-hidden
        className="text-foreground-muted group-hover:text-brand-600 transition-colors"
      >
        →
      </span>
    </Link>
  );
}
