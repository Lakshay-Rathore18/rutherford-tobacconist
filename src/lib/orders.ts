"use client";

import type { OrderAudit, CartItem, DeliveryAddress, DOB, SmsStatus } from "@/types";
import { fullNameOf } from "@/types";
import { hashDob } from "@/lib/age-verification";

export const ORDERS_KEY = "rt_orders";

/**
 * Generate a human-readable order ID: RT + 5-digit zero-padded.
 */
export function generateOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `RT${n}`;
}

/**
 * Format an order ID for screen-reader announcement (digit-by-digit).
 * "RT10042" → "R T, 1 0 0 4 2"
 */
export function readableOrderId(orderId: string): string {
  const letters = orderId.slice(0, 2).split("").join(" ");
  const digits = orderId.slice(2).split("").join(" ");
  return `${letters}, ${digits}`;
}

export function formatPriceUSD(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Persist an order audit record to localStorage. Schema is forward-compatible
 * with a v2 Supabase table (`orders` with the same fields).
 *
 * If `sendSms: true`, fires a POST to `/api/notify-order` in parallel with
 * the hash computation and attaches the result as `smsStatus` on the audit.
 * SMS failure never blocks persistence.
 */
export async function persistOrder(args: {
  items: CartItem[];
  delivery: DeliveryAddress;
  dob: DOB;
  sendSms?: boolean;
}): Promise<OrderAudit> {
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const itemsTotalUSD = args.items.reduce(
    (s, it) => s + it.unitPriceUSD * it.qty,
    0,
  );

  // Bulk discount: $5 off per 10 cigarette packs, stackable.
  const { bulkDiscountForPacks } = await import("@/lib/products");
  const cigarettePacks = args.items
    .filter((it) => it.category === "cigarettes")
    .reduce((s, it) => s + it.qty, 0);
  const bulkDiscountUSD = bulkDiscountForPacks(cigarettePacks);
  const subtotalUSD = Math.max(0, itemsTotalUSD - bulkDiscountUSD);

  // Fire hash + SMS in parallel.
  const hashPromise = hashDob(args.dob, orderId);
  const smsPromise: Promise<SmsStatus> = args.sendSms
    ? dispatchSms({
        orderId,
        customerName: fullNameOf(args.delivery),
        customerPhone: args.delivery.phone,
        itemCount: args.items.reduce((s, it) => s + it.qty, 0),
        totalUSD: subtotalUSD,
      })
    : Promise.resolve("skipped" as SmsStatus);

  const [dobHash, smsStatus] = await Promise.all([hashPromise, smsPromise]);

  const audit: OrderAudit = {
    orderId,
    placedAt: now,
    confirmedAt: now,
    dobHash,
    items: args.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      brand: it.brand,
      variantSize: it.variantSize,
      qty: it.qty,
      unitPriceUSD: it.unitPriceUSD,
    })),
    delivery: args.delivery,
    paymentMethod: "COD",
    subtotalUSD,
    itemsTotalUSD,
    bulkDiscountUSD: bulkDiscountUSD > 0 ? bulkDiscountUSD : undefined,
    smsStatus,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(ORDERS_KEY);
      const list: OrderAudit[] = raw ? (JSON.parse(raw) as OrderAudit[]) : [];
      list.unshift(audit);
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {
      // Silently swallow — order still returned to caller.
    }
  }

  return audit;
}

/**
 * Dispatch an SMS via the /api/notify-order endpoint. Never throws — always
 * resolves to an SmsStatus. Callers must trust the returned status and never
 * assume "sent" unless the server confirmed it.
 */
async function dispatchSms(payload: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  itemCount: number;
  totalUSD: number;
}): Promise<SmsStatus> {
  try {
    const res = await fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      sent?: boolean;
      reason?: string;
    };
    if (data.sent === true) return "sent";
    if (data.reason === "disabled") return "skipped";
    return "failed";
  } catch {
    return "failed";
  }
}

export function getOrder(orderId: string): OrderAudit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    if (!raw) return null;
    const list = JSON.parse(raw) as OrderAudit[];
    return list.find((o) => o.orderId === orderId) ?? null;
  } catch {
    return null;
  }
}
