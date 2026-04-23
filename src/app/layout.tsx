import type { Metadata, Viewport } from "next";
import { fraunces, cormorant, inter } from "@/styles/fonts";
import "./globals.css";

import { AgeGateProvider } from "@/components/layout/age-gate-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartHydration } from "@/components/cart/cart-hydration";
import { StockProvider } from "@/components/shop/stock-provider";
import { LenisProvider } from "@/components/ambient/lenis-provider";
import { CursorLight } from "@/components/ambient/cursor-light";
import { SkipLink } from "@/components/layout/skip-link";
import { BRAND } from "@/lib/brand";
import { SITE_URL, SITE_LOCALE, DEFAULT_OG_IMAGE, canonical } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import {
  organizationSchema,
  websiteSchema,
  storeSchema,
} from "@/components/seo/schemas";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
  },
  description:
    "Smokes, vapes, and loose leaf — at your doorstep before the kettle boils. Phone orders 6 AM – 11 PM. Delivery in 1–3 hours. 18+ only.",
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "shopping",
  keywords: [
    "tobacconist",
    "cigarettes delivery",
    "vapes delivery",
    "tobacco pouches",
    "rolling tobacco",
    "pipe tobacco",
    "after-hours tobacco",
    "phone order tobacco",
    "Rutherford Tobacconist",
    "Australia tobacco delivery",
  ],
  alternates: {
    canonical: canonical("/"),
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description:
      "Phone-order tobacconist open 6 AM – 11 PM. Smokes, vapes and loose leaf at your door in 1–3 hours.",
    siteName: BRAND.name,
    url: canonical("/"),
    type: "website",
    locale: SITE_LOCALE,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND.name,
    description: BRAND.tagline,
    images: [DEFAULT_OG_IMAGE.url],
  },
  formatDetection: { telephone: false, email: false, address: false },
  referrer: "strict-origin-when-cross-origin",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E0B09" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0B09" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${cormorant.variable} ${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col antialiased">
        <SkipLink />

        <CartHydration />
        <LenisProvider />
        <CursorLight />
        <GrainOverlay />

        <noscript>
          <div
            role="status"
            style={{
              padding: "1.5rem",
              background: "#191410",
              color: "#E9DDC6",
              borderBottom: "1px solid #C8893F",
              fontFamily: "Georgia, serif",
              textAlign: "center",
            }}
          >
            <strong>JavaScript is required.</strong> The age gate, cart and
            checkout flow cannot operate without it. For browsing only, the
            catalogue is fully server-rendered below.
          </div>
        </noscript>

        {/* Root-level JSON-LD — emits on every route, picked up by search + LLM crawlers.
            Rendered server-side; invisible to screen readers (type=ld+json). */}
        <JsonLd
          id="ld-organization"
          data={[organizationSchema(), websiteSchema(), storeSchema()]}
        />

        <AgeGateProvider>
          <StockProvider>
            <Header />
            <main
              id="main"
              tabIndex={-1}
              className="flex-1 relative outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-brass-highlight)] focus-visible:outline-offset-[-3px]"
              aria-label="Main content"
            >
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </StockProvider>
        </AgeGateProvider>

        <Toaster
          position="bottom-right"
          richColors={false}
          toastOptions={{
            classNames: {
              toast:
                "border border-[var(--color-accent-amber)]/30 bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] font-[family-name:var(--font-inter)] shadow-2xl",
              title: "text-[var(--color-text-primary)]",
              description: "text-[var(--color-text-muted)]",
            },
          }}
        />
      </body>
    </html>
  );
}
