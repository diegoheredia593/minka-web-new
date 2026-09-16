import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { termsDocument } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Términos y Condiciones - Minka",
  description: "Términos y Condiciones de Uso de Minka.",
  alternates: { canonical: "/legal/terminos" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TermsPage() {
  return <LegalPage document={termsDocument} />;
}
