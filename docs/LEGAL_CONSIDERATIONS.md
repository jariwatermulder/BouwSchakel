# ZZP Connect — Juridische Overwegingen

> **Disclaimer:** Dit document is een technisch/functioneel hulpmiddel, **geen juridisch advies**. Alle juridische teksten (algemene voorwaarden, privacyverklaring, disclaimers, overeenkomsten) moeten door een **Nederlandse jurist** worden gecontroleerd vóór productie. Het platform doet **geen** claim dat het arbeidsrechtelijke of fiscale compliance automatisch garandeert.

---

## 1. Kernpositie: bemiddeling, geen terbeschikkingstelling

ZZP Connect presenteert zich en gedraagt zich als **bemiddelingsplatform**: het brengt opdrachtgevers en zelfstandige vakmensen bij elkaar en faciliteert contact en administratie. De **overeenkomst van opdracht** komt tot stand tussen opdrachtgever en ZZP'er; ZZP Connect is daarbij geen partij.

Productbeslissingen bewaken bewust het onderscheid tussen:

- **Bemiddeling** — partijen vinden en contact leggen; ZZP Connect stuurt de arbeid niet aan.
- **Tussenkomst** — ZZP Connect wordt contractueel/financieel tussenschakel (risicovoller; vermijden tenzij bewust gekozen en juridisch ingericht).
- **Terbeschikkingstelling van arbeid** — leiding/toezicht/allocatie door ZZP Connect (uitzenden/uitlenen). Dit **vermijden**; het raakt Waadi en registratie-/vergunningsplichten.

**Ontwerpimplicaties:**

- ZZP Connect bepaalt niet wie waar werkt, geeft geen werkinstructies, en oefent geen leiding/toezicht uit.
- De selectie/keuze ligt bij de opdrachtgever; de acceptatie bij de ZZP'er.
- Communicatie en afspraken over de uitvoering lopen tussen de partijen zelf.

## 2. Schijnzelfstandigheid (o.a. Wet DBA / handhavingscontext)

Het platform doet **geen** claim als "deze ZZP'er is juridisch gegarandeerd zelfstandig". Wel:

- **Signaleren & informeren**: het platform kan risico-indicatoren tonen en informatie verzamelen (KvK, meerdere opdrachtgevers, eigen materieel/verzekering, eigen tarief) zonder een juridisch oordeel te geven.
- Neutrale formuleringen: "Profiel geverifieerd", "Opdracht gecontroleerd op basis van de door de opdrachtgever verstrekte informatie" — geen garanties.
- Modelovereenkomsten/afspraken blijven de verantwoordelijkheid van partijen; juridische controle vereist.

## 3. Waadi (Wet allocatie arbeidskrachten door intermediairs)

Relevant zodra er sprake zou zijn van terbeschikkingstelling. Zolang ZZP Connect strikt bemiddelt (geen leiding/toezicht, geen allocatie), is de positie anders. Bij twijfel of bij toevoeging van tussenkomst-/detacheringsfuncties: juridisch toetsen (o.a. registratie-/informatieverplichtingen).

## 4. Toekomstige regelgeving (o.a. Wtta — toelating terbeschikkingstelling arbeidskrachten)

Aankomende regelgeving rond het ter beschikking stellen van arbeidskrachten kan relevant worden **indien** ZZP Connect richting uitlenen/detacheren zou bewegen. De architectuur houdt hiermee rekening door bemiddeling en eventuele tussenkomst/terbeschikkingstelling **strikt gescheiden** te modelleren, zodat later per module compliance kan worden ingericht. Concrete verplichtingen: juridisch laten toetsen op het moment dat zo'n functie wordt overwogen.

## 5. AVG / privacy

Zie `SECURITY.md` §9. Kernpunten: privacy-by-design, dataminimalisatie, grondslag/toestemming, cookie consent, rechten van betrokkenen (inzage/export/verwijdering), bewaartermijnen, beperkte documenttoegang, verwerkersovereenkomsten met subverwerkers (hosting, e-mail, storage, payment, geocoding). Register van verwerkingsactiviteiten voorbereiden.

## 6. Consumenten- vs. zakelijke voorwaarden

Doelgroep is primair B2B (bedrijven en zelfstandigen). Toch scherp onderscheiden welke gebruikers als consument kunnen kwalificeren en welke voorwaarden/rechten (bijv. herroeping bij online diensten) van toepassing zijn. Aparte of duidelijk gescheiden voorwaarden waar nodig; juridisch toetsen.

## 7. Aansprakelijkheid

- ZZP Connect is bemiddelaar en niet verantwoordelijk voor de kwaliteit/uitvoering van het werk of voor geschillen tussen partijen.
- Duidelijke aansprakelijkheidsbeperkingen in de voorwaarden (juridisch te toetsen).
- Verificatie en reviews zijn indicatief, geen garantie.

## 8. Verzekeringen

Het platform kan ZZP'ers vragen naar (bedrijfs-)aansprakelijkheids-/beroepsaansprakelijkheidsverzekering en dit als profielinformatie/verificatie tonen — zonder te garanderen dat dekking toereikend is. Partijen blijven zelf verantwoordelijk.

## 9. Betalingsvoorwaarden

Bij invoering van fees/abonnementen/facturatie (FASE 8): heldere betalingsvoorwaarden, factuurvereisten (btw), refund-/annuleringsbeleid, en verwerking via een gereguleerde provider (Mollie/Stripe). Bedragen configureerbaar en transparant gecommuniceerd. Juridisch/fiscaal toetsen.

## 10. Algemene voorwaarden & klachten

- `/algemene-voorwaarden`, `/privacy`, `/cookies`, `/klachten` als vaste juridische pagina's.
- Klachtenprocedure (`Complaint`-entiteit) en geschilbeslechting beschrijven.
- Versiebeheer van voorwaarden + acceptatie-registratie per gebruiker (welke versie geaccepteerd, wanneer).

## 11. Samengevat — bewaakte ontwerpregels

1. Nooit claims van gegarandeerde (arbeids)juridische status.
2. Bemiddeling standaard; tussenkomst/terbeschikkingstelling apart en bewust.
3. Neutrale, feitelijke verificatietaal.
4. Privacy-by-design en dataminimalisatie.
5. Alle juridische teksten door een NL-jurist laten controleren vóór livegang.
