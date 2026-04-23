"use client";

import { use, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { OrderAudit } from "@/types";
import { ORDERS_KEY, formatPriceUSD, readableOrderId } from "@/lib/orders";
import { BrassDivider } from "@/components/primitives/brass-divider";
import { useIsClient, useLocalStorageRaw } from "@/lib/hooks";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ordersRaw = useLocalStorageRaw(ORDERS_KEY);
  const loaded = useIsClient();
  const order = useMemo<OrderAudit | null>(() => {
    if (!ordersRaw) return null;
    try {
      const list = JSON.parse(ordersRaw) as OrderAudit[];
      return list.find((o) => o.orderId === id) ?? null;
    } catch {
      return null;
    }
  }, [ordersRaw, id]);

  // Focus the H1 once it has actually mounted (loaded && order rendered the heading).
  useEffect(() => {
    if (loaded && order && headingRef.current) {
      headingRef.current.focus();
    }
  }, [loaded, order]);

  if (!loaded) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
          Locating your order…
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-[var(--color-parchment)]">
          Order not found
        </h1>
        <p className="mt-3 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)]">
          We couldn&rsquo;t locate order <span className="tabular-nums">{id}</span> on this device.
        </p>
        <Link
          href="/"
          className="inline-block mt-8 font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs text-[var(--color-brass-highlight)] brass-underline"
        >
          Return to the counter
        </Link>
      </div>
    );
  }

  const placed = new Date(order.placedAt);

  return (
    <div className="container mx-auto max-w-3xl px-6 py-16 md:py-24">
      <div role="status" aria-live="polite" className="sr-only">
        Order placed successfully. Order number {readableOrderId(order.orderId)}.
      </div>

      <div className="text-center">
        <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.42em] text-[0.7rem] text-[var(--color-brass-highlight)]">
          Order received
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-[family-name:var(--font-cinzel)] text-4xl md:text-5xl tracking-[0.04em] text-[var(--color-parchment)] outline-none"
        >
          Order confirmed
        </h1>
        <BrassDivider className="mt-6 mx-auto max-w-[100px]" />
        <p className="mt-6 font-[family-name:var(--font-cormorant)] italic text-xl text-[var(--color-parchment-dim)]">
          Thank you, {order.delivery.firstName}. We&rsquo;re wrapping
          your selection at the counter.
        </p>
      </div>

      <div className="mt-12 bg-[var(--color-oak-medium)] border border-[var(--color-brass)]/25 p-8 md:p-10">
        <dl className="grid sm:grid-cols-2 gap-y-6 gap-x-10">
          <div>
            <dt className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-parchment-dim)]">
              Order number
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cinzel)] text-2xl tracking-[0.18em] text-[var(--color-parchment)]">
              <span aria-hidden="true">{order.orderId}</span>
              <span className="sr-only">{readableOrderId(order.orderId)}</span>
            </dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-parchment-dim)]">
              Placed at
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)]">
              <time dateTime={order.placedAt}>
                {placed.toLocaleString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
            </dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-parchment-dim)]">
              Delivery to
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)] not-italic">
              {order.delivery.firstName} {order.delivery.lastName}
              <br />
              {order.delivery.street}
              {order.delivery.unit && (
                <>
                  <br />
                  {order.delivery.unit}
                </>
              )}
              <br />
              {order.delivery.city} {order.delivery.postal}
            </dd>
          </div>
          <div>
            <dt className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.65rem] text-[var(--color-parchment-dim)]">
              Driver contact
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-cormorant)] text-[var(--color-parchment)]">
              Your driver will telephone {order.delivery.phone} when nearby.
            </dd>
          </div>
        </dl>

        {/* SMS confirmation line — rendered only when Twilio confirmed dispatch.
            Audit decision: never claim "sent" if it wasn't.  Static text, not a
            live region — already announced by the page-arrival role="status". */}
        {order.smsStatus === "sent" && (
          <p className="mt-6 font-[family-name:var(--font-cormorant)] italic text-[var(--color-parchment-dim)] flex items-start gap-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mt-1 text-[var(--color-brass-highlight)] flex-shrink-0"
            >
              <rect x="2" y="3" width="12" height="9" rx="1.5" />
              <path d="M2.5 4.5l5.5 4 5.5-4" />
            </svg>
            <span>
              We&rsquo;ve sent a confirmation message to {order.delivery.phone}.
            </span>
          </p>
        )}

        <BrassDivider className="my-8 opacity-40" />

        <h2 className="font-[family-name:var(--font-cinzel)] text-xl tracking-[0.06em] text-[var(--color-parchment)] mb-4">
          Your order
        </h2>
        <ul className="divide-y divide-[var(--color-brass)]/15">
          {order.items.map((it, i) => (
            <li
              key={`${it.productId}-${i}`}
              className="py-3 flex items-baseline justify-between gap-3"
            >
              <div>
                <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.18em] text-[0.6rem] text-[var(--color-brass-highlight)]">
                  {it.brand}
                </p>
                <p className="font-[family-name:var(--font-cinzel)] text-base text-[var(--color-parchment)]">
                  {it.name}
                </p>
                <p className="font-[family-name:var(--font-cormorant)] italic text-xs text-[var(--color-parchment-deep)]">
                  {it.variantSize ? `${it.variantSize} · ` : ""}qty {it.qty}
                </p>
              </div>
              <p className="font-[family-name:var(--font-libre-caslon)] tabular-nums text-[var(--color-parchment)] text-sm">
                {formatPriceUSD(it.unitPriceUSD * it.qty)}
              </p>
            </li>
          ))}
        </ul>

        <BrassDivider className="my-6 opacity-40" />

        <div className="flex items-baseline justify-between">
          <span className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.22em] text-[0.7rem] text-[var(--color-parchment-dim)]">
            Total — Cash on delivery
          </span>
          <span className="font-[family-name:var(--font-cinzel)] text-3xl tabular-nums text-[var(--color-parchment)]">
            {formatPriceUSD(order.subtotalUSD)}
          </span>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/"
          className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.28em] text-xs text-[var(--color-brass-highlight)] brass-underline"
        >
          Return to the counter
        </Link>
      </div>
    </div>
  );
}
