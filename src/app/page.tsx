import type { Metadata } from "next";
import { HeroVideo } from "@/components/home/hero-video";
import { HeritageSection } from "@/components/home/heritage-section";
import { ScrollScene } from "@/components/home/scroll-scene";
import { TastingMarquee } from "@/components/home/tasting-marquee";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { TonightsPick } from "@/components/home/tonights-pick";
import { CraftStory } from "@/components/home/craft-story";
import { DriftGallery } from "@/components/home/drift-gallery";
import { HowItWorks } from "@/components/home/how-it-works";
import { CallToOrder } from "@/components/home/call-to-order";
import { SectionBoundary } from "@/components/primitives/section-boundary";
import { JsonLd } from "@/components/seo/json-ld";
import {
  faqSchema,
  breadcrumbSchema,
  localBusinessSchema,
  speakableSchema,
} from "@/components/seo/schemas";
import { BRAND } from "@/lib/brand";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: `${BRAND.name} — Phone-Order Tobacconist, Open 6 AM – 11 PM`,
  description:
    "Call the counter for smokes, vapes and loose leaf. Delivery in 1–3 hours across Australia. Verify your age once on the site, then order by phone. 18+ only.",
  alternates: { canonical: canonical("/") },
  openGraph: {
    title: `${BRAND.name} — Phone-Order Tobacconist`,
    description:
      "Smokes, vapes and loose leaf to your door before the kettle boils. 6 AM – 11 PM · 1–3 hour delivery.",
    url: canonical("/"),
  },
};

export default function Home() {
  return (
    <>
      {/* FAQPage + BreadcrumbList + LocalBusiness + Speakable for answer-engine
          + rich-result surfaces. All facts mirror the visible copy in
          HowItWorks + CallToOrder + Footer. Speakable CSS selectors point to
          [data-speakable] anchors rendered by HowItWorks + CallToOrder. */}
      <JsonLd id="ld-home-faq" data={faqSchema()} />
      <JsonLd id="ld-home-localbusiness" data={localBusinessSchema()} />
      <JsonLd id="ld-home-speakable" data={speakableSchema()} />
      <JsonLd
        id="ld-home-crumbs"
        data={breadcrumbSchema([{ name: "Home", path: "/" }])}
      />

      <SectionBoundary name="hero"><HeroVideo /></SectionBoundary>
      <SectionBoundary name="heritage"><HeritageSection /></SectionBoundary>
      <SectionBoundary name="scroll-scene"><ScrollScene /></SectionBoundary>
      <SectionBoundary name="tasting"><TastingMarquee /></SectionBoundary>
      <SectionBoundary name="categories"><CategoryShowcase /></SectionBoundary>
      <SectionBoundary name="tonights-pick"><TonightsPick /></SectionBoundary>
      <SectionBoundary name="craft"><CraftStory /></SectionBoundary>
      <SectionBoundary name="drift"><DriftGallery /></SectionBoundary>
      <SectionBoundary name="how-it-works"><HowItWorks /></SectionBoundary>
      <SectionBoundary name="call-to-order"><CallToOrder /></SectionBoundary>
    </>
  );
}
