# E-mail instellen (Resend)

ZZP Connect verstuurt transactionele e-mails (bevestig je e-mailadres, nieuw
bericht, nieuwe match, reactie, review) via **Resend**. Zolang er geen
API-sleutel is ingesteld, werkt het platform gewoon, maar worden er geen mails
verstuurd (er verschijnt alleen een waarschuwing in de serverlog).

## 1. Resend-account + API-sleutel

1. Maak een gratis account op https://resend.com.
2. Ga naar **API Keys** → **Create API Key** → kopieer de sleutel
   (begint met `re_...`).

## 2. Afzender (EMAIL_FROM)

- **Snel testen zonder eigen domein:** gebruik `onboarding@resend.dev`. Let op:
  Resend levert testmails dan alléén af op het e-mailadres waarmee je je
  Resend-account hebt aangemaakt.
- **Echt gebruiken:** verifieer je eigen domein in Resend (**Domains** → domein
  toevoegen → de getoonde DNS-records bij je domeinprovider zetten). Gebruik
  daarna een afzender op dat domein, bijv. `no-reply@bouwschakel.nl`.

## 3. Omgevingsvariabelen zetten

Lokaal in `.env`:

```
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="ZZP Connect <onboarding@resend.dev>"
```

Op **Vercel**: project → **Instellingen** → **Omgevingsvariabelen** → voeg
`RESEND_API_KEY` en `EMAIL_FROM` toe → daarna **opnieuw implementeren**.

## 4. Testen

- Registreer een nieuw account: je zou een verificatiemail moeten ontvangen.
- Stuur een bericht in een gesprek: de tegenpartij krijgt (bij ingeschakelde
  voorkeuren) een e-mailmelding.

## Hoe het technisch werkt

- Alle mails lopen via `sendEmail()` in `src/lib/email/send.ts` (Resend HTTP-API,
  met een gebrande HTML-template).
- Notificatie-mails respecteren de per-gebruiker voorkeuren
  (`NotificationPreference`).
- Mislukt het versturen, dan wordt dat gelogd maar laat het nooit de hoofdactie
  (registreren, bericht sturen, …) falen.
