import { describe, expect, it } from "vitest";
import {
  authorizationUrl,
  enabledProviders,
  identiteitUitClaims,
  isOAuthProvider,
  providerConfig,
  redirectUri,
} from "@/lib/auth/oauth-config";

const googleEnv = { GOOGLE_CLIENT_ID: "g-id", GOOGLE_CLIENT_SECRET: "g-secret" };
const appleEnv = { APPLE_CLIENT_ID: "nl.zzpschakel.web", APPLE_TEAM_ID: "TEAM", APPLE_KEY_ID: "KEY", APPLE_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----" };

describe("oauth-configuratie", () => {
  it("toont alleen providers waarvan alle sleutels zijn gezet", () => {
    expect(enabledProviders({})).toEqual([]);
    expect(enabledProviders(googleEnv)).toEqual(["google"]);
    expect(enabledProviders({ ...googleEnv, ...appleEnv })).toEqual(["google", "apple"]);
    expect(enabledProviders({ APPLE_CLIENT_ID: "x" })).toEqual([]);
    expect(providerConfig("google", {})).toBeNull();
  });

  it("herkent alleen bekende providers", () => {
    expect(isOAuthProvider("google")).toBe(true);
    expect(isOAuthProvider("facebook")).toBe(false);
    expect(isOAuthProvider(null)).toBe(false);
  });

  it("bouwt een correcte autorisatie-URL met PKCE voor Google en form_post voor Apple", () => {
    const g = new URL(
      authorizationUrl(providerConfig("google", googleEnv)!, {
        redirectUri: redirectUri("https://zzpschakel.nl/", "google"),
        state: "s1",
        nonce: "n1",
        codeChallenge: "c1",
      }),
    );
    expect(g.origin + g.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(g.searchParams.get("redirect_uri")).toBe("https://zzpschakel.nl/api/auth/oauth/google/callback");
    expect(g.searchParams.get("code_challenge_method")).toBe("S256");
    expect(g.searchParams.get("scope")).toContain("openid");
    expect(g.searchParams.get("state")).toBe("s1");
    expect(g.searchParams.get("nonce")).toBe("n1");

    const a = new URL(
      authorizationUrl(providerConfig("apple", appleEnv)!, { redirectUri: "https://x/cb", state: "s", nonce: "n" }),
    );
    expect(a.hostname).toBe("appleid.apple.com");
    expect(a.searchParams.get("response_mode")).toBe("form_post");
    expect(a.searchParams.get("code_challenge")).toBeNull();
  });

  it("leest de identiteit uit ID-token-claims en normaliseert het e-mailadres", () => {
    expect(identiteitUitClaims("google", { sub: "123", email: "Jan@Example.com", email_verified: true })).toEqual({
      provider: "google",
      sub: "123",
      email: "jan@example.com",
      emailVerified: true,
    });
    expect(identiteitUitClaims("apple", { sub: "a.b.c", email: "x@privaterelay.appleid.com", email_verified: "true" }).emailVerified).toBe(true);
    expect(identiteitUitClaims("google", { sub: "1", email: "x@y.z", email_verified: false }).emailVerified).toBe(false);
    expect(() => identiteitUitClaims("google", { sub: "1" })).toThrow();
  });
});
