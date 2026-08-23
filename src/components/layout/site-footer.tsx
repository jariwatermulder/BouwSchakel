import Link from "next/link";
import { Container } from "@/components/ui/container";

const columns = [
  {
    heading: "Platform",
    links: [
      { href: "/opdrachten", label: "Opdrachten" },
      { href: "/hoe-het-werkt", label: "Hoe het werkt" },
      { href: "/tarieven", label: "Tarieven" },
      { href: "/faq", label: "Veelgestelde vragen" },
    ],
  },
  {
    heading: "Voor jou",
    links: [
      { href: "/zzpers", label: "Voor ZZP'ers" },
      { href: "/bedrijven", label: "Voor bedrijven" },
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
          <div className="flex items-center gap-2 font-bold text-white">
            <span
              aria-hidden
              className="bg-navy-700 text-accent-500 flex h-8 w-8 items-center justify-center rounded-md text-sm font-black"
            >
              BS
            </span>
            BouwSchakel
          </div>
          <p className="text-navy-200 mt-3 text-sm">
            De juiste vakman. Op het juiste moment.
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
          © {new Date().getFullYear()} BouwSchakel — bemiddelingsplatform voor
          de bouw. BouwSchakel is bemiddelaar en geen partij bij de overeenkomst
          tussen opdrachtgever en ZZP&apos;er.
        </Container>
      </div>
    </footer>
  );
}
