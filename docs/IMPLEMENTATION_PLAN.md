# BouwSchakel — Implementatieplan

> Volgorde, fasen en Definition of Done. **Er wordt niet blind doorgebouwd:** na elke fase volgt tests + lint + typecheck + database/security/UX-controle + documentatie. Werkt iets niet, dan wordt het gefixt vóór de volgende fase.

---

## 0. Vóór FASE 1 — GO-beslissingen

**Bevestigd door opdrachtgever (2026-08-22):**

1. **Code-locatie: APARTE REPOSITORY** — `jariwatermulder/bouwschakel`. Het platform staat volledig los van de website jwhoutentuinbouw.nl en van de `JWHout-Tuinbouw`-repo. De bestaande statische site blijft ongemoeid.
2. **Productnaam: BouwSchakel** (voorheen werktitel "BouwKracht"). Pay-off ongewijzigd: _De juiste vakman. Op het juiste moment._
3. **Database-host: LATER TE BESLISSEN.** PostgreSQL + Prisma staan vast (Prisma 6 als ORM). De concrete host (Supabase / Vercel Postgres / Neon / anders) wordt vóór deployment gekozen. FASE 1 is opgezet tegen een generieke Postgres.

**Nog te bevestigen bij aanvang latere fasen:**

4. **Providers** (later te activeren): e-mail (bijv. Resend/Postmark), storage (bijv. Supabase Storage/S3), geocoding, payments (Mollie). Alleen interfaces in MVP; keuzes vast te leggen.

**Status:** FASE 1 t/m FASE 6 zijn **gebouwd en geverifieerd** — Foundation, ZZP-registratie & profiel, Bedrijven & opdracht plaatsen, Matching, Interactie (reacties → selecteren → assignment, messaging, notificaties), en Reviews & reputatie (beide richtingen na een afgeronde opdracht; reputatie voedt de matching-betrouwbaarheid). De database draait op een apart Supabase-project (zie `DATABASE_SETUP.md`). Volgende stap: FASE 7 (Admin & moderatie).

---

## FASE 1 — Foundation

- Next.js + TypeScript (strict) + Tailwind opzetten in de gekozen subdirectory.
- Tooling: ESLint, Prettier, tsconfig strict, gedeelde Zod-conventie, testrunner (Vitest/Jest) + Playwright (e2e).
- `.env.example` met uitleg; secrets-conventie.
- Prisma + Postgres-verbinding; eerste migratie (User, rollen).
- Auth (e-mail/wachtwoord + magic link), sessies, RBAC-helper.
- Design system: tokens + basiscomponenten (Button, Card, Input, Badge, Stepper, Toast, EmptyState, Skeleton) + app-layout (mobile-first).
- Basisroutes/skeletons voor publieke pagina's.
- **Checks:** tests (auth/rbac), lint, typecheck, migratie draait, security-basis. Documentatie bijwerken.

## FASE 2 — ZZP'er

- Multi-step, hervatbare registratie (11 stappen) met opslag van voortgang + "Profiel compleet: X%".
- Profielpagina (alleen ingevulde info), beschikbaarheid, documenten (upload + validatie + signed URLs), portfolio.
- **Checks** + docs.

## FASE 3 — Bedrijven

- Bedrijfsregistratie + bedrijfsprofiel + teamleden (CompanyMember).
- Opdracht plaatsen (snelle wizard, ~2 min) + opdrachten beheren (status).
- **Checks** + docs.

## FASE 4 — Matching

- Deterministische matching engine (`server/matching`) volgens `MATCHING.md`: kandidaatselectie → harde filters → gewogen scoring → uitleg.
- Configureerbare gewichten/drempels via `MatchingSetting`.
- Kandidatenlijst (bedrijf) en "Opdrachten voor jou" (ZZP) met matchpercentage + uitleg.
- **Checks:** unit-tests op filters/subscores/sortering (incl. "30 km beschikbaar > 5 km niet-beschikbaar"). Docs.

## FASE 5 — Interactie

- Reacties/uitnodigingen (Application), kandidaatselectie (→ Assignment).
- Interne messaging (per opdracht), unread, blokkeren/rapporteren; architectuur realtime-klaar.
- Notificaties (in-app + e-mail) met per-gebruiker voorkeuren.
- **Checks** + docs.

## FASE 6 — Reviews

- Reviews na afgeronde Assignment (beide richtingen), 4 categorieën, onveranderbaar na publicatie, anti-manipulatie (alleen bij bestaande relatie), reputatie voedt matching-betrouwbaarheid.
- **Checks** + docs.

## FASE 7 — Admin

- Beheer gebruikers/bedrijven/opdrachten; verificatie-workflow; reviews/reports/klachten-moderatie; analytics-dashboard; **matchinginstellingen** (gewichten/drempel/afstand/skills/certificaten) zonder codewijziging.
- RBAC voor SUPER_ADMIN/ADMIN/MODERATOR/SUPPORT.
- **Checks** + docs.

## FASE 8 — Payments

- `PaymentProvider`-interface + Mollie-implementatie; fees/abonnementen configureerbaar (`PricingSetting`); Invoice/Payment-flow; succesfee-berekening op basis van Assignment-uren.
- **Checks:** tests op fee-/betaalberekeningen. Docs.

## FASE 9 — Security & privacy hardening

- Security-audit + authorization-audit (elke route/actie), rate limiting, file-upload-audit, privacy-audit (export/verwijderen/bewaartermijnen).
- **Checks** + docs (`SECURITY.md` bijwerken met bevindingen).

## FASE 10 — Launch

- SEO (metadata/OG/sitemap/robots/canonical/structured data; publieke `/opdrachten/[slug]`), performance, monitoring, error tracking, backups, productie-deploy.
- Productie-guard: **seed data nooit in productie** (env-check + `isSeed`-markering + aparte seed-command die in productie weigert).

---

## Seed data (development)

`prisma/seed.ts`: ~30 ZZP'ers, 10 bedrijven, 30 opdrachten, ~100 matches, reviews, certificaten, beschikbaarheden — realistische NL-data, duidelijk gemarkeerd. Nooit als echte data tonen; geblokkeerd in productie.

## Teststrategie (kritieke functionaliteit)

Unit/integration: authenticatie, authorization, registratie, opdracht plaatsen, matching, reactie, messaging, reviews, verificatie, permissions, payment-berekeningen.
End-to-end (Playwright): (1) ZZP registreren → (2) bedrijf registreren → (3) opdracht plaatsen → (4) matching → (5) ZZP reageert → (6) bedrijf selecteert → (7) opdracht afronden → (8) review plaatsen.

## Definition of Done (per feature)

Frontend + backend + database + authorization + validation + error handling + mobile responsive + tests + lint clean + typecheck clean + documentatie bijgewerkt.

## Codekwaliteit

TypeScript strict; geen `any` tenzij noodzakelijk; geen duplicatie; kleine componenten/functies; duidelijke naming; geen ongebruikte imports; geen `console.log` in productie; linting + formatting afgedwongen.

## MVP-focus

De eerste echte match tussen bedrijf en ZZP'er is het doel. Alles buiten de primaire flow (`PRODUCT_SPEC.md` §5) heeft lagere prioriteit. Payments, uitgebreide admin-analytics en niet-essentiële features komen ná een werkende kernflow.

---

## Wachtstatus

Documentatie (FASE 0) is gereed. **Wachten op "GO"** vóór FASE 1. Bij "GO" start FASE 1 (Foundation).
