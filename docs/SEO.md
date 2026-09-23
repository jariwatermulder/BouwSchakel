# SEO en indexering

Technische afspraken voor zzpschakel.nl. Uitgangspunt: één publieke origin,
eerlijke metadata en een accountmuur die blijft zoals hij is.

## Productie-origin

- Publieke origin: **https://www.zzpschakel.nl**. Het domein zonder www en de
  oude publieke Vercel-adressen (`bouw-schakel.vercel.app`,
  `bouwschakel.vercel.app`, `bouw-schakel-geqi.vercel.app`) sturen in
  productie permanent (308) door naar www, met behoud van pad en query
  (`next.config.ts`). Preview-hosts worden niet doorgestuurd.
- De basis-URL voor canonicals, Open Graph, sitemap, robots en structured data
  komt uit `resolveAppUrl()` in `src/lib/app-url.ts`: `APP_URL` (eigen
  domein) → in productie de vaste origin → op previews de deploy-URL →
  localhost. Een `APP_URL` die nog naar `*.vercel.app` wijst wordt in
  productie genegeerd.
- Previews (`VERCEL_ENV` ≠ production) krijgen `X-Robots-Tag: noindex,
  nofollow` op alle routes en een robots.txt die alles uitsluit.

## Indexeringsbeleid per route

| Route | Beleid |
| --- | --- |
| `/`, `/vind-zzper`, `/zzpers`, `/bedrijven`, `/hoe-het-werkt`, `/tarieven`, `/faq`, `/over-ons`, `/contact` | Indexeerbaar, eigen absolute canonical, in de sitemap. |
| `/vind-zzper?vak=…&plaats=…` | Zelfde pagina met filter; canonical naar `/vind-zzper`, niet in de sitemap. |
| `/vind-zzper/[id]` (profielen) | Alleen met account zichtbaar; altijd `noindex`, generieke titel voor gasten, niet in de sitemap. Geen persoonsgegevens in metadata of structured data. |
| `/privacy`, `/cookies`, `/algemene-voorwaarden`, `/klachten` | Bereikbaar, `noindex` (bestaand beleid), niet in de sitemap. |
| `/inloggen`, `/registreren`, `/verifieer`, `/wachtwoord-*` | `noindex`; bewust **niet** in robots-disallow, zodat de noindex gelezen kan worden. Niet in de sitemap. |
| Dashboards, berichten, documenten, instellingen, `/admin`, `/api` | Authenticatie verplicht; robots-disallow; nooit in de sitemap. Robots en noindex zijn geen beveiliging. |
| `/opdrachten…` (vervallen) | 308 naar `/vind-zzper` of het dashboard (`next.config.ts`). |

De sitemap (`src/app/sitemap.ts`) bevat alleen de indexeerbare pagina's en
geen `lastmod`: die datum hoort bij een echte inhoudswijziging, niet bij
elke aanvraag.

## Metadata

- Titels volgen het sjabloon `Pagina · ZZP Schakel`; de homepage gebruikt
  `ZZP Schakel — Vind vakmensen in jouw regio`.
- `og:title`, `og:description` en `og:url` worden niet vast in de layout
  gezet, zodat ze per pagina uit title, description en canonical volgen.
  Deelafbeelding: `/og.png` (1200×630).
- Structured data (`src/components/structured-data.tsx`): `Organization` en
  `WebSite` met stabiele `@id`'s op de productie-origin. Alleen naam, URL en
  logo. Geen adres, contactgegevens, social-profielen, beoordelingen of
  aanbod zolang die niet zijn aangeleverd en bevestigd. Geen `LocalBusiness`,
  `JobPosting` of profielmarkup.

## Controleren na een deploy

1. `curl -I https://zzpschakel.nl/vind-zzper?vak=timmerman` → 308 naar
   `https://www.zzpschakel.nl/vind-zzper?vak=timmerman`.
2. Broncode van `/`, `/vind-zzper`, `/zzpers`: canonical, `og:url`,
   `og:image` en JSON-LD op `https://www.zzpschakel.nl`.
3. `/robots.txt`: sitemap-regel op www; `/sitemap.xml`: negen URL's op www.
4. Een preview-deploy: `X-Robots-Tag: noindex, nofollow` in de headers.
5. Search Console: property voor `https://www.zzpschakel.nl`, sitemap
   indienen en de gekozen canonical controleren. Zonder Search Console is
   indexering niet te bevestigen.

## Nog aan te leveren door de eigenaar

- Bedrijfsgegevens van de aanbieder (`NEXT_PUBLIC_BEDRIJF_*`,
  `NEXT_PUBLIC_CONTACT_EMAIL`) voor de juridische pagina's, de contactpagina
  en later `Organization.contactPoint`/`address`.
- Bevestigde social-profielen (voor `sameAs`), als die bestaan.
- Search Console-toegang voor metingen na livegang.
