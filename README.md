# ZZP Schakel

**De juiste zzp'er. Op het juiste moment.**

ZZP Schakel is een Nederlands communicatieplatform dat opdrachtgevers en zelfstandige zzp'ers rechtstreeks met elkaar verbindt. Opdrachtgevers zoeken zonder account in de etalage, nemen met een gratis account contact op en maken afspraken rechtstreeks met de zzp'er. Geen opdrachten, matching, reviews, uren, contracten of betalingen via het platform.

> Dit is een nieuwe, op zichzelf staande applicatie en staat volledig los van de website www.jwhoutentuinbouw.nl.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — design system met eigen tokens
- **Prisma 6** ORM op **PostgreSQL**
- **Zod** validatie (gedeeld client/server) + **React Hook Form**
- Server-side sessies (opaak token, httpOnly cookie), **bcrypt** wachtwoord-hashing, RBAC
- **Vitest** voor unit-tests

## Documentatie

Zie [`docs/`](./docs) voor het volledige ontwerp:
[PRODUCT_SPEC](./docs/PRODUCT_SPEC.md) ·
[ARCHITECTURE](./docs/ARCHITECTURE.md) ·
[DATABASE](./docs/DATABASE.md) ·
[SECURITY](./docs/SECURITY.md) ·
[LEGAL_CONSIDERATIONS](./docs/LEGAL_CONSIDERATIONS.md) ·
[IMPLEMENTATION_PLAN](./docs/IMPLEMENTATION_PLAN.md)

## Lokaal ontwikkelen

```bash
# 1. Dependencies
npm install

# 2. Omgeving
cp .env.example .env   # vul DATABASE_URL en AUTH_SECRET in

# 3. Database (PostgreSQL vereist)
npm run db:generate    # Prisma client
npm run db:migrate     # migraties toepassen (dev)
npm run db:seed        # seed (alleen development)

# 4. Draaien
npm run dev            # http://localhost:3000
```

## Handige scripts

| Script               | Doel                   |
| -------------------- | ---------------------- |
| `npm run dev`        | Development server     |
| `npm run build`      | Productiebuild         |
| `npm run lint`       | ESLint                 |
| `npm run typecheck`  | TypeScript zonder emit |
| `npm run format`     | Prettier               |
| `npm run test`       | Vitest (unit)          |
| `npm run db:migrate` | Prisma migratie (dev)  |
| `npm run db:studio`  | Prisma Studio          |

## Status

**FASE 1 — Foundation** en **FASE 2 — ZZP-registratie & profiel** zijn gebouwd:

- FASE 1: project, tooling, design system, auth-fundament (registratie/inloggen, sessies, RBAC), Prisma-schema en publieke pagina's.
- FASE 2: hervatbare multi-step ZZP-registratie met profielcompleetheid, profielpagina, beschikbaarheid, documenten (opslag-interface) en portfolio; catalogus van vakgebieden/specialisaties/certificaten via seed; ZZP-dashboard en app-shell.
- FASE 3: bedrijfsregistratie/-profiel (met CompanyMember-teamaccounts) en bedrijfsdashboard.
- FASE 4: publieke etalage (`/vind-zzper`) met filters op vakgebied en plaats; ingebouwde NL-gazetteer voor plaatsnamen.
- FASE 5: directe berichten tussen bedrijf en zzp'er (één gesprek per paar) met live polling en ongelezen-indicators; in-app + e-mail notificaties met per-gebruiker voorkeuren.
- FASE 6: vervallen (reviews/reputatie zijn bewust geen onderdeel van het platform).
- FASE 7: adminomgeving (`/admin`) met RBAC — dashboard, gebruikers-/bedrijfsbeheer, verificaties, report-/klacht-/contactafhandeling, catalogusbeheer en audit log.
- FASE 8: eigen facturenmodule voor zzp'ers en bedrijven (opmaken, PDF, mailen, status) — geen platformfees of betalingen.
- FASE 9: security headers, rate limiting, AVG-gegevensexport en account­verwijdering, cookiemelding, RLS op alle tabellen.
- FASE 10: SEO (metadata/OG, canonicals, dynamische sitemap van de etalage) en juridische pagina's.

**Alle 10 fasen zijn gebouwd.** De database draait op een apart **Supabase**-project — zie [DATABASE_SETUP](./docs/DATABASE_SETUP.md). Volgende stappen richting livegang: definitieve providers kiezen (e-mail, storage, Mollie), juridische teksten laten controleren en productie-omgeving configureren.

### Bekende aandachtspunten

- De database-host wordt later definitief gekozen (Prisma blijft de ORM). Zonder `DATABASE_URL` draaien alleen de statische pagina's; auth-flows vereisen een database.
- Juridische teksten zijn concept en moeten door een Nederlandse jurist worden gecontroleerd.
