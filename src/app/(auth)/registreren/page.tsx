import type { Metadata } from "next";
import { RegisterForm } from "../register-form";
import { enabledProviders } from "@/lib/auth/oauth-config";
import { OAUTH_FOUTEN } from "@/components/auth/oauth-knoppen";

export const metadata: Metadata = {
  title: "Account aanmaken",
  robots: { index: false },
};

export default async function RegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; next?: string; fout?: string }>;
}) {
  const { rol, next, fout } = await searchParams;
  const defaultRole = rol === "bedrijf" ? "COMPANY" : "ZZP";
  return (
    <RegisterForm
      defaultRole={defaultRole}
      next={next ?? null}
      providers={enabledProviders()}
      fout={fout ? (OAUTH_FOUTEN[fout] ?? OAUTH_FOUTEN.oauth) : null}
    />
  );
}
