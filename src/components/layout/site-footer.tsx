import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";

const columns = [
  {
    heading: "Platform",
    links: [
      { href: "/vind-zzper", label: "Vind een zzp'er" },
      { href: "/hoe-het-werkt", label: "Hoe het werkt" },
      { href: "/tarieven", label: "Tarieven" },
      { href: "/faq", label: "Veelgestelde vragen" },
    ],
  },
  {
    heading: "Voor jou",
    links: [
      { href: "/zzpers", label: "Voor zzp'ers" },
      { href: "/bedrijven", label: "Voor opdrachtgevers" },
      { href: "/over-ons", label: "Over ons" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Juridisch",
    links: [
      { href: "/algemene-voorwaarden", label: "Algemene voorwaarden" },
      { href: "/privacy", label: "Privacy" },
      { href: "/cookies", label: "Cookies" },
      { href: "/klachten", label: "Klachten" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-border bg-ink text-navy-100 mt-auto border-t">
      <Container className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/brand/logo-white.png"
            alt="ZZP Connect"
            width={182}
            height={30}
            className="h-7 w-auto"
          />
          <p className="text-navy-200 mt-3 text-sm">
            Vind een zzp’er in jouw regio en neem rechtstreeks contact op.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <h4 className="text-sm font-semibold text-white">{col.heading}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-navy-200 text-sm hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-navy-800 border-t">
        <Container className="text-navy-300 py-4 text-xs">
          © {new Date().getFullYear()} ZZP Connect — communicatieplatform dat
          opdrachtgevers en zzp’ers met elkaar in contact brengt. Afspraken over
          het werk maken beide partijen rechtstreeks met elkaar; ZZP Connect is
          daarbij geen partij.
        </Container>
      </div>
    </footer>
  );
}
