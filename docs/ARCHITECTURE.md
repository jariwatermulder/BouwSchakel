# ZZP Connect — Architectuur

> Zie ook: `PRODUCT_SPEC.md`, `DATABASE.md`, `MATCHING.md`, `SECURITY.md`, `LEGAL_CONSIDERATIONS.md`, `IMPLEMENTATION_PLAN.md`.

---

## 1. Uitgangssituatie repository

De huidige repository bevat een **statische HTML/CSS/JS-website voor "JW Hout & Tuinbouw"** (een hoveniersbedrijf) — geen build-tool, geen framework, geen `package.json`. Deze site is functioneel losstaand van ZZP Connect.

**Aanbeveling:** ZZP Connect wordt gebouwd als een nieuwe Next.js-applicatie in een subdirectory (`/app` op repo-niveau, of `/bouwschakel`) zodat de bestaande statische site niet breekt. De keuze tussen (a) ZZP Connect náást de bestaande site of (b) ZZP Connect als vervanging is een **beslissing die vóór FASE 1 door de opdrachtgever wordt bevestigd**. Tot die bevestiging blijft de bestaande site ongemoeid.

---

## 2. Technische stack

| Laag       | Keuze                                                                          | Toelichting                                              |
| ---------- | ------------------------------------------------------------------------------ | -------------------------------------------------------- |
| Framework  | **Next.js (App Router)**                                                       | SSR/SSG + API/route handlers + server components         |
| Taal       | **TypeScript (strict)**                                                        | geen `any` tenzij absoluut nodig                         |
| UI         | **React + Tailwind CSS**                                                       | + eigen design system / component library                |
| Validatie  | **Zod**                                                                        | gedeeld tussen client en server (single source of truth) |
| Forms      | **React Hook Form**                                                            | + Zod resolver                                           |
| ORM        | **Prisma**                                                                     | migraties, type-safe queries                             |
| Database   | **PostgreSQL**                                                                 | zie noot Supabase hieronder                              |
| Auth       | Moderne, veilige auth (e-mail/wachtwoord + magic link; OAuth later voorbereid) | server-side sessies; zie `SECURITY.md`                   |
| Storage    | Object storage (documenten/foto's)                                             | signed URLs, geen publieke buckets voor privédocumenten  |
| E-mail     | Transactionele e-mailprovider                                                  | templates, per-gebruiker voorkeuren                      |
| Geo        | Geocoding + afstandsberekening                                                 | provider-agnostisch achter een service-interface         |
| Payments   | Mollie/Stripe (later)                                                          | achter een `PaymentProvider`-interface                   |
| Deployment | Vercel of vergelijkbaar                                                        |                                                          |

**State:** zo weinig mogelijk globale client-state; server state waar mogelijk (server components, server actions / route handlers, caching via Next.js).

### Noot: PostgreSQL / Supabase

De masterprompt specificeert **PostgreSQL + Prisma**. In deze omgeving is een **Supabase**-MCP beschikbaar; Supabase levert een managed PostgreSQL en kan als database-host dienen terwijl Prisma de ORM/migratielaag blijft. Auth/Storage/Realtime van Supabase zijn optioneel bruikbaar, maar om vendor lock-in te beperken houden we deze achter eigen service-interfaces. **Definitieve keuze database-host is een GO-beslissing** (zie `IMPLEMENTATION_PLAN.md`).

---

## 3. Domeingedreven mappenstructuur

Geen monolithische spaghetti. Duidelijke domeinen, herbruikbare services:

```
src/
  app/                      # Next.js App Router (routes = dun; roepen services aan)
    (public)/               # /, hoe-het-werkt, tarieven, over-ons, contact, faq, juridisch
    (zzp)/zzpers/...
    (bedrijf)/bedrijven/...
    opdrachten/[slug]/      # publieke SEO-opdrachtpagina's
    admin/...
    api/                    # route handlers waar nodig (webhooks, uploads)
  server/                   # server-only domeinlogica
    auth/
    users/
    companies/
    jobs/
    matching/
    applications/
    assignments/
    reviews/
    messaging/
    notifications/
    payments/
    verification/
    admin/
    analytics/
  lib/                      # cross-cutting: db (prisma client), zod-schemas, geo, email, storage, rbac, ratelimit, logger
  components/               # design system + feature components
  emails/                   # transactionele e-mailtemplates
prisma/
  schema.prisma
  migrations/
  seed.ts
docs/
tests/                      # unit + integration + e2e
```

**Regel:** routes/pagina's bevatten geen businesslogica — ze valideren input (Zod), checken authorization (RBAC) en delegeren naar `server/<domein>`-services. Services zijn testbaar los van HTTP.

---

## 4. API-architectuur

- **Server Components + Server Actions** voor de meeste lees/schrijf-flows binnen de app.
- **Route handlers (`app/api/*`)** voor: webhooks (payment/email), file uploads, en toekomstige publieke API.
- Elke schrijfactie: (1) authenticatie, (2) authorization/RBAC, (3) Zod-validatie, (4) service-call, (5) audit log waar relevant.
- Consistente foutafhandeling: getypeerde domeinfouten → nette gebruikersboodschap; technische details alleen server-side gelogd.
- Rate limiting op gevoelige endpoints (auth, uploads, messaging) — zie `SECURITY.md`.

---

## 5. Matching-architectuur (samenvatting)

De matching engine is een **pure, deterministische service** (`server/matching`) met configureerbare gewichten/drempels uit de database (admin). Harde filters vóór scoring; gewogen subscores mét uitleg. Zie `MATCHING.md`. Ontworpen zodat AI-verrijking later inplugbaar is zonder de kern te herschrijven.

---

## 6. Notificatie-architectuur

- Domeingebeurtenissen (bijv. `JobPublished`, `ApplicationCreated`, `CandidateSelected`, `MessageSent`, `ReviewReceived`, `VerificationCompleted`) worden door services uitgezonden.
- Een `notifications`-service vertaalt events naar (a) in-app notificaties en (b) e-mails, met inachtneming van **per-gebruiker voorkeuren**.
- Verzending asynchroon/idempotent voorbereid (queue-interface), zodat schaal en retries later mogelijk zijn.

---

## 7. Betalingsarchitectuur

- `PaymentProvider`-interface (charge, refund, subscription, webhook-verificatie) met later een Mollie/Stripe-implementatie.
- Bedragen/fees/abonnementsprijzen **configureerbaar** (DB/settings), nooit hardcoded.
- Entiteiten `Invoice`/`Payment` bestaan in het datamodel; flow wordt pas geïmplementeerd als de kern stabiel is (FASE 8).

---

## 8. Design system

- Basis: donkerblauw/zwart met één sterke accentkleur; veel witruimte; strakke typografie; subtiele bouwdetails.
- Herbruikbare componenten: Button, Card, Badge (verificatie/match), Input/Select/Combobox, Stepper (multi-step registratie), Avatar, Rating, MatchScore (met uitleg), EmptyState, Skeleton, Toast, Modal, DataTable (admin).
- Tokens (kleur/spacing/typografie/radius) centraal; light/dark waar zinvol; WCAG-contrast.
- Mobile-first; consistente breakpoints.

---

## 9. SEO

- Metadata + Open Graph per pagina; canonical URLs; `sitemap.xml`; `robots.txt`; structured data waar relevant.
- **Indexeerbaar:** publieke opdrachtpagina's `/opdrachten/[slug]` (bijv. `schoonmaker-groningen`).
- **Niet indexeren:** privéprofielen, dashboards, interne berichten, admin — via `robots` meta + route-segmentatie.
- Geen persoonsgegevens in publieke/indexeerbare content.

---

## 10. Performance

Snelle first load; minimale JS; image optimization; lazy loading; SSR/SSG waar nuttig; geoptimaliseerde DB-queries met indexes; pagination; caching waar logisch. Geen onnodige libraries.

---

## 11. Analytics

Privacyvriendelijke analytics. Product-events: registratie gestart/afgerond, opdracht geplaatst/bekeken, reactie geplaatst, match bekeken, kandidaat geselecteerd, opdracht afgerond, review geplaatst. Admin-dashboard met de businessmetrics uit `PRODUCT_SPEC.md` §20.

---

## 12. Schaalbaarheidsstrategie

- Ontworpen richting 100k+ gebruikers, miljoenen records: correcte indexes (zie `DATABASE.md`), pagination overal, geen N+1 (Prisma `include`/`select` bewust), read-paden cacheen.
- Zware/asynchrone taken (e-mail, matching-herberekening, geocoding) achter een queue-interface zodat een echte worker/queue later inplugbaar is.
- Stateless app-servers (sessies/opslag extern) → horizontaal schaalbaar.
- Object storage voor bestanden (niet in DB); DB alleen metadata + signed-URL-referenties.
