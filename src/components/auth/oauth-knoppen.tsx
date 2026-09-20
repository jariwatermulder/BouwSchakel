import { PROVIDER_LABEL, type OAuthProvider } from "@/lib/auth/oauth-config";

/** Foutmeldingen die de OAuth-routes via ?fout=… teruggeven. */
export const OAUTH_FOUTEN: Record<string, string> = {
  oauth: "Inloggen via Google of Apple is niet gelukt. Probeer het opnieuw of log in met je wachtwoord.",
  "oauth-uit": "Deze inlogmethode is nog niet ingeschakeld.",
  geannuleerd: "Je hebt het inloggen bij de provider afgebroken.",
  "email-onbevestigd": "Het e-mailadres bij dit account is niet bevestigd door de provider. Log in met je wachtwoord.",
  geblokkeerd: "Dit account is geblokkeerd. Neem contact met ons op.",
  "geen-account": "Er is nog geen account voor dit e-mailadres. Kies hieronder je rol, ga akkoord met de voorwaarden en registreer met dezelfde knop.",
  akkoord: "Ga akkoord met de algemene voorwaarden en de privacyverklaring om een account aan te maken.",
  limiet: "Te veel pogingen. Probeer het later opnieuw.",
};

function GoogleIcoon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5c-.3 1.5-1.1 2.8-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.2v3.1C3.2 21.3 7.3 24 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.2C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4.1-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4.1 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function AppleIcoon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.8-1.7 0-3.2 1-4.1 2.5-1.8 3-.5 7.6 1.3 10.1.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.9-4.1zM14 5.2c.7-.8 1.2-2 1-3.2-1 0-2.2.7-3 1.5-.6.7-1.2 1.9-1.1 3.1 1.2.1 2.3-.6 3.1-1.4z" />
    </svg>
  );
}

/**
 * Knoppen "Doorgaan met Google/Apple". Horen ín het inlog- of
 * registratieformulier: ze posten hetzelfde formulier (rol, akkoord, next)
 * naar de start-route van de provider. Alleen zichtbaar voor providers
 * waarvan de sleutels zijn ingesteld.
 */
export function OAuthKnoppen({ providers, tekst = "Doorgaan met" }: { providers: OAuthProvider[]; tekst?: string }) {
  if (providers.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3" aria-hidden>
        <span className="bg-border h-px flex-1" />
        <span className="text-foreground-muted text-xs">of</span>
        <span className="bg-border h-px flex-1" />
      </div>
      <div className="grid gap-2">
        {providers.map((p) => (
          <button
            key={p}
            type="submit"
            formAction={`/api/auth/oauth/${p}/start`}
            formMethod="post"
            formNoValidate
            data-track="button_clicked"
            data-track-label={`oauth-${p}`}
            className={`inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border text-sm font-semibold transition-colors ${
              p === "apple"
                ? "border-ink bg-ink text-white hover:bg-ink-soft"
                : "border-border bg-surface text-foreground hover:bg-surface-muted"
            }`}
          >
            {p === "google" ? <GoogleIcoon /> : <AppleIcoon />}
            {tekst} {PROVIDER_LABEL[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
