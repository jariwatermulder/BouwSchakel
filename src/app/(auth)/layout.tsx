import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-muted relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(32rem 24rem at 85% -10%, rgba(245,158,11,0.16), transparent 60%), radial-gradient(30rem 24rem at 10% 110%, rgba(47,93,166,0.16), transparent 60%)",
        }}
      />
      <Link
        href="/"
        className="text-navy-900 relative mb-8 flex items-center gap-2 text-lg font-bold"
      >
        <span
          aria-hidden
          className="from-navy-800 to-navy-600 text-accent-400 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black shadow-sm"
        >
          ZC
        </span>
        ZZP Connect
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
