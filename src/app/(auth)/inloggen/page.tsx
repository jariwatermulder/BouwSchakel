import type { Metadata } from "next";
import { LoginForm } from "../login-form";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false },
};

export default function InloggenPage() {
  return <LoginForm />;
}
