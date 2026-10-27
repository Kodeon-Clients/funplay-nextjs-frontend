import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/terms-of-service.json";
import TermsOfService, { type TermsOfServiceProps } from "@/components/pages/terms-of-service/TermsOfService";
import AcceptanceOfTerms, { type AcceptanceOfTermsProps } from "@/components/pages/terms-of-service/AcceptanceOfTerms";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <TermsOfService {...section<TermsOfServiceProps>(page, "TermsOfService")} />
      <AcceptanceOfTerms {...section<AcceptanceOfTermsProps>(page, "AcceptanceOfTerms")} />
    </PageShell>
  );
}
