import type { Metadata } from "next";
import { RegisterForm } from "../register-form";

export const metadata: Metadata = {
  title: "Account aanmaken",
  robots: { index: false },
};

export default async function RegistrerenPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; next?: string }>;
}) {
  const { rol, next } = await searchParams;
  const defaultRole = rol === "bedrijf" ? "COMPANY" : "ZZP";
  return <RegisterForm defaultRole={defaultRole} next={next ?? null} />;
}
