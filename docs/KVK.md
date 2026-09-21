# KvK-controle

Het KvK-nummer is verplicht voor zzp'ers en opdrachtgevers. De site controleert
het nummer op twee niveaus:

1. **Formaat** (altijd): precies 8 cijfers. Spaties, punten en streepjes worden
   automatisch weggehaald ("12 345 678" wordt "12345678").
2. **Handelsregister** (als `KVK_API_KEY` is gezet): het nummer wordt opgezocht
   via de officiële KvK Zoeken API. Staat het nummer er niet in, dan kan het
   formulier niet worden opgeslagen. Bij een treffer bewaren we de gevonden
   bedrijfsnaam en het tijdstip (`kvkNaam`, `kvkGecontroleerdOp`), zichtbaar
   voor beheerders onder Beheer → Verificaties en Beheer → Bedrijven.

Zonder sleutel, of als de KvK-API tijdelijk niet antwoordt, valt de controle
terug op alleen het formaat. Een storing bij de KvK blokkeert dus nooit een
registratie; het profiel krijgt dan geen "gecontroleerd"-markering.

## In het formulier

Het KvK-veld (`src/components/kvk-veld.tsx`) controleert automatisch zodra er
8 cijfers staan, en heeft een knop "Controleer". Bij een treffer verschijnt
"Gevonden in het Handelsregister: <naam>, <plaats>" en een knop om die naam in
het veld Bedrijfsnaam over te nemen. De controle loopt via de server action
`controleerKvkAction` (alleen ingelogd, max. 30 controles per 10 minuten per
gebruiker). Resultaten worden 24 uur gecachet.

## Sleutel aanvragen

1. Maak een account op https://developers.kvk.nl en vraag toegang aan tot de
   **KVK Zoeken API** (Handelsregister). Dit is een betaalde dienst van de KvK
   met een prijs per bevraging; zie de actuele tarieven op de KvK-site.
2. Zet op Vercel `KVK_API_KEY` op de ontvangen sleutel.
3. Testen zonder kosten kan tegen de KvK-testomgeving: zet dan ook
   `KVK_API_URL=https://api.kvk.nl/test/api/v2/zoeken` en gebruik de testsleutel
   en testnummers uit de KvK-documentatie. Haal `KVK_API_URL` weer weg voor
   productie.

## Privacy

Er wordt alleen het ingevoerde KvK-nummer naar de KvK gestuurd; geen
persoonsgegevens. De KvK Zoeken API geeft openbare Handelsregistergegevens
terug (naam, vestigingsplaats). We bewaren daarvan alleen de naam.

## Controleren

- Zonder sleutel: het veld meldt "Het formaat klopt (8 cijfers). Controle bij de
  KvK is op dit moment niet mogelijk; je kunt gewoon verdergaan."
- Met sleutel: een bestaand nummer geeft de bedrijfsnaam; een niet-bestaand
  nummer geeft "staat niet in het Handelsregister" en het formulier weigert.
- Unit tests: `tests/kvk.test.ts`.
