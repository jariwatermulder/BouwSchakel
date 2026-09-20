import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from "jose";
import { isProduction, serverEnv } from "@/lib/env";
import {
  identiteitUitClaims,
  providerConfig,
  redirectUri,
  type OAuthIdentiteit,
  type OAuthProvider,
  type ProviderConfig,
} from "@/lib/auth/oauth-config";

/**
 * Serverkant van "Inloggen met Google/Apple": state-cookie, code-uitwisseling
 * en verificatie van het ID-token (handtekening, issuer, audience, nonce).
 * Bewust zonder externe auth-bibliotheek: het bestaande sessiesysteem blijft
 * de enige bron van waarheid.
 */

export const OAUTH_STATE_COOKIE = "zs_oauth";
const STATE_TTL_MS = 10 * 60 * 1000;

export interface OAuthState {
  provider: OAuthProvider;
  state: string;
  nonce: string;
  verifier?: string;
  rol?: "ZZP" | "COMPANY";
  akkoord: boolean;
  next: string | null;
  ts: number;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function onderteken(payload: string): string {
  return createHmac("sha256", serverEnv().AUTH_SECRET).update(payload).digest("base64url");
}

/** Zet de state-cookie en geeft de waarden terug om de autorisatie-URL mee te bouwen. */
export async function startOAuthState(input: Omit<OAuthState, "state" | "nonce" | "verifier" | "ts">): Promise<{
  state: OAuthState;
  codeChallenge?: string;
}> {
  const state: OAuthState = {
    ...input,
    state: b64url(randomBytes(24)),
    nonce: b64url(randomBytes(24)),
    verifier: input.provider === "google" ? b64url(randomBytes(48)) : undefined,
    ts: Date.now(),
  };
  const payload = b64url(Buffer.from(JSON.stringify(state)));
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, `${payload}.${onderteken(payload)}`, {
    httpOnly: true,
    secure: isProduction(),
    // Apple stuurt de callback als cross-site POST; alleen SameSite=None komt dan mee.
    sameSite: input.provider === "apple" && isProduction() ? "none" : "lax",
    path: "/api/auth/oauth",
    maxAge: STATE_TTL_MS / 1000,
  });
  const codeChallenge = state.verifier
    ? b64url(createHash("sha256").update(state.verifier).digest())
    : undefined;
  return { state, codeChallenge };
}

/** Leest en verwijdert de state-cookie; null als hij ontbreekt, vervalst of verlopen is. */
export async function leesOAuthState(): Promise<OAuthState | null> {
  const store = await cookies();
  const raw = store.get(OAUTH_STATE_COOKIE)?.value;
  // Eenmalig: cookie direct laten vervallen (zelfde pad als bij het zetten).
  store.set(OAUTH_STATE_COOKIE, "", { path: "/api/auth/oauth", maxAge: 0 });
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return null;
  const verwacht = onderteken(payload);
  if (sig.length !== verwacht.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(verwacht))) return null;
  try {
    const state = JSON.parse(Buffer.from(payload, "base64url").toString()) as OAuthState;
    if (Date.now() - state.ts > STATE_TTL_MS) return null;
    return state;
  } catch {
    return null;
  }
}

/** Apple vereist een kortlevende, met de .p8-sleutel ondertekende JWT als client_secret. */
async function appleClientSecret(cfg: ProviderConfig): Promise<string> {
  const env = process.env;
  const pem = (env.APPLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  const key = await importPKCS8(pem, "ES256");
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: env.APPLE_KEY_ID })
    .setIssuer(env.APPLE_TEAM_ID!)
    .setSubject(cfg.clientId)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);
}

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
function jwks(url: string) {
  let set = jwksCache.get(url);
  if (!set) {
    set = createRemoteJWKSet(new URL(url));
    jwksCache.set(url, set);
  }
  return set;
}

/**
 * Wisselt de autorisatiecode in voor tokens en verifieert het ID-token.
 * Geeft de identiteit (sub, e-mail) terug of gooit.
 */
export async function wisselCodeIn(provider: OAuthProvider, code: string, state: OAuthState): Promise<OAuthIdentiteit> {
  const cfg = providerConfig(provider);
  if (!cfg) throw new Error(`Provider ${provider} is niet geconfigureerd`);
  const env = serverEnv();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri(env.APP_URL, provider),
    client_id: cfg.clientId,
    client_secret: provider === "apple" ? await appleClientSecret(cfg) : process.env.GOOGLE_CLIENT_SECRET!,
  });
  if (state.verifier) body.set("code_verifier", state.verifier);

  const res = await fetch(cfg.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const tekst = await res.text().catch(() => "");
    throw new Error(`Token-uitwisseling bij ${provider} mislukt (${res.status}): ${tekst.slice(0, 200)}`);
  }
  const tokens = (await res.json()) as { id_token?: string };
  if (!tokens.id_token) throw new Error(`${provider} gaf geen ID-token terug`);

  const { payload } = await jwtVerify(tokens.id_token, jwks(cfg.jwksUrl), {
    issuer: cfg.issuers,
    audience: cfg.clientId,
    clockTolerance: 60,
  });
  if (payload.nonce !== state.nonce) throw new Error("Nonce van het ID-token klopt niet");
  return identiteitUitClaims(provider, payload as Record<string, unknown>);
}
