import type { Metadata } from "next";
import { ForgotForm } from "../forgot-form";

export const metadata: Metadata = {
  title: "Wachtwoord vergeten",
  robots: { index: false },
};

export default function WachtwoordVergetenPage() {
  return <ForgotForm />;
}
