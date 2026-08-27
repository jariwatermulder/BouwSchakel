# Database — Supabase (ZZP Connect)

De ZZP Connect-database draait op een **apart Supabase-project** (los van de
JW Hout-CRM): PostgreSQL 17, regio EU (Frankfurt), gratis tier.

|               |                                                             |
| ------------- | ----------------------------------------------------------- |
| Project       | `bouwschakel`                                               |
| Project ref   | `pzpegcnvtzamsjqboyxz`                                      |
| Host (direct) | `db.pzpegcnvtzamsjqboyxz.supabase.co`                       |
| Regio         | eu-central-1 (Frankfurt)                                    |
| Dashboard     | https://supabase.com/dashboard/project/pzpegcnvtzamsjqboyxz |

Het schema (29 tabellen), de catalogus (15 vakgebieden, 38 specialisaties, 6
certificaten), de standaard matching-instellingen én **RLS** (Row Level
Security, dichtgezet) zijn al toegepast.

## 1. Databasewachtwoord ophalen

Het DB-wachtwoord is geheim en staat niet in code. Haal het op in het dashboard:
**Project → Settings → Database → Database password → Reset database password**
(kopieer het nieuwe wachtwoord direct — het wordt maar één keer getoond).

## 2. `.env` invullen

Gebruik de **pooler**-verbinding voor de app (werkt goed op Vercel/serverless)
en de **directe** verbinding voor migraties:

```bash
# App/runtime (pooler, poort 6543)
DATABASE_URL="postgresql://postgres.pzpegcnvtzamsjqboyxz:[WACHTWOORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migraties (directe verbinding, poort 5432)
DIRECT_URL="postgresql://postgres:[WACHTWOORD]@db.pzpegcnvtzamsjqboyxz.supabase.co:5432/postgres"

AUTH_SECRET="[genereer met: openssl rand -base64 48]"
APP_URL="http://localhost:3000"
```

> Vervang `[WACHTWOORD]` door het wachtwoord uit stap 1. Zet `DATABASE_URL` en
> `AUTH_SECRET` ook in je hostingomgeving (bijv. Vercel) als je live gaat.

## 3. Prisma koppelen aan de bestaande database

Het schema staat al in de database (toegepast via Supabase). Markeer de
migraties daarom als "al toegepast" (baseline), zodat Prisma ze niet opnieuw
probeert uit te voeren:

```bash
npm run db:generate
# Markeer alle reeds toegepaste migraties als baseline:
for m in prisma/migrations/*/; do
  npx prisma migrate resolve --applied "$(basename "$m")"
done
```

Daarna verifiëren:

```bash
npx prisma migrate status   # zou "up to date" moeten tonen
npm run dev                 # http://localhost:3000
```

De catalogus is al geseed. Een lege/nieuwe database vul je met
`npm run db:seed` (alleen buiten productie).

## 4. Latere schemawijzigingen

Nieuwe migraties maak je met `npx prisma migrate dev --name <naam>` (gebruikt
`DIRECT_URL`). In productie: `npx prisma migrate deploy`.

## Beveiliging

- RLS staat aan op alle tabellen zonder policies → de publieke Supabase-API
  (anon key) kan niets. De app benadert de database uitsluitend via Prisma.
- Deel het DB-wachtwoord en `AUTH_SECRET` nooit; commit ze nooit.
