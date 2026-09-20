import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";
import { serverEnv } from "@/lib/env";
import { safeNextPath, withNext } from "@/lib/auth/next";
import { authorizationUrl, isOAuthProvider, providerConfig, redirectUri } from "@/lib/auth/oauth-config";
import { startOAuthState } from "@/lib/auth/oauth";

export const dynamic = "force-dynamic";

/**
 * Start "Inloggen met Google/Apple". Wordt als formulier gepost vanaf de
 * inlog- of registratiepagina; bij registratie gaan de gekozen rol en het
 * akkoord met de voorwaarden mee en worden ze in de state-cookie bewaard.
 */
async function start(req: Request, providerRaw: string): Promise<Response> {
  const env = serverEnv();
  const terug = (pad: string) => NextResponse.redirect(new URL(pad, env.APP_URL), 303);

  if (!isOAuthProvider(providerRaw) || !providerConfig(providerRaw)) return terug("/inloggen?fout=oauth-uit");
  const provider = providerRaw;

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (!rateLimit(`oauth-start:${ip}`, 20, 15 * 60 * 1000).success) return terug("/inloggen?fout=limiet");

  const url = new URL(req.url);
  let velden: URLSearchParams;
  if (req.method === "POST") {
    const ct = req.headers.get("content-type") ?? "";
    velden = ct.includes("application/x-www-form-urlencoded") || ct.includes("multipart/form-data")
      ? new URLSearchParams([...(await req.formData()).entries()].map(([k, v]) => [k, String(v)]))
      : new URLSearchParams();
  } else {
    velden = url.searchParams;
  }

  const next = safeNextPath(velden.get("next"));
  const rolRaw = velden.get("role");
  const rol = rolRaw === "ZZP" || rolRaw === "COMPANY" ? rolRaw : undefined;
  const akkoord = velden.get("akkoord") === "on";

  // Registratie zonder akkoord met de voorwaarden is niet toegestaan.
  if (rol && !akkoord) {
    return terug(withNext(`/registreren?rol=${rol === "COMPANY" ? "bedrijf" : "zzp"}&fout=akkoord`, next));
  }

  const cfg = providerConfig(provider)!;
  const { state, codeChallenge } = await startOAuthState({ provider, rol, akkoord, next });
  return NextResponse.redirect(
    authorizationUrl(cfg, {
      redirectUri: redirectUri(env.APP_URL, provider),
      state: state.state,
      nonce: state.nonce,
      codeChallenge,
    }),
    303,
  );
}

export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }): Promise<Response> {
  return start(req, (await ctx.params).provider);
}

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }): Promise<Response> {
  return start(req, (await ctx.params).provider);
}
