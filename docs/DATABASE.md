# ZZP Connect — Databaseontwerp

> PostgreSQL + Prisma. Dit document beschrijft het relationele model, sleutelrelaties en indexes. Definitieve `schema.prisma` volgt in FASE 1.

---

## 1. Uitgangspunten

- Robuust relationeel model met duidelijke foreign keys en `ON DELETE`-gedrag.
- Indexes op alle veelgebruikte zoek-/filtervelden (vakgebied, locatie/geo, beschikbaarheid, status).
- UUID's als primary keys; `createdAt`/`updatedAt` op elke tabel; soft-delete (`deletedAt`) waar AVG/audit dat vraagt.
- Enums voor statussen en rollen (type-safe).
- Geld in **integer-centen** (nooit floats). Bedragen/fees configureerbaar (niet hardcoded).
- Geen onnodige persoonsgegevens; documenttoegang beperkt (zie `SECURITY.md`, `LEGAL_CONSIDERATIONS.md`).

---

## 2. Enums (indicatief)

```
UserRole            ZZP | COMPANY | ADMIN
AdminRole           SUPER_ADMIN | ADMIN | MODERATOR | SUPPORT
VerificationStatus  NIET_GEVERIFIEERD | IN_BEHANDELING | GEVERIFIEERD | AFGEKEURD
VerificationType    EMAIL | TELEFOON | KVK | IDENTITEIT | CERTIFICAAT | VERZEKERING
JobStatus           CONCEPT | GEPUBLICEERD | GESLOTEN | VERVULD | VERLOPEN | GEANNULEERD
ApplicationStatus   NIEUW | BEKEKEN | UITGENODIGD | AFGEWEZEN | GEACCEPTEERD | INGETROKKEN
AssignmentStatus    GEPLAND | ACTIEF | AFGEROND | GEANNULEERD | GESCHIL
InvoiceStatus       CONCEPT | OPEN | BETAALD | MISLUKT | GECREDITEERD
PaymentStatus       IN_AFWACHTING | GESLAAGD | MISLUKT | GEREFUND
NotificationType    NIEUWE_MATCH | NIEUWE_REACTIE | GESELECTEERD | NIEUW_BERICHT | OPDRACHT_GEWIJZIGD | REVIEW_ONTVANGEN | VERIFICATIE_AFGEROND
ReviewDirection     ZZP_NAAR_BEDRIJF | BEDRIJF_NAAR_ZZP
```

---

## 3. Entiteiten & relaties

### Identiteit & profielen

- **User** — auth-identiteit. `id, email(uniek), passwordHash, role(UserRole), status, emailVerifiedAt, lastLoginAt, createdAt/updatedAt`. 1–1 met ZZPProfile óf gekoppeld aan Company via CompanyMember.
- **ZZPProfile** — `userId(uniek), voornaam, achternaam, bedrijfsnaam?, kvkNummer?, over, jarenErvaring, uurtariefCents, werkgebiedCentrum(lat/lng), maxReisafstandKm, eigenBus(bool), eigenGereedschap(bool), vca(bool), profielCompleetheidPct, verificatieStatus, ...`. Geo-velden geïndexeerd.
- **Company** — `naam, kvkNummer(uniek?), omschrijving, website?, telefoon?, regio, verificatieStatus, ...`.
- **CompanyMember** — koppelt User ↔ Company met een rol binnen het bedrijf (owner/lid) t.b.v. teamaccounts. `(companyId, userId)` uniek.

### Vaardigheden & certificering (admin-beheerd)

- **Skill** (vakgebied) — `naam, slug`. Admin-beheerbaar.
- **Specialization** — behoort tot Skill (`skillId`).
- **Certification** — cataloguswaarde (bijv. VCA). Admin-beheerbaar.
- **ZZPSkill** (n–n) — ZZPProfile ↔ Skill (+ optioneel ervaringsniveau).
- **ZZPSpecialization** (n–n) — ZZPProfile ↔ Specialization.
- **ZZPCertification** — ZZPProfile ↔ Certification (+ geldig tot, documentref, verificatiestatus).

### Beschikbaarheid, documenten, portfolio

- **Availability** — ZZPProfile-beschikbaarheid: `van, tot, type(fulltime/parttime/incidenteel), status`. Geïndexeerd op datumrange voor matching.
- **Document** — geüpload bestand: `ownerUserId, type, opslagKey, mime, grootte, verificatieStatus`. Alleen metadata; bestand in object storage.
- **PortfolioItem** — ZZP-portfolio: titel, omschrijving, afbeeldingref(s).
- **Verification** — verificatieaanvraag/-resultaat: `subject(user/company), type(VerificationType), status, behandeldDoor(adminId?), notitie, documentId?`.

### Opdrachten & matching

