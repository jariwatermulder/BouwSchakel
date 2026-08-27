# Live zetten op Vercel

Zo krijg je een echte, deelbare URL. Duurt ~5 minuten; je hebt alleen een
(gratis) Vercel-account nodig.

## 1. Databasewachtwoord ophalen

Supabase-dashboard → project **bouwschakel** → Settings → Database →
**Reset database password** → kopieer het wachtwoord.

## 2. Project importeren in Vercel

1. Ga naar https://vercel.com/new en log in met GitHub.
2. Kies de repository **jariwatermulder/ZZP Connect**.
3. Bij "Branch": kies `claude/bouwkracht-platform-design-92ku8q` (of merge die
   eerst naar `main`).
4. Framework wordt automatisch herkend als **Next.js**. Niets aanpassen.

## 3. Environment variables invullen

Voeg deze toe onder "Environment Variables" (vervang `[WACHTWOORD]` door stap 1):

```
DATABASE_URL = postgresql://postgres.pzpegcnvtzamsjqboyxz:[WACHTWOORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL   = postgresql://postgres:[WACHTWOORD]@db.pzpegcnvtzamsjqboyxz.supabase.co:5432/postgres
AUTH_SECRET  = yz9atEsHMLvKm2tP+WgdXhqCs4GjGSt7GFgzOZpNrgNCPrWMvYg9xiVaUsIzbqDP
APP_URL      = https://<jouw-vercel-domein>.vercel.app
```

> Zet `APP_URL` na de eerste deploy op de definitieve Vercel-URL en deploy
> nog een keer (voor correcte metadata/sitemap).

## 4. Deploy

Klik **Deploy**. Vercel draait `npm install` (genereert de Prisma-client) en
`next build`. Na ~1–2 minuten krijg je je URL.

De database (schema, catalogus, RLS) staat al klaar in Supabase, dus de app is
direct bruikbaar. Maak eventueel een admin aan via `docs/ADMIN.md`.

## Alternatief: lokaal bekijken

Zie `docs/DATABASE_SETUP.md` — `npm install`, `.env` invullen, `npm run dev`,
open http://localhost:3000.
