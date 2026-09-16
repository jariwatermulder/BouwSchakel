import Link from "next/link";
import Image from "next/image";

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
            "radial-gradient(32rem 24rem at 85% -10%, rgba(37,99,235,0.10), transparent 60%), radial-gradient(30rem 24rem at 10% 110%, rgba(37,99,235,0.08), transparent 60%)",
        }}
      />
      <Link href="/" className="relative mb-8" aria-label="ZZP Connect — naar de homepage">
        <Image src="/brand/logo.png" alt="ZZP Connect" width={190} height={31} priority className="h-8 w-auto" />
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
