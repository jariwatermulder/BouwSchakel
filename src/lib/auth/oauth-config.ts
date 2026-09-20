/**
 * Pure configuratie en helpers voor "Inloggen met Google/Apple". Geen
 * server-only imports, zodat dit testbaar is en in server components gebruikt
 * kan worden om te bepalen welke knoppen getoond worden.
 */
export const OAUTH_PROVIDERS = ["google", "apple"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export function isOAuthProvider(value: unknown): value is OAuthProvider {
  return typeof value === "string" && (OAUTH_PROVIDERS as readonly string[]).includes(value);
}

export const PROVIDER_LABEL: Record<OAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
};

export interface ProviderConfig {
  provider: OAuthProvider;
  clientId: string;
  authorizeUrl: string;
  tokenUrl: string;
  jwksUrl: string;
  issuers: string[];
  scope: string;
  /** Apple stuurt de callback als POST (form_post) en heeft daardoor een SameSite=None-cookie nodig. */
  responseMode: "query" | "form_post";
}

/** Geeft de configuratie terug als de omgevingsvariabelen voor de provider zijn gezet, anders null. */
export function providerConfig(provider: OAuthProvider, env: Record<string, string | undefined> = process.env): ProviderConfig | null {
  if (provider === "google") {
    const clientId = env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId || !env.GOOGLE_CLIENT_SECRET?.trim()) return null;
    return {
      provider,
      clientId,
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      jwksUrl: "https://www.googleapis.com/oauth2/v3/certs",
      issuers: ["https://accounts.google.com", "accounts.google.com"],
      scope: "openid email",
      responseMode: "query",
    };
  }
  const clientId = env.APPLE_CLIENT_ID?.trim();
  if (!clientId || !env.APPLE_TEAM_ID?.trim() || !env.APPLE_KEY_ID?.trim() || !env.APPLE_PRIVATE_KEY?.trim()) return null;
  return {
    provider,
    clientId,
    authorizeUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token",
    jwksUrl: "https://appleid.apple.com/auth/keys",
    issuers: ["https://appleid.apple.com"],
    scope: "email",
    responseMode: "form_post",
  };
}

/** Providers waarvoor de sleutels zijn ingesteld (bepaalt welke knoppen zichtbaar zijn). */
export function enabledProviders(env: Record<string, string | undefined> = process.env): OAuthProvider[] {
  return OAUTH_PROVIDERS.filter((p) => providerConfig(p, env) !== null);
}

export function redirectUri(appUrl: string, provider: OAuthProvider): string {
  return `${appUrl.replace(/\/$/, "")}/api/auth/oauth/${provider}/callback`;
}

/** Bouwt de autorisatie-URL (OpenID Connect authorization code flow, met PKCE voor Google). */
export function authorizationUrl(
  cfg: ProviderConfig,
  opts: { redirectUri: string; state: string; nonce: string; codeChallenge?: string },
): string {
  const u = new URL(cfg.authorizeUrl);
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", opts.redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", cfg.scope);
  u.searchParams.set("state", opts.state);
  u.searchParams.set("nonce", opts.nonce);
  if (cfg.responseMode === "form_post") u.searchParams.set("response_mode", "form_post");
  if (opts.codeChallenge) {
    u.searchParams.set("code_challenge", opts.codeChallenge);
    u.searchParams.set("code_challenge_method", "S256");
  }
  if (cfg.provider === "google") u.searchParams.set("prompt", "select_account");
  return u.toString();
}

/** Claims die we uit een geverifieerd ID-token overnemen. */
export interface OAuthIdentiteit {
  provider: OAuthProvider;
  sub: string;
  email: string;
  emailVerified: boolean;
}

/** Leest de claims uit een (al geverifieerde) ID-token-payload; gooit bij ontbrekende gegevens. */
export function identiteitUitClaims(provider: OAuthProvider, claims: Record<string, unknown>): OAuthIdentiteit {
  const sub = typeof claims.sub === "string" ? claims.sub : "";
  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!sub || !email) throw new Error("ID-token bevat geen sub of e-mailadres");
  const ev = claims.email_verified;
  // Apple levert email_verified soms als de string "true".
  const emailVerified = ev === true || ev === "true" || (provider === "apple" && ev === undefined);
  return { provider, sub, email, emailVerified };
}
