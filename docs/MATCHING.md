# ZZP Connect — Matching Engine

> Kernfunctie. Deterministisch, uitlegbaar, configureerbaar. Ontworpen zodat AI later inplugbaar is.

---

## 1. Doel

Voor elke opdracht (Job) elke relevante ZZP'er een **matchscore (0–100)** geven met een **begrijpelijke uitleg**. Geen black box. Matching mag **nooit alleen op afstand** gebaseerd zijn: een beschikbare zzp'er op 30 km hoort boven een niet-beschikbare op 5 km te eindigen.

## 2. Pipeline

```
Job → [1. Kandidaatselectie] → [2. Harde filters] → [3. Gewogen scoring] → [4. Uitleg] → gesorteerde matches
```

### Stap 1 — Kandidaatselectie (grof, indexbaar)

Selecteer ZZP'ers met het juiste vakgebied én wiens werkgebied de opdrachtlocatie redelijkerwijs kan bereiken (geo bounding box + `maxReisafstandKm`). Houdt de te scoren set klein op schaal.

### Stap 2 — Harde filters (uitsluiten / markeren)

- **Verkeerd vakgebied** → niet matchen (uitsluiten).
- **Niet beschikbaar** in de opdrachtperiode → niet matchen (uitsluiten).
- **Vereiste certificering ontbreekt** (JobRequirement `hard=true`) → markeren als **ongeschikt** (zichtbaar, maar niet als geldige match).
- **Tarief volledig buiten budget** → geen uitsluiting maar **sterk verlaagde score** (zie tarief-subscore).

De uitslag van harde filters wordt opgeslagen (`Match.hardeFilterUitslagJson`) t.b.v. transparantie.

### Stap 3 — Gewogen scoring

Elke dimensie levert een genormaliseerde subscore (0–1); de eindscore is de gewogen som × 100. **Startgewichten (configureerbaar in admin):**

| Dimensie          | Gewicht |
| ----------------- | ------- |
| Vakgebied         | 25%     |
| Beschikbaarheid   | 20%     |
| Specialisatie     | 15%     |
| Locatie / afstand | 15%     |
| Tarief            | 10%     |
| Ervaring          | 5%      |
| Certificaten      | 5%      |
| Betrouwbaarheid   | 5%      |

> Aanvullende signalen genoemd in de masterprompt (profielkwaliteit, reviews, eerdere succesvolle opdrachten, voertuig/gereedschap) voeden de subscores — met name **Betrouwbaarheid** (reviews + afgeronde assignments + no-show-vrij) en kleine bonussen binnen relevante dimensies (bijv. eigen bus versterkt de locatie-subscore, eigen gereedschap telt mee als de opdracht dat wenst). Alle gewichten sommeren tot 100%.

**Subscore-logica (indicatief):**

- _Vakgebied:_ exacte match = 1; aanverwant = deels; anders al uitgefilterd.
- _Beschikbaarheid:_ volledige dekking van de opdrachtperiode = 1; gedeeltelijk = pro rata; startdatum haalbaar telt mee.
- _Specialisatie:_ aandeel gevraagde specialisaties dat de ZZP'er heeft.
- _Locatie:_ aflopende functie van afstand t.o.v. `maxReisafstandKm` (dichterbij = hoger; buiten bereik = 0, meestal al gefilterd).
- _Tarief:_ 1 binnen budget; lineair aflopend naarmate het gevraagde tarief het budget overschrijdt; ~0 bij volledig buiten budget.
- _Ervaring:_ genormaliseerd op jaren t.o.v. een plafond.
- _Certificaten:_ aandeel gewenste (niet-harde) certificaten aanwezig.
- _Betrouwbaarheid:_ combinatie van gemiddelde review-score, aantal afgeronde opdrachten en profielcompleetheid.

### Stap 4 — Uitleg (verplicht in UI)

Toon score plus concrete redenen, bijv.:

```
96% match
✓ Vakgebied         ✓ Beschikbaar
✓ Binnen 25 km      ✓ Tarief binnen budget
✓ VCA aanwezig
```

Negatieve/aandachtspunten worden ook getoond (bijv. "Tarief €5/u boven budget", "Certificaat X ontbreekt").

## 3. Configureerbaarheid (admin, geen codewijziging)

Via `MatchingSetting`: gewichten per dimensie, **minimale matchscore** (drempel voor tonen/notificeren), **maximale afstand**, en de catalogus van skills/specialisaties/certificaten. Wijzigingen zijn versiebeheerd en worden gelogd (AuditLog).

## 4. Berekening & opslag

- Matches worden berekend/gecachet in de `Match`-tabel en herberekend bij relevante wijzigingen (nieuwe/gewijzigde opdracht, gewijzigde beschikbaarheid/profiel, aangepaste gewichten).
- De engine is een **pure functie** `score(job, zzp, settings) → { score, subscores, redenen, hardeFilters }` in `server/matching` — testbaar zonder DB/HTTP.
- Herberekening is een asynchrone taak (queue-interface) om op schaal te schalen.

## 5. Testbaarheid

Unit-tests dekken: harde filters (elk geval), elke subscore-functie op randgevallen, gewogen som, sortering, en het "30 km beschikbaar > 5 km niet-beschikbaar"-scenario.

## 6. AI — later (niet in MVP)

De MVP is bewust **deterministisch** (betrouwbaarheid boven "AI om AI"). De architectuur laat later toe:

- **Opdrachtanalyse:** vrije omschrijving → gestructureerde skills/specialisaties (bijv. "schoonmaak 12 kantoren, glasbewassing" → `schoonmaker, kantoorschoonmaak, glasbewassing`), als **suggestie** die de deterministische invoer verrijkt.
- **Ranking-verrijking:** een optionele laag die de deterministische score bijstelt, altijd met behoud van de uitlegbaarheid en de harde filters.

Deze uitbreidingen pluggen in als extra stappen in de pipeline zonder de kern te herschrijven.
