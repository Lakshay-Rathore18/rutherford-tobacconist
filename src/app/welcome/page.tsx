import type { Metadata } from "next";
import { WelcomeForm } from "./welcome-form";
import { BRAND, COMPLIANCE_LINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Welcome to ${BRAND.shortName}`,
  description: `Quick sign-up for ${BRAND.name}. Drop your name and phone — we'll save you time on your next order.`,
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ src?: string | string[] }>;

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const rawSrc = Array.isArray(sp.src) ? sp.src[0] : sp.src;
  const source = typeof rawSrc === "string" && rawSrc.length > 0 && rawSrc.length < 40
    ? rawSrc
    : "qr-counter";

  return (
    <section
      aria-labelledby="welcome-heading"
      className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col items-stretch justify-center px-5 py-10 sm:py-16"
    >
      <header className="mb-6 text-center">
        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {BRAND.shortName}
        </p>
        <h1 id="welcome-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Welcome in.
        </h1>
        <p className="mt-2 text-base leading-relaxed text-muted-foreground">
          Drop your name and number. We&rsquo;ll have your order ready faster next time.
        </p>
      </header>

      <WelcomeForm source={source} />

      <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
        {COMPLIANCE_LINE}
      </p>
    </section>
  );
}
