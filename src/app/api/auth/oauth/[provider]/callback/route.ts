import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { withNext } from "@/lib/auth/next";
import { createSession } from "@/lib/auth/session";
import { isOAuthProvider } from "@/lib/auth/oauth-config";
import { leesOAuthState, wisselCodeIn } from "@/lib/auth/oauth";
import {
  AccountGeblokkeerdError,
  EmailNietBevestigdError,
  GeenAccountError,
  loginOfRegistreerMetOAuth,
} from "@/server/auth/oauth";

export const dynamic = "force-dynamic";

/**
 * Callback van Google (GET met ?code&state) of Apple (POST form_post met
 * code, state en id_token). Controleert de state-cookie, wisselt de code in,
 * verifieert het ID-token en logt in of registreert.
 */
async function callback(req: Request, providerRaw: string): Promise<Response> {
  const env = serverEnv();
  const terug = (pad: string) => NextResponse.redirect(new URL(pad, env.APP_URL), 303);
  if (!isOAuthProvider(providerRaw)) return terug("/inloggen?fout=oauth");
  const provider = providerRaw;

  let velden: URLSearchParams;
  if (req.method === "POST") {
    velden = new URLSearchParams([...(await req.formData()).entries()].map(([k, v]) => [k, String(v)]));
  } else {
    velden = new URL(req.url).searchParams;
  }

  const state = await leesOAuthState();
  const code = velden.get("code");
  const fout = velden.get("error");
  if (fout === "access_denied" || fout === "user_cancelled_authorize") return terug("/inloggen?fout=geannuleerd");
  if (!state || state.provider !== provider || !code || velden.get("state") !== state.state) {
    return terug("/inloggen?fout=oauth");
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent");

  try {
    const identiteit = await wisselCodeIn(provider, code, state);
    const { user, nieuw } = await loginOfRegistreerMetOAuth({
      identiteit,
      rol: state.rol,
      akkoord: state.akkoord,
      ip,
      userAgent,
    });
    await createSession(user.id, { ip, userAgent });

    if (nieuw) {
      return terug(withNext(user.role === "ZZP" ? "/zzpers/registreren" : "/bedrijven/registreren", state.next));
    }
    if (state.next) return terug(state.next);
    return terug(user.role === "ZZP" ? "/zzpers/dashboard" : user.role === "COMPANY" ? "/bedrijven/dashboard" : "/admin");
  } catch (err) {
    if (err instanceof GeenAccountError) {
      return terug(withNext(`/registreren?fout=geen-account&via=${provider}`, state.next));
    }
    if (err instanceof EmailNietBevestigdError) return terug("/inloggen?fout=email-onbevestigd");
    if (err instanceof AccountGeblokkeerdError) return terug("/inloggen?fout=geblokkeerd");
    console.error(`[oauth] ${provider} mislukt:`, err instanceof Error ? err.message : err);
    return terug("/inloggen?fout=oauth");
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }): Promise<Response> {
  return callback(req, (await ctx.params).provider);
}

export async function POST(req: Request, ctx: { params: Promise<{ provider: string }> }): Promise<Response> {
  return callback(req, (await ctx.params).provider);
}
