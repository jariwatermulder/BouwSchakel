# BouwSchakel — Product Specificatie

> **Status:** Concept / ter goedkeuring. Dit document is de functionele bron van waarheid vóór de bouw begint.
> Juridische teksten en compliance-claims moeten door een Nederlandse jurist worden gecontroleerd (zie `LEGAL_CONSIDERATIONS.md`).

---

## 1. Productvisie

**BouwSchakel** is een Nederlands digitaal bemiddelingsplatform dat bouwbedrijven en zelfstandige vakmensen (ZZP'ers) rechtstreeks met elkaar verbindt.

**Pay-off:** _De juiste vakman. Op het juiste moment._

**Kernbelofte:** Een bouwbedrijf dat vandaag een vakman nodig heeft, kan via BouwSchakel snel een geschikte, beschikbare en betrouwbare ZZP'er vinden — en een ZZP'er kan snel geschikt werk vinden.

### Positionering (bemiddeling, geen uitzendbureau)

BouwSchakel is **primair een bemiddelingsplatform**. Het platform:

- brengt vraag en aanbod bij elkaar en faciliteert contact;
- sluit **niet** zelf de overeenkomst tot het uitvoeren van werk — die komt tot stand tussen opdrachtgever en ZZP'er;
- treedt **niet** op als werkgever, uitlener of terbeschikkingsteller van arbeidskrachten.

Het onderscheid tussen **bemiddeling**, **tussenkomst** en **terbeschikkingstelling** wordt bewust in productbeslissingen bewaakt (zie `LEGAL_CONSIDERATIONS.md`). Het platform doet geen claims dat het arbeidsrechtelijke compliance automatisch garandeert, maar signaleert risico's en verzamelt relevante informatie.

---

## 2. Doelgroepen & rollen

### A. ZZP'er (vakman)

Timmerman, metselaar, tegelzetter, schilder, stukadoor, loodgieter, elektricien, installateur, dakdekker, grondwerker, stratenmaker, sloper, hovenier, betontimmerman, voorman, uitvoerder en overige bouwgerelateerde zelfstandigen.

Kan o.a. instellen: vakgebieden, specialisaties, jaren ervaring, werkgebied, max. reisafstand, uurtarief, beschikbaarheid, startdatum, eigen bus, eigen gereedschap, certificaten, VCA, verzekeringen, portfolio, referenties, KvK- en bedrijfsgegevens.

### B. Bouwbedrijf / opdrachtgever

Aannemer, bouwbedrijf, renovatiebedrijf, vastgoedonderhoud, installatiebedrijf, projectontwikkelaar, hoveniersbedrijf, dakbedrijf.

Kan o.a.: opdracht plaatsen (vakgebied, locatie, startdatum, duur, tarief, werkzaamheden, vereisten), geschikte ZZP'ers bekijken, kandidaten uitnodigen, berichten sturen, kandidaat selecteren, opdrachten beheren, reviews achterlaten.

### C. Interne rollen (admin)

`SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SUPPORT` — met role-based access control (zie `SECURITY.md`).

---

## 3. Kernprincipe: extreme eenvoud

- Aannemer plaatst een opdracht in **± 2 minuten**.
- ZZP'er maakt een professioneel profiel in **± 5 minuten**.
- **Progressive disclosure:** eerst essentie → dan verificatie → later verrijking.
- Registratie is **hervatbaar**; voortgang wordt veilig opgeslagen. Toon "Profiel compleet: X%".

---

## 4. Merkidentiteit

Professioneel, betrouwbaar, modern, praktisch, Nederlands, bouwgericht. Geen corporate bullshit, geen goedkope vacaturewebsite-look. Voelt als een moderne combinatie van B2B SaaS + marktplaats + recruitmentplatform. **Niet** Indeed, **niet** Marktplaats, **niet** een ouderwets uitzendbureau.

Design: donkerblauw/zwart als basis met één sterke accentkleur, veel witruimte, sterke typografie, subtiele bouwdetails. Zie `ARCHITECTURE.md` §Design system.

---

## 5. Primaire flow (MVP-kern)

Alles wordt rond deze flow ontworpen:

```
ZZP'er registreren → profiel → beschikbaarheid
        ↓
Bedrijf registreren → opdracht plaatsen
        ↓
Matching → kandidaat bekijken → reageren → contact
        ↓
Opdracht → afronden → review
```

**Productregel bij elke feature:** "Helpt dit een bouwbedrijf sneller een geschikte vakman vinden?" of "Helpt dit een ZZP'er sneller geschikt werk vinden?" Zo niet → lage prioriteit.

---

## 6. Pagina's (routes)

### Publiek / algemeen

`/` · `/hoe-het-werkt` · `/tarieven` · `/over-ons` · `/contact` · `/faq`

### ZZP'er

`/zzpers` · `/zzpers/registreren` · `/zzpers/opdrachten` · `/zzpers/opdrachten/[id]` · `/zzpers/profiel` · `/zzpers/dashboard` · `/zzpers/beschikbaarheid` · `/zzpers/documenten` · `/zzpers/instellingen`

### Bedrijven

`/bedrijven` · `/bedrijven/registreren` · `/bedrijven/opdracht-plaatsen` · `/bedrijven/opdrachten` · `/bedrijven/opdrachten/[id]` · `/bedrijven/kandidaten` · `/bedrijven/dashboard` · `/bedrijven/instellingen`

### Juridisch

`/algemene-voorwaarden` · `/privacy` · `/cookies` · `/klachten`

### Publieke SEO-opdrachtpagina's (indexeerbaar)

`/opdrachten/[slug]` — bijv. `/opdrachten/timmerman-groningen`. **Niet** indexeren: privéprofielen, dashboards, berichten (zie `ARCHITECTURE.md` §SEO).

### Admin

`/admin/*` — gebruikers, bedrijven, opdrachten, verificaties, reviews, reports, klachten, statistieken, betalingen, platform- en matchinginstellingen.

---

## 7. Homepage

- **Hero:** "De juiste vakman. Op het juiste moment."
- **Subtekst:** "Vind gecontroleerde ZZP'ers voor bouw, renovatie en installatie. Of vind jouw volgende opdracht."
- **Twee primaire CTA's:** "Ik zoek een vakman" · "Ik zoek een opdracht"
- Secties: hoe het werkt · populaire vakgebieden · voordelen bedrijven · voordelen ZZP'ers · verificatie · reviews · (optioneel) live platformstatistieken.
- **Nooit nepstatistieken.** Geen echte data → placeholders tonen of statistieken verbergen.

---

## 8. ZZP-registratie (multi-step, hervatbaar)

1. Persoonlijke gegevens · 2. Bedrijfsgegevens · 3. Vakgebied · 4. Ervaring · 5. Tarief · 6. Werkgebied · 7. Beschikbaarheid · 8. Materieel · 9. Certificaten · 10. Verificatie · 11. Portfolio.

Toon "Profiel compleet: X%" en welke onderdelen de matchkwaliteit verbeteren. Alleen stap 1–3 (+basis) zijn vereist om zichtbaar te worden; de rest is progressive.

## 9. Bedrijfsregistratie

Bedrijfsnaam, KvK, contactpersoon, e-mail, telefoon, website, bedrijfsomschrijving, regio, type werkzaamheden. Ruimte voor verificatie van bedrijfsgegevens.

## 10. Opdracht plaatsen (snelle wizard, ~2 min)

Vakgebied · specialisatie · locatie · startdatum · einddatum/duur · aantal personen · gewenst uurtarief · werkzaamheden · vereisten · eigen gereedschap gewenst? · certificaten vereist? · contactpersoon.

---

## 11. Matching (kernfunctie)

Zie `MATCHING.md` voor het volledige model. Samengevat:

- Elke ZZP'er krijgt per opdracht een **matchscore** met **uitleg** (geen black box).
- **Harde filters** (uitsluitend/markeren): verkeerd vakgebied, niet beschikbaar, ontbrekende vereiste certificering, tarief volledig buiten budget.
- **Gewogen score** over o.a. vakgebied, specialisatie, beschikbaarheid, locatie/afstand, tarief, ervaring, certificaten, betrouwbaarheid.
- Gewichten en drempels zijn **configureerbaar vanuit admin** — zonder codewijziging.
- MVP = **deterministische** matching. AI-verrijking is later (zie `MATCHING.md` §AI).

## 12. Dashboards

- **ZZP:** begroeting op naam; cards voor profiel-compleetheid, beschikbaarheid, nieuwe opdrachten, reacties, actieve opdrachten, reviews; sectie "Opdrachten voor jou" met matchpercentage + verificatiestatus opdrachtgever.
- **Bedrijf:** cards voor actieve opdrachten, kandidaten, lopende opdrachten, reacties, favorieten; sectie "Beste matches" met naam, vakgebied, afstand, tarief, ervaring, rating, verificatie, matchpercentage.

## 13. ZZP-profielpagina

LinkedIn-achtig maar bouwspecifiek: header (naam, vakgebied, locatie, rating, verificatiebadge) + over mij, ervaring, specialisaties, tarief, beschikbaarheid, werkgebied, certificaten, materiaal, voertuig, portfolio, reviews. **Toon alleen ingevulde informatie.**

---

## 14. Verificatie

Statussen: `NIET_GEVERIFIEERD`, `IN_BEHANDELING`, `GEVERIFIEERD`, `AFGEKEURD`. Types (uitbreidbaar): e-mail, telefoon, KvK, identiteit, certificaten, verzekering.

## 15. Reviews

Na een afgeronde opdracht beoordelen beide partijen elkaar (ZZP↔bedrijf) op kwaliteit, communicatie, betrouwbaarheid, afspraken nakomen. **Alleen** mogelijk bij een bestaande opdrachtrelatie in het platform. Reviews zijn onveranderbaar na publicatie, behalve via moderatie. Geen fake reviews tonen.

## 16. Messaging

Interne 1-op-1 chat gekoppeld aan een opdracht: unread-indicator, timestamps, notificaties, blokkeren/rapporteren. Architectuur geschikt voor realtime.

## 17. Notificaties & e-mail

Notificaties (per-gebruiker voorkeuren): nieuwe passende opdracht, nieuwe reactie, kandidaat geselecteerd, nieuw bericht, opdracht gewijzigd, review ontvangen, verificatie afgerond. Transactionele e-mails voor de belangrijkste ZZP- en bedrijfsgebeurtenissen (zie §21 masterprompt). Nette, professionele templates.

## 18. Admin

Beheer van gebruikers, bedrijven, opdrachten, verificaties, reviews/moderatie, reports, klachten, statistieken, betalingen, platforminstellingen en **matchinginstellingen** (gewichten, min. score, max. afstand, categorieën/skills/certificaten beheren). RBAC.

---

## 19. Businessmodel (bedragen configureerbaar — nooit hardcoded)

- **Primair:** succesfee voor opdrachtgever, bijv. €7,50 per daadwerkelijk gewerkt uur, of vaste bemiddelingsfee.
- **Secundair:** _BouwSchakel Pro_ (bijv. €199/mnd): meerdere gebruikers, lagere fee, prioriteitsmatching, uitgebreide statistieken, favorieten, premium support.
- Betalingsarchitectuur voorbereid voor Mollie/Stripe; implementatie pas ná stabiele kern (zie `ARCHITECTURE.md` §Payments).

## 20. Belangrijkste businessmetric

Niet "aantal geregistreerde gebruikers", maar **succesvolle matches / assignments**. Track: registered/active users, jobs posted, applications, matches, successful assignments, repeat customers, repeat ZZP'ers, average time-to-fill, revenue per assignment.

---

## 21. UX & kwaliteit

Mobile-first (veel ZZP'ers gebruiken telefoon), snel, weinig klikken, grote CTA's, goede foutmeldingen, duidelijke empty/loading/skeleton states, toegankelijk, responsive, consistente componenten (design system). Foutmeldingen zijn mensvriendelijk ("Er ging iets mis bij het plaatsen van je opdracht. Je gegevens zijn bewaard. Probeer het opnieuw."), nooit stack traces.

## 22. Data-integriteit

Seed data mag in development, altijd duidelijk gemarkeerd. **Nooit** fake reviews/aantallen/verificaties/bedrijven als echt tonen. Productie toont echte data.

## 23. Definition of Done (per feature)

Frontend werkt · backend werkt · database klopt · authorization klopt · validation werkt · error handling werkt · mobile responsive · tests aanwezig · lint clean · typecheck clean · documentatie bijgewerkt.

## 24. Toekomst (architectuur moet dit niet blokkeren)

Mobiele app, push, AI-matching, automatische profielanalyse, documentverificatie, KvK-API, agenda-integratie, routeberekening, urenregistratie, digitale opdrachtbevestiging, facturatie, escrow/payment, abonnementen, teamaccounts, publieke API, partnerintegraties.
