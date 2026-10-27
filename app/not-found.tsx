import type { Metadata } from "next";
import "./globals.css";
import Behaviors from "@/components/Behaviors";
import PageShell from "@/components/PageShell";
import { section, type PageMeta } from "@/lib/page";
import meta from "@/content/pages/404.json";
import Section5, { type Section5Props } from "@/components/pages/404/Section5";

const page = meta as PageMeta;

export const metadata: Metadata = { title: { absolute: "Page not found | FunPlay Systems" }, robots: { index: false, follow: true } };

/** 404 page, with the original 404 design. */
export default function NotFound() {
  return (
    <>
      <PageShell page={page}>
      <Section5 {...section<Section5Props>(page, "Section5")} />
      </PageShell>
      <Behaviors />
    </>
  );
}
