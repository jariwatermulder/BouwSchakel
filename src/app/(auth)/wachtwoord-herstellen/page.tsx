import type { Metadata } from "next";
import { ResetForm } from "../reset-form";

export const metadata: Metadata = {
  title: "Nieuw wachtwoord instellen",
  robots: { index: false },
};

export default async function WachtwoordHerstellenPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <ResetForm token={token ?? ""} />;
}