- **Job** (opdracht) — `companyId, skillId, specializationId?, titel, slug(uniek), omschrijving, locatie(adres+lat/lng), startdatum, einddatum?/duurDagen?, aantalPersonen, gewenstUurtariefCents, eigenGereedschapGewenst, status(JobStatus), contactpersoon, publiekIndexeerbaar(bool)`. Indexes op `skillId`, geo, `startdatum`, `status`, `slug`.
- **JobRequirement** — vereisten per opdracht (bijv. vereist certificaat) → `jobId, certificationId? / vrijeTekst, hard(bool)`.
- **Match** — berekende match ZZP↔Job: `jobId, zzpProfileId, score(0–100), subscoresJson, hardeFilterUitslagJson, berekendOp`. `(jobId, zzpProfileId)` uniek; index op `score`. Kan gecachet/geherbereken worden.
- **Application** (reactie) — ZZP reageert of wordt uitgenodigd: `jobId, zzpProfileId, status(ApplicationStatus), bericht?, uurtariefVoorstelCents?, richting(sollicitatie/uitnodiging)`. `(jobId, zzpProfileId)` uniek.
- **Assignment** — daadwerkelijke opdrachtrelatie na selectie: `jobId, zzpProfileId, companyId, status(AssignmentStatus), startdatum, einddatum?, gewerkteUren?`. Bron voor fee-berekening en review-rechten.

### Interactie

- **Conversation** — gekoppeld aan een Job en de twee partijen: `jobId?, companyId, zzpProfileId`. Uniek per (job, company, zzp).
- **Message** — `conversationId, senderUserId, body, gelezenOp?`. Index op `conversationId, createdAt`.
- **Favorite** — Company ↔ ZZPProfile (favoriete zzp'ers).
- **Review** — `assignmentId, richting(ReviewDirection), auteurUserId, scoreKwaliteit, scoreCommunicatie, scoreBetrouwbaarheid, scoreAfspraken, toelichting, gepubliceerdOp`. **Alleen** aanmaakbaar bij bestaande Assignment; onveranderbaar na publicatie (behalve moderatie). `(assignmentId, richting)` uniek.

### Notificaties & voorkeuren

- **Notification** — `userId, type(NotificationType), payloadJson, gelezenOp?`. Index op `userId, createdAt`.
- **NotificationPreference** — per user per kanaal (in-app/e-mail) per type aan/uit.

### Betalingen (voorbereid, later actief)

- **Invoice** — `companyId, assignmentId?, bedragCents, status(InvoiceStatus), regelsJson, uitgegevenOp`.
- **Payment** — `invoiceId?, provider, providerRef, bedragCents, status(PaymentStatus)`.
- **PricingSetting** — configureerbare fees/abonnementsprijzen (key/value, versiebeheerd).

### Moderatie, admin & platform

- **Report** — melding over user/opdracht/bericht/review: `melderUserId, subjectType, subjectId, reden, status`.
- **Complaint** (klacht) — formele klacht t.b.v. `/klachten`.
- **AuditLog** — `actorUserId?, actie, subjectType, subjectId, metaJson, ip?, createdAt`. Append-only.
- **MatchingSetting** — configureerbare gewichten/drempels voor de matching engine (zie `MATCHING.md`), versiebeheerd, wijzigbaar via admin.
- **PlatformSetting** — overige platform-instellingen (key/value).

---

## 4. Sleutel-indexes (voor performance op schaal)

- `Job(skillId, status)`, `Job(startdatum)`, `Job(slug)`, geo-index op `Job(lat,lng)` en `ZZPProfile(lat,lng)`.
- `Availability(zzpProfileId, van, tot)`.
- `Match(jobId, score DESC)`, `Match(zzpProfileId)`.
- `Application(jobId, status)`, `Application(zzpProfileId)`.
- `Message(conversationId, createdAt)`, `Notification(userId, createdAt)`.
- Unieke constraints zoals hierboven benoemd om dubbele matches/applications/reviews te voorkomen.

## 5. Geo-strategie

Adres → geocoding → `lat/lng` opgeslagen. Afstand ZZP↔Job via haversine (of PostGIS later). `maxReisafstandKm` en opdrachtlocatie samen bepalen de locatie-subscore/harde filter in matching.

## 6. Migraties & seed

- Migraties via `prisma migrate`. Elke schemawijziging = nieuwe migratie (geen handmatige DB-edits).
- **Seed** (`prisma/seed.ts`): ~30 ZZP'ers, 10 bedrijven, 30 opdrachten, ~100 matches, reviews, certificaten, beschikbaarheden — realistische NL-data. Seed-records **gemarkeerd** (bijv. `isSeed = true` of aparte omgeving) zodat ze nooit als echte data in productie verschijnen. Zie `IMPLEMENTATION_PLAN.md` voor de productie-guard.
