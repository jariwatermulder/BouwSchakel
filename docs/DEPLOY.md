# Live zetten op Vercel

Zo krijg je een echte, deelbare URL. Duurt ~5 minuten; je hebt alleen een
(gratis) Vercel-account nodig.

## 1. Databasewachtwoord ophalen

Supabase-dashboard → project **bouwschakel** → Settings → Database →
**Reset database password** → kopieer het wachtwoord.

## 2. Project importeren in Vercel

1. Ga naar https://vercel.com/new en log in met GitHub.
2. Kies de repository **jariwatermulder/ZZP Schakel**.
3. Bij "Branch": kies `claude/bouwkracht-platform-design-92ku8q` (of merge die
   eerst naar `main`).
4. Framework wordt automatisch herkend als **Next.js**. Niets aanpassen.

## 3. Environment variables invullen

Voeg deze toe onder "Environment Variables" (vervang `[WACHTWOORD]` door stap 1):

```
DATABASE_URL = postgresql://postgres.pzpegcnvtzamsjqboyxz:[WACHTWOORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL   = postgresql://postgres:[WACHTWOORD]@db.pzpegcnvtzamsjqboyxz.supabase.co:5432/postgres
AUTH_SECRET  = yz9atEsHMLvKm2tP+WgdXhqCs4GjGSt7GFgzOZpNrgNCPrWMvYg9xiVaUsIzbqDP
APP_URL      = https://www.zzpschakel.nl
```

> `APP_URL` is de basis voor canonical-links, Open Graph (deelvoorbeelden),
> sitemap, robots, structured data en e-maillinks. Zet hem op het
> **definitieve domein met www**, niet op een `*.vercel.app`-adres. Als
> vangnet gebruikt de code in productie (`VERCEL_ENV=production`) altijd
> `https://www.zzpschakel.nl` wanneer `APP_URL` ontbreekt of nog naar een
> `*.vercel.app`-host wijst (zie `src/lib/app-url.ts`). Previews gebruiken hun
> eigen deploy-URL en staan op noindex. Zie docs/SEO.md.

Bedrijfsgegevens voor de juridische pagina's (privacy, voorwaarden, klachten,
cookies, contact). Zolang deze leeg zijn, tonen die pagina's placeholders en
een "nog aan te vullen"-melding. Nooit verzinnen; neem ze over van het
KvK-uittreksel:

```
NEXT_PUBLIC_BEDRIJF_NAAM     = <statutaire of handelsnaam>
NEXT_PUBLIC_BEDRIJF_ADRES    = <straat en huisnummer, postcode en plaats>
NEXT_PUBLIC_BEDRIJF_KVK      = <KvK-nummer>
NEXT_PUBLIC_CONTACT_EMAIL    = <e-mailadres waarop jullie bereikbaar zijn>
NEXT_PUBLIC_CONTACT_TELEFOON = <optioneel>
```

## 3b. Eigen domein koppelen (www.zzpschakel.nl)

Productie-origin is **https://www.zzpschakel.nl**; `zzpschakel.nl` (zonder
www) stuurt permanent door naar www.

1. Vercel → project → **Settings → Domains** → voeg `www.zzpschakel.nl` toe
   als primair domein en `zzpschakel.nl` met "Redirect to www.zzpschakel.nl"
   (308). Vercel toont welke DNS-records nodig zijn.
2. Bij de domeinregistrar: CNAME voor `www` naar `cname.vercel-dns.com` en
   het A-record van `zzpschakel.nl` op het IP-adres dat Vercel noemt (of de
   waarden die Vercel toont). Verwijder oude records die naar een andere
   hosting of een doorstuurdienst wijzen; die geven anders een 502 of een
   pagina in een frame.
3. Wacht tot Vercel beide domeinen als "Valid Configuration" toont en het
   certificaat is uitgegeven.
4. Zet `APP_URL` op `https://www.zzpschakel.nl` en deploy opnieuw.
5. Controleer vanaf een ander netwerk (bijv. mobiel):
   - `https://zzpschakel.nl/vind-zzper?vak=timmerman` → 308 naar
     `https://www.zzpschakel.nl/vind-zzper?vak=timmerman` (pad en query blijven);
   - `http://www.zzpschakel.nl` → https;
   - de oude adressen `bouw-schakel.vercel.app`, `bouwschakel.vercel.app` en
     `bouw-schakel-geqi.vercel.app` → 308 naar www (ingebouwd in
     `next.config.ts`, alleen in productie);
   - broncode van de homepage: `<link rel="canonical">`, `og:url` en
     `og:image` op www.zzpschakel.nl; `/robots.txt` en `/sitemap.xml` idem.

## 4. Deploy

Klik **Deploy**. Vercel draait `npm install` (genereert de Prisma-client) en
`next build`. Na ~1–2 minuten krijg je je URL.

De database (schema, catalogus, RLS) staat al klaar in Supabase, dus de app is
direct bruikbaar. Maak eventueel een admin aan via `docs/ADMIN.md`.

## Alternatief: lokaal bekijken

Zie `docs/DATABASE_SETUP.md` — `npm install`, `.env` invullen, `npm run dev`,
open http://localhost:3000.
