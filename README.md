# BouwSchakel

**De juiste vakman. Op het juiste moment.**

BouwSchakel is een Nederlands bemiddelingsplatform dat bouwbedrijven en zelfstandige vakmensen (ZZP'ers) rechtstreeks met elkaar verbindt. BouwSchakel is een bemiddelingsplatform: de overeenkomst voor het werk komt tot stand tussen opdrachtgever en vakman.

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
[MATCHING](./docs/MATCHING.md) ·
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
- FASE 3: bedrijfsregistratie/-profiel (met CompanyMember-teamaccounts), snelle 'opdracht plaatsen'-wizard, opdrachtenbeheer met statusworkflow en bedrijfsdashboard.
- FASE 4: deterministische matching engine met harde filters en gewogen, uitlegbare scores (configureerbare gewichten via `MatchingSetting`); kandidaten per opdracht voor bedrijven en "Opdrachten voor jou" voor ZZP'ers; ingebouwde NL-gazetteer voor afstandsberekening.
- FASE 5: reacties & uitnodigingen (Application) → kandidaat selecteren (Assignment, opdracht → vervuld); interne messaging per opdracht met ongelezen-indicators; in-app + e-mail notificaties met per-gebruiker voorkeuren.

De database draait op een apart **Supabase**-project — zie [DATABASE_SETUP](./docs/DATABASE_SETUP.md). Zie het [implementatieplan](./docs/IMPLEMENTATION_PLAN.md) voor de volgende fasen (FASE 6: reviews).

### Bekende aandachtspunten

- De database-host wordt later definitief gekozen (Prisma blijft de ORM). Zonder `DATABASE_URL` draaien alleen de statische pagina's; auth-flows vereisen een database.
- Juridische teksten zijn concept en moeten door een Nederlandse jurist worden gecontroleerd.
