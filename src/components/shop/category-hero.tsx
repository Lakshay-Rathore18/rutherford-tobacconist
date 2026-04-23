import { BrassDivider } from "@/components/primitives/brass-divider";

export function CategoryHero({
  eyebrow = "The Cabinet",
  title,
  blurb,
}: {
  eyebrow?: string;
  title: string;
  blurb: string;
}) {
  return (
    <section className="relative pt-16 md:pt-24 pb-12">
      <div className="container mx-auto max-w-5xl px-6 text-center">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.42em] text-[0.7rem] text-[var(--color-brass-highlight)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-cinzel)] text-5xl md:text-6xl tracking-[0.04em] text-[var(--color-parchment)]">
          {title}
        </h1>
        <BrassDivider className="mt-6 mx-auto max-w-[80px]" />
        <p className="mt-6 font-[family-name:var(--font-cormorant)] italic text-xl text-[var(--color-parchment-dim)] max-w-2xl mx-auto leading-relaxed">
          {blurb}
        </p>
      </div>
    </section>
  );
}
