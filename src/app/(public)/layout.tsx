import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

/**
 * Publieke pagina's lezen bewust geen sessie: zo kunnen ze statisch worden
 * gebouwd en uit de cache komen. De menubalk leest zelf de rol-hintcookie in
 * de browser (zie SiteHeader); afgeschermde pagina's controleren de sessie
 * server-side.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
