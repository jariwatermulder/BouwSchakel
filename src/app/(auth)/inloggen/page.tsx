import type { Metadata } from "next";
import { LoginForm } from "../login-form";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false },
};

export default async function InloggenPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={next ?? null} />;
}
