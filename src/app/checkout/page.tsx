import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { BrassDivider } from "@/components/primitives/brass-divider";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order. Cash on delivery only.",
};

export default function CheckoutPage() {
  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
      <header className="mb-12 text-center">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.4em] text-[0.7rem] text-[var(--color-brass-highlight)]">
          Final wrap
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)]">
          Checkout
        </h1>
        <BrassDivider className="mt-5 mx-auto max-w-[100px] opacity-60" />
        <p className="mt-4 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] max-w-md mx-auto">
          Confirm your details. We collect payment in cash on delivery —
          no card details are stored.
        </p>
      </header>
      <CheckoutForm />
    </div>
  );
}
