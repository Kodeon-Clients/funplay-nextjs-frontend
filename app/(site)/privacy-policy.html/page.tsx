import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/privacy-policy.json";
import PrivacyPolicy, { type PrivacyPolicyProps } from "@/components/pages/privacy-policy/PrivacyPolicy";
import Introduction, { type IntroductionProps } from "@/components/pages/privacy-policy/Introduction";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <PrivacyPolicy {...section<PrivacyPolicyProps>(page, "PrivacyPolicy")} />
      <Introduction {...section<IntroductionProps>(page, "Introduction")} />
    </PageShell>
  );
}
