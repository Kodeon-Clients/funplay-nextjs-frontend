import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { buildMetadata, section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/contact-us.json";
import ContactFunplaySystems, { type ContactFunplaySystemsProps } from "@/components/pages/contact-us/ContactFunplaySystems";
import DownSection, { type DownSectionProps } from "@/components/pages/contact-us/DownSection";
import Location from "@/components/pages/contact-us/Location";
import HowWeCanHelp, { type HowWeCanHelpProps } from "@/components/pages/contact-us/HowWeCanHelp";

const page = meta as PageMeta;

export const metadata: Metadata = buildMetadata(page);

export default function Page() {
  return (
    <PageShell page={page}>
      <ContactFunplaySystems {...section<ContactFunplaySystemsProps>(page, "ContactFunplaySystems")} />
      <DownSection {...section<DownSectionProps>(page, "DownSection")} />
      <Location />
      <HowWeCanHelp {...section<HowWeCanHelpProps>(page, "HowWeCanHelp")} />
    </PageShell>
  );
}
