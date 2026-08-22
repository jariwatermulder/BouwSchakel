# Admin — BouwSchakel

De adminomgeving zit onder `/admin` en is beveiligd met role-based access
control. Adminrollen (oplopend in bevoegdheid): `SUPPORT` → `MODERATOR` →
`ADMIN` → `SUPER_ADMIN`.

| Onderdeel                                                         | Minimale rol |
| ----------------------------------------------------------------- | ------------ |
| Overzichten bekijken (dashboard, lijsten)                         | SUPPORT      |
| Verificaties, reviews, reports, klachten afhandelen               | MODERATOR    |
| Gebruikers blokkeren, bedrijven, catalogus, matching-instellingen | ADMIN        |
| Adminrollen toekennen/wijzigen                                    | SUPER_ADMIN  |

Alle beheeracties worden vastgelegd in het **audit log** (`/admin/audit`).

## Een admin aanmaken

**Optie A — via de seed** (aanbevolen bij eerste opzet). Zet in `.env`:

```bash
ADMIN_EMAIL="jij@voorbeeld.nl"
ADMIN_PASSWORD="een-sterk-wachtwoord"
```

en draai `npm run db:seed`. Dit maakt (of promoveert) dat account tot
`SUPER_ADMIN`. Verwijder de variabelen daarna weer.

**Optie B — een bestaand account promoveren** (SQL, bijv. via de Supabase
SQL-editor):

```sql
UPDATE "User"
SET role = 'ADMIN', "adminRole" = 'SUPER_ADMIN'
WHERE email = 'jij@voorbeeld.nl';
```

Log daarna opnieuw in; je wordt naar `/admin` geleid.

## Matching-instellingen

Onder `/admin/matching` pas je de gewichten per dimensie, de minimale
matchscore en de maximale afstand aan — zonder codewijziging. Wijzigingen
gelden direct voor nieuwe matchberekeningen.
