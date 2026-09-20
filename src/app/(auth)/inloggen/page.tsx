import type { Metadata } from "next";
import { LoginForm } from "../login-form";
import { enabledProviders } from "@/lib/auth/oauth-config";
import { OAUTH_FOUTEN } from "@/components/auth/oauth-knoppen";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false },
};

export default async function InloggenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; fout?: string }>;
}) {
  const { next, fout } = await searchParams;
  return (
    <LoginForm
      next={next ?? null}
      providers={enabledProviders()}
      fout={fout ? (OAUTH_FOUTEN[fout] ?? OAUTH_FOUTEN.oauth) : null}
    />
  );
}
