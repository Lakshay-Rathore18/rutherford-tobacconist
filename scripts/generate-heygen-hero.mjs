#!/usr/bin/env node
/**
 * generate-heygen-hero.mjs
 *
 * Founder runs this once with a Heygen API key set in `.env.local` to swap
 * the v1 stock hero loop for an AI-generated narrator clip.
 *
 * Usage:
 *   1. Edit `.env.local`:
 *        HEYGEN_API_KEY=sk_...
 *        HEYGEN_AVATAR_ID=...     (UUID — copy from app.heygen.com → Avatars)
 *        HEYGEN_VOICE_ID=...      (UUID — copy from Voices library)
 *   2. Optional: edit SCRIPT_TEXT below to your preferred narration.
 *   3. Run:  node scripts/generate-heygen-hero.mjs
 *   4. The script polls the Heygen job, downloads the MP4 to
 *      `public/video/hero-loop.mp4`, strips the audio track via ffmpeg
 *      (so the muted-autoplay hero never triggers a WCAG 1.2.2 captions
 *      obligation), and generates a fresh `public/images/texture/hero-poster.jpg`.
 *
 * Requires: Node 20+, ffmpeg on PATH.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

// ─────────────────────────────────────────────────────────────────────────────
// Narration script. Edit at will — keep under ~12 seconds for a hero loop.
// ─────────────────────────────────────────────────────────────────────────────
const SCRIPT_TEXT = `
Welcome to Rutherford Tobacconist — a counter for considered smokes,
fine vapours, and loose leaf, kept by people who care about the trade.
`.trim();

// ─────────────────────────────────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const KEY = process.env.HEYGEN_API_KEY;
const AVATAR_ID = process.env.HEYGEN_AVATAR_ID;
const VOICE_ID = process.env.HEYGEN_VOICE_ID;

if (!KEY || !AVATAR_ID || !VOICE_ID) {
  console.error(
    "Missing one of HEYGEN_API_KEY / HEYGEN_AVATAR_ID / HEYGEN_VOICE_ID in .env.local",
  );
  process.exit(1);
}

const HEY_API = "https://api.heygen.com";

async function startJob() {
  const res = await fetch(`${HEY_API}/v2/video/generate`, {
    method: "POST",
    headers: {
      "X-Api-Key": KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: AVATAR_ID,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            input_text: SCRIPT_TEXT,
            voice_id: VOICE_ID,
          },
          background: {
            type: "color",
            value: "#1A120B", // oak-deep
          },
        },
      ],
      dimension: { width: 1280, height: 720 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HeyGen generate failed (${res.status}): ${body}`);
  }
  const json = await res.json();
  const id = json?.data?.video_id;
  if (!id) throw new Error("HeyGen response missing video_id: " + JSON.stringify(json));
  return id;
}

async function pollJob(videoId) {
  const start = Date.now();
  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  while (Date.now() - start < TIMEOUT_MS) {
    const res = await fetch(
      `${HEY_API}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
      { headers: { "X-Api-Key": KEY } },
    );
    const json = await res.json();
    const status = json?.data?.status;
    process.stdout.write(`\r[heygen] status: ${status ?? "unknown"}    `);
    if (status === "completed") return json.data.video_url;
    if (status === "failed") throw new Error("HeyGen job failed: " + JSON.stringify(json));
    await new Promise((r) => setTimeout(r, 6000));
  }
  throw new Error("Timed out waiting for HeyGen job");
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(ab));
}

function stripAudioAndOptimize(srcPath, destPath) {
  console.log("\n[ffmpeg] stripping audio + optimizing for web…");
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i", srcPath,
      "-an",                 // drop audio (audit decision: avoid WCAG 1.2.2 trigger)
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-vf", "scale=1280:-2",
      destPath,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("ffmpeg failed");
}

function generatePoster(srcPath, destPath) {
  console.log("[ffmpeg] generating poster frame…");
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss", "00:00:01",
      "-i", srcPath,
      "-frames:v", "1",
      "-q:v", "3",
      "-vf", "scale=1920:-2",
      destPath,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("ffmpeg poster failed");
}

(async () => {
  console.log("[heygen] starting video job…");
  const videoId = await startJob();
  console.log(`[heygen] video_id=${videoId}`);
  const downloadUrl = await pollJob(videoId);
  console.log(`\n[heygen] downloading from ${downloadUrl}`);

  const tmp = path.join(ROOT, "public/video/_heygen-raw.mp4");
  const finalMp4 = path.join(ROOT, "public/video/hero-loop.mp4");
  const poster = path.join(ROOT, "public/images/texture/hero-poster.jpg");

  await download(downloadUrl, tmp);
  stripAudioAndOptimize(tmp, finalMp4);
  generatePoster(tmp, poster);
  fs.unlinkSync(tmp);

  console.log("\n✓ Hero swapped:");
  console.log("    " + finalMp4);
  console.log("    " + poster);
  console.log("\nReload http://localhost:3000 to see the new hero.");
})().catch((err) => {
  console.error("\n[heygen] FAILED:", err.message);
  process.exit(1);
});
