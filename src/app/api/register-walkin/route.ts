import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

/* ──────────── In-memory rate limiter ────────────
 * Same pattern as /api/notify-order. Single Next runtime, best-effort.
 * Stricter cap than notify-order because this writes to the customers table
 * via a SECURITY DEFINER RPC and has no other gating step.
 */
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 4; // 4 sign-ups per IP per minute
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
  if (rateBuckets.size > 5_000) {
    for (const [k, v] of rateBuckets) {
      if (v.every((t) => t <= windowStart)) rateBuckets.delete(k);
    }
  }
  return false;
}

const Body = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(60),
  lastName: z.string().trim().max(60).optional().default(""),
  phone: z.string().trim().min(8, "A valid phone number is required.").max(20),
  ageConfirmed: z.literal(true, {
    message: "You must confirm you are 18 or older.",
  }),
  source: z.string().trim().max(40).optional().default("qr-counter"),
});

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many sign-ups from this connection. Try again in a minute." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid input.";
    return NextResponse.json({ ok: false, error: first }, { status: 400 });
  }

  const { firstName, lastName, phone, source } = parsed.data;

  const { data, error } = await supabase.rpc("register_walkin_customer", {
    p_first_name: firstName,
    p_last_name: lastName,
    p_phone: phone,
    p_source: source,
  });

  if (error) {
    // Map common DB validation errors to friendly copy
    const code = (error as { code?: string }).code;
    if (code === "22023") {
      return NextResponse.json(
        { ok: false, error: "That phone number doesn't look right. Try again." },
        { status: 400 },
      );
    }
    console.error("[register-walkin] supabase rpc error", error);
    return NextResponse.json(
      { ok: false, error: "Could not save right now. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, data });
}
