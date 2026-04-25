import { BrassDivider } from "@/components/primitives/brass-divider";
import { MotionReveal } from "@/components/primitives/motion-reveal";
import { AmbientBackdrop } from "@/components/ambient/ambient-backdrop";

export function CraftStory() {
  return (
    <section
      aria-labelledby="craft-title"
      className="relative py-28 md:py-40 overflow-hidden"
    >
      {/* Ambient — late-night counter glow behind the prose. Subtle. */}
      <AmbientBackdrop
        src="/video/ambient/cigar-night.mp4"
        opacity={0.18}
        blend="screen"
      />
      <div className="container mx-auto max-w-5xl px-6 relative">
        <MotionReveal className="text-center mb-14">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.4em] text-[0.78rem] text-[var(--color-brass-highlight)]">
            Of the trade
          </p>
          <h2
            id="craft-title"
            aria-label="How a smoke ought to be sold."
            className="mt-4 font-[family-name:var(--font-cinzel)] text-4xl md:text-6xl tracking-[0.04em] text-[var(--color-parchment)]"
          >
            <span aria-hidden="true">How a smoke</span>
            <br aria-hidden="true" />
            <span
              aria-hidden="true"
              className="italic font-[family-name:var(--font-cormorant)] text-[var(--color-brass-highlight)] tracking-normal"
            >
              ought to be sold.
            </span>
          </h2>
          <BrassDivider className="mt-8 mx-auto max-w-[80px]" />
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div className="space-y-6 font-[family-name:var(--font-cormorant)] text-xl leading-[1.8] text-[var(--color-parchment-dim)] max-w-[60ch]">
              <p className="drop-cap">
                A tobacconist&rsquo;s job is patience. Leaf cures slow.
                A pouch sits on the shelf for a season before it&rsquo;s asked
                for. A regular finds the brand they want and stays with it for
                years. None of it rewards a hurry.
              </p>
              <p>
                We carry what we can stand behind. House blends, the standards,
                a small set of vape devices picked for draw and service life,
                and loose leaf in the cuts that actually roll cleanly. If a
                pouch doesn&rsquo;t earn its drawer, it leaves the cabinet.
              </p>
              <p>
                Open the laptop after work. Drop a cigarette pack, a vape pod,
                a hundred grams of bright Virginia in your selection. By the
                time the news ends, a driver is already on the way.
              </p>
            </div>

            <div className="space-y-8">
              <blockquote className="border-l-2 border-[var(--color-brass)] pl-6 py-2">
                <p className="font-[family-name:var(--font-cormorant)] italic text-2xl md:text-[1.85rem] leading-[1.5] text-[var(--color-parchment)] max-w-[40ch]">
                  &ldquo;The right cigar isn&rsquo;t the most expensive one.
                  It&rsquo;s the one that finishes the way you want it to.&rdquo;
                </p>
                <footer className="mt-4 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-sm text-[var(--color-brass-highlight)]">
                  — From the counter
                </footer>
              </blockquote>

              <div className="space-y-6 font-[family-name:var(--font-cormorant)] text-xl leading-[1.8] text-[var(--color-parchment-dim)] max-w-[60ch]">
                <p>
                  We don&rsquo;t do flavoured marketing. We don&rsquo;t do
                  novelty. The catalogue is small on purpose. We&rsquo;d
                  rather walk into your address with a pouch the regulars
                  already trust than a hundred new releases nobody asked for.
                </p>
                <p className="italic text-[var(--color-parchment-deep)]">
                  This isn&rsquo;t a brand. It&rsquo;s a counter that ships.
                </p>
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
