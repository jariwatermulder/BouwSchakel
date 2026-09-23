import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-muted flex min-h-full flex-col">
      {/* Zelfde blauwe balk als de site-header, zodat het witte logo wordt gebruikt. */}
      <div className="bg-brand-500 border-brand-700/40 border-b">
        <Container className="flex h-16 items-center">
          <Link href="/" className="flex items-center" aria-label="ZZP Schakel, naar de homepage">
            <Logo priority />
          </Link>
        </Container>
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(32rem 24rem at 85% -10%, rgba(37,99,235,0.10), transparent 60%), radial-gradient(30rem 24rem at 10% 110%, rgba(37,99,235,0.08), transparent 60%)",
          }}
        />
        <div className="relative w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
