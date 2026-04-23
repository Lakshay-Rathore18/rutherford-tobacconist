import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import { z } from "zod";

/* ──────────── In-memory rate limiter ────────────
 * Best-effort abuse guard. Sized for a single Next runtime; not shared across
 * edge instances. Good enough to block one bad actor hammering the form; real
 * protection is Twilio itself (paid) + upstream WAF if ever deployed behind one.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 requests per IP per minute
const rateBuckets = new Map<string, number[]>();

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateBuckets.get(ip) ?? []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, hits);
    return true;
  }
  hits.push(now);
  rateBuckets.set(ip, hits);
  // Prune occasionally so Map doesn't grow unbounded (best effort).
  if (rateBuckets.size > 5_000) {
    for (const [k, v] of rateBuckets) {
      if (v.every((t) => t <= windowStart)) rateBuckets.delete(k);
    }
  }
  return false;
}

/**
 * POST /api/notify-order
 *
 * Sends an SMS confirmation when an order is placed.
 * Server-side only. Failure is logged but never blocks the user — the order
 * has already been persisted client-side; SMS is best-effort.
 *
 * Required env (.env.local):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_FROM_NUMBER
 *   SMS_NOTIFICATIONS_ENABLED=true
 *
 * If any of the above are missing OR SMS_NOTIFICATIONS_ENABLED isn't truthy,
 * the route returns 200 { sent: false, reason: "disabled" } without erroring.
 */

const PayloadSchema = z.object({
  orderId: z.string().min(3).max(32),
  customerName: z.string().min(1).max(120),
  customerPhone: z.string().min(7).max(20),
  itemCount: z.number().int().positive(),
  totalUSD: z.number().nonnegative(),
});

function isSmsConfigured(): boolean {
  return Boolean(
    process.env.SMS_NOTIFICATIONS_ENABLED &&
      process.env.SMS_NOTIFICATIONS_ENABLED.toLowerCase() !== "false" &&
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

/** Loose E.164 normaliser. Strips formatting, ensures leading +. */
function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return digits.length >= 8 ? digits : null;
  }
  // Default to +1 (US/CA) if no country code given. Founder can override per region.
  return digits.length >= 7 ? `+1${digits.replace(/\D/g, "")}` : null;
}

function formatPriceUSD(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { sent: false, reason: "rate_limited" },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  let payload: z.infer<typeof PayloadSchema>;
  try {
    const json = await req.json();
    payload = PayloadSchema.parse(json);
  } catch {
    return NextResponse.json(
      { sent: false, reason: "invalid_payload" },
      { status: 400 },
    );
  }

  if (!isSmsConfigured()) {
    return NextResponse.json({ sent: false, reason: "disabled" }, { status: 200 });
  }

  const to = normalisePhone(payload.customerPhone);
  if (!to) {
    return NextResponse.json(
      { sent: false, reason: "invalid_phone" },
      { status: 200 },
    );
  }

  const firstName = payload.customerName.split(/\s+/)[0] ?? payload.customerName;
  const itemWord = payload.itemCount === 1 ? "item" : "items";
  const body =
    `Rutherford Tobacconist — order ${payload.orderId} confirmed. ` +
    `Hello ${firstName}, your ${payload.itemCount} ${itemWord} (${formatPriceUSD(payload.totalUSD)}) are being wrapped. ` +
    `A driver will telephone before arrival. Cash on delivery.`;

  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    );
    const result = await client.messages.create({
      from: process.env.TWILIO_FROM_NUMBER!,
      to,
      body,
    });
    return NextResponse.json(
      { sent: true, sid: result.sid, to: maskPhone(to) },
      { status: 200 },
    );
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown_error";
    // Log on server. Do not surface details to client.
    console.error("[notify-order] Twilio send failed:", reason);
    return NextResponse.json({ sent: false, reason: "send_failed" }, { status: 200 });
  }
}

/** Returns a masked variant for response payloads — never echo full phone. */
function maskPhone(phone: string): string {
  if (phone.length <= 6) return phone;
  return `${phone.slice(0, 3)}…${phone.slice(-3)}`;
}
