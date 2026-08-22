# BouwSchakel — Securitymodel

> Security is geen bijzaak. Elke API-route/server-actie wordt gecontroleerd op authenticatie én authorization. Een verborgen frontend-knop is nooit voldoende beveiliging.

---

## 1. Authenticatie

- E-mail/wachtwoord + magic link; OAuth later voorbereid.
- Wachtwoorden gehasht met een sterk, salted algoritme (argon2id of bcrypt met hoge cost). Nooit plaintext, nooit reversibel.
- Veilige sessies: httpOnly + Secure + SameSite cookies; korte levensduur + rotatie; server-side sessieverificatie.
- E-mailverificatie vereist voor gevoelige acties; wachtwoordreset via kortlevende, eenmalige tokens.
- Bruteforce-bescherming: rate limiting + account lockout/backoff op login en reset.

## 2. Authorization (RBAC)

- Rollen: `ZZP`, `COMPANY` (met CompanyMember-subrollen voor teams), en admin-rollen `SUPER_ADMIN | ADMIN | MODERATOR | SUPPORT`.
- **Least privilege**: elke actie vereist de minimaal benodigde rol/eigenaarschap.
- **Ownership checks**: een gebruiker kan alleen eigen resources lezen/wijzigen (eigen profiel, eigen opdrachten, eigen berichten). Bedrijfsleden alleen binnen hun Company.
- Autorisatie gebeurt **server-side** in de servicelaag (niet alleen in de UI), centraal via een `rbac`-helper. Elke route handler / server action begint met auth + authorization.

## 3. Input & output

- **Validatie** met Zod op elke server-invoer (gedeelde schemas client/server).
- **XSS-preventie**: geen `dangerouslySetInnerHTML` met ongevalideerde data; user content escapen/saneren.
- **SQL-injection**: uitsluitend via Prisma (geparametriseerde queries); geen string-geconcateneerde SQL.
- **CSRF**: SameSite-cookies + waar nodig CSRF-tokens/Origin-checks op state-changing endpoints.
- **Mass assignment** voorkomen: expliciete allowlists van velden per mutatie.

## 4. File uploads

- Toegestane MIME-types en extensies **allowlisten**; MIME-sniffing verifiëren (niet vertrouwen op client-content-type).
- Maximale bestandsgrootte afdwingen; bestandsnamen saneren; opslaan in object storage (niet in webroot).
- Privédocumenten via **signed URLs** met korte geldigheid; geen publieke buckets voor identiteits-/verzekerings-/certificaatdocumenten.
- Antivirus/scan-hook voorbereid.

## 5. Rate limiting & misbruik

- Rate limiting op auth, registratie, uploads, messaging, en publieke zoek-endpoints.
- Blokkeren/rapporteren in messaging; abuse reports naar moderatie.

## 6. Secrets & configuratie

- Secrets uitsluitend via environment variables (`.env`, niet gecommit). `.env.example` met uitleg, zonder echte waarden.
- **Geen** API keys of gevoelige config in client-code/bundle. Server-only code strikt gescheiden.
- Geen gevoelige data naar de frontend die de gebruiker niet mag zien.

## 7. Audit logging

- `AuditLog` (append-only) voor beveiligings-/beheergevoelige acties: login-events, rolwijzigingen, verificatiebesluiten, moderatie, wijziging matching-/platforminstellingen, betalingsacties.
- Logging zonder onnodige persoonsgegevens (zie AVG hieronder).

## 8. Foutafhandeling & logging

- Gebruikers zien nette meldingen, **nooit** stack traces of interne details.
- Technische details alleen server-side gelogd; gevoelige velden gemaskeerd.
- Consistente, getypeerde domeinfouten.

## 9. AVG / Privacy (privacy-by-design)

- **Dataminimalisatie**: alleen verzamelen/verwerken wat nodig is; geen persoonsgegevens gebruiken voor matching die daarvoor niet nodig zijn.
- **Toestemming** waar vereist; duidelijke doelbinding; cookie consent.
- **Rechten van betrokkenen**: account verwijderen (recht op vergetelheid), gegevens exporteren (dataportabiliteit), privacyvoorkeuren.
- **Bewaartermijnen** voorbereiden; **documenttoegang** strikt beperken tot bevoegden.
- Logging beperkt tot noodzakelijke gegevens.
- Zie `LEGAL_CONSIDERATIONS.md` voor juridische context; juridische teksten worden door een NL-jurist gecontroleerd.

## 10. Transport & headers

- HTTPS overal; HSTS. Security headers (CSP, X-Content-Type-Options, Referrer-Policy, Frame-Options) waar passend.

## 11. Security-checklist per feature (Definition of Done)

- [ ] Authenticatie vereist waar nodig
- [ ] Authorization/ownership server-side gecontroleerd
- [ ] Alle input Zod-gevalideerd
- [ ] Geen gevoelige data lek naar client
- [ ] Rate limiting waar relevant
- [ ] Audit log waar relevant
- [ ] Uploads gevalideerd (type/grootte/opslag/signed URL)
- [ ] Foutmeldingen zonder interne details
