import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { privacyDocument } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Política de Privacidad - Minka",
  description: "Política de Privacidad de Minka.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyPage() {
  return <LegalPage document={privacyDocument} />;
}
