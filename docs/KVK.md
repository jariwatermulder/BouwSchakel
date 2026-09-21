# KvK-controle

Het KvK-nummer is verplicht voor zzp'ers en opdrachtgevers. De site controleert
het nummer op twee niveaus:

1. **Formaat** (altijd): precies 8 cijfers. Spaties, punten en streepjes worden
   automatisch weggehaald ("12 345 678" wordt "12345678").
2. **Handelsregister**: het nummer wordt opgezocht via de officiële KvK Zoeken
   API. Welke omgeving dat is, hangt af van de omgevingsvariabelen (zie
   hieronder).

## Drie standen

| Stand | Wanneer | Gedrag |
| --- | --- | --- |
| **Productie** | `KVK_API_KEY` gezet | Echte controle. Een nummer dat niet in het Handelsregister staat kan niet worden opgeslagen. Bij een treffer bewaren we naam en tijdstip (`kvkNaam`, `kvkGecontroleerdOp`), zichtbaar onder Beheer → Verificaties en Beheer → Bedrijven. |
| **Testmodus** (standaard) | geen `KVK_API_KEY` | De site bevraagt de KvK-testomgeving met de openbare testsleutel uit de KvK-documentatie. Daar bestaan alleen testbedrijven (bijv. `68750110`, "Test BV"), dus een echt KvK-nummer wordt daar niet gevonden. Daarom blokkeert "niet gevonden" het opslaan niet, en telt een treffer niet als echte controle (er wordt niets bewaard). Het veld zegt er steeds bij dat het om de testomgeving gaat. |
| **Uit** | `KVK_CONTROLE=uit` | Alleen formaatcontrole. |

Als de KvK-API niet antwoordt (storing, time-out), valt elke stand terug op
alleen het formaat. Een storing bij de KvK blokkeert dus nooit een registratie.

`KVK_API_URL` overschrijft de API-URL (zelden nodig; wordt lokaal gebruikt om
tegen een nagebootste API te testen).

## In het formulier

Het KvK-veld (`src/components/kvk-veld.tsx`) controleert automatisch zodra er
8 cijfers staan, en heeft een knop "Controleer". Bij een treffer verschijnt
"Gevonden in het Handelsregister: <naam>, <plaats>" en een knop om die naam in
het veld Bedrijfsnaam over te nemen. De controle loopt via de server action
`controleerKvkAction` (alleen ingelogd, max. 30 controles per 10 minuten per
gebruiker). Resultaten worden 24 uur gecachet.

## Eigen sleutel aanvragen (productie)

1. Maak een account op https://developers.kvk.nl en vraag toegang aan tot de
   **KVK Zoeken API** (Handelsregister). Dit is een betaalde dienst van de KvK
   met een prijs per bevraging; zie de actuele tarieven op de KvK-site.
2. Zet op Vercel `KVK_API_KEY` op de ontvangen sleutel en deploy opnieuw.
   Vanaf dat moment is de controle echt en blokkerend.

## Testnummers

In de KvK-testomgeving werken onder meer `68750110` (Test BV) en de andere
testnummers uit de KvK-documentatie (https://developers.kvk.nl → Zoeken API →
testomgeving). Elk ander nummer geeft "niet gevonden in de testomgeving".

## Privacy

Er wordt alleen het ingevoerde KvK-nummer naar de KvK gestuurd; geen
persoonsgegevens. De KvK Zoeken API geeft openbare Handelsregistergegevens
terug (naam, vestigingsplaats). We bewaren daarvan alleen de naam, en alleen
in productie.

## Controleren

- Testmodus: `68750110` geeft "Gevonden in de KvK-testomgeving: Test BV …";
  een ander nummer geeft de melding dat het niet in de testomgeving staat en
  opslaan blijft mogelijk.
- Productie: een bestaand nummer geeft de bedrijfsnaam; een niet-bestaand
  nummer geeft "staat niet in het Handelsregister" en het formulier weigert.
- Unit tests: `tests/kvk.test.ts`.
