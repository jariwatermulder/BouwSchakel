# Inloggen met Google en Apple

Beide werken via OpenID Connect (authorization code flow) bovenop het eigen
sessiesysteem; er is geen externe auth-bibliotheek. De knoppen op /inloggen en
/registreren verschijnen automatisch zodra de omgevingsvariabelen van een
provider zijn gezet.

## Hoe het werkt

1. De bezoeker klikt "Inloggen met Google" (of "Registreren met …" op de
   registratiepagina, dan gaan de gekozen rol en het akkoord met de voorwaarden mee).
2. `POST /api/auth/oauth/{provider}/start` zet een ondertekende state-cookie
   (state, nonce, PKCE-verifier, rol, akkoord, terugkeerpad; 10 minuten geldig) en
   stuurt door naar de provider.
3. De provider stuurt terug naar `/api/auth/oauth/{provider}/callback`
   (Google: GET, Apple: POST). De route controleert de state, wisselt de code in
   voor een ID-token en verifieert dat token (handtekening via JWKS, issuer,
   audience, nonce).
4. Daarna, in `src/server/auth/oauth.ts`:
   - bekende koppeling (provider + sub) → inloggen;
   - bestaand account met hetzelfde, door de provider bevestigde e-mailadres → koppelen en inloggen;
   - anders een nieuw account, alleen met gekozen rol én akkoord (vanaf de
     registratiepagina). Vanaf de inlogpagina krijgt de bezoeker de melding
     "nog geen account" en registreert bewust.
5. Nieuwe accounts gaan naar de profielwizard (zzp'er) of het bedrijfsprofiel
   (opdrachtgever). Consent wordt net als bij e-mail/wachtwoord in de auditlog vastgelegd.

Koppelingen staan in de tabel `OAuthAccount`. Een account zonder wachtwoord kan
altijd via "wachtwoord vergeten" alsnog een wachtwoord instellen.

## Google instellen

1. Ga naar https://console.cloud.google.com → APIs & Services → Credentials.
2. Maak (indien nodig) een OAuth consent screen aan (External, app-naam "ZZP Schakel",
   support-e-mail, privacy-URL `https://<domein>/privacy`).
3. Create credentials → OAuth client ID → Web application.
   - Authorized JavaScript origins: `https://<domein>`
   - Authorized redirect URIs: `https://<domein>/api/auth/oauth/google/callback`
   (voeg voor lokaal testen ook `http://localhost:3000/api/auth/oauth/google/callback` toe)
4. Zet op Vercel: `GOOGLE_CLIENT_ID` en `GOOGLE_CLIENT_SECRET`.

## Apple instellen

Vereist een betaald Apple Developer-account.

1. https://developer.apple.com/account → Certificates, Identifiers & Profiles.
2. Identifiers → App ID aanmaken (bijv. `nl.zzpschakel.app`) met capability "Sign In with Apple".
3. Identifiers → Services ID aanmaken (bijv. `nl.zzpschakel.web`), "Sign In with Apple"
   inschakelen en configureren:
   - Primary App ID: het App ID van stap 2
   - Domains: `<domein>`
   - Return URLs: `https://<domein>/api/auth/oauth/apple/callback`
   Apple accepteert geen localhost; test Apple dus op een echte (preview)domeinnaam.
4. Keys → nieuwe key met "Sign In with Apple", gekoppeld aan het App ID. Download het
   `.p8`-bestand (kan maar één keer) en noteer de Key ID.
5. Zet op Vercel:
   - `APPLE_CLIENT_ID` = de Services ID (bijv. `nl.zzpschakel.web`)
   - `APPLE_TEAM_ID` = je Team ID (rechtsboven in het developer-account)
   - `APPLE_KEY_ID` = de Key ID van stap 4
   - `APPLE_PRIVATE_KEY` = de volledige inhoud van het `.p8`-bestand (regeleinden mogen als `\n`)

Apple geeft het e-mailadres alleen bij de eerste autorisatie; wij halen het uit het
ID-token, dus dat is voldoende. Gebruikers kunnen kiezen voor "Verberg mijn e-mail";
ze krijgen dan een relay-adres (`@privaterelay.appleid.com`) dat gewoon als
e-mailadres van het account dient.

## Controleren

- Zonder variabelen: geen knoppen (`enabledProviders()` is leeg).
- Met variabelen: knoppen zichtbaar; `POST /api/auth/oauth/google/start` antwoordt
  met een 303 naar accounts.google.com inclusief `state`, `nonce` en `code_challenge`.
- Een callback met verkeerde of ontbrekende state landt op `/inloggen?fout=oauth`.
- Unit tests: `tests/oauth.test.ts`.
