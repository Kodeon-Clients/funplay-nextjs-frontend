import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/clientele.json";
import ClientsWhoTrustFunplay, { type ClientsWhoTrustFunplayProps } from "@/components/pages/clientele/ClientsWhoTrustFunplay";
import DownSection, { type DownSectionProps } from "@/components/pages/clientele/DownSection";
import Section5 from "@/components/pages/clientele/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ClientsWhoTrustFunplay {...section<ClientsWhoTrustFunplayProps>(page, "ClientsWhoTrustFunplay")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
      <Section5 />
    </PageShell>
  );
}
