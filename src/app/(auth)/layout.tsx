import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-muted flex min-h-full flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="text-navy-900 mb-8 flex items-center gap-2 text-lg font-bold"
      >
        <span
          aria-hidden
          className="bg-navy-800 text-accent-500 flex h-8 w-8 items-center justify-center rounded-md text-sm font-black"
        >
          BS
        </span>
        BouwSchakel
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
