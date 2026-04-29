#!/usr/bin/env node
/**
 * Generate the walk-in sign-up QR code.
 *
 * Usage:
 *   node scripts/generate-walkin-qr.mjs                                 # uses NEXT_PUBLIC_SITE_URL
 *   node scripts/generate-walkin-qr.mjs https://rutherford-tobacconist.com
 *
 * Output:
 *   public/qr-walkin.png   (1024x1024, ECC level H — survives crumpled prints)
 *   public/qr-walkin.svg   (vector, scales cleanly to A4 / business card)
 *
 * The QR encodes:  <BASE_URL>/welcome?src=qr-counter
 *
 * Print at any size — the SVG is the canonical source. PNG is a convenience
 * raster for chat / social posting.
 */

import QRCode from "qrcode";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
loadEnv({ path: path.join(repoRoot, ".env.local") });

const cliArg = process.argv[2];
const baseUrl =
  cliArg ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

if (!/^https?:\/\//.test(baseUrl)) {
  console.error(`[qr] Base URL must start with http:// or https:// — got "${baseUrl}"`);
  process.exit(1);
}

const target = `${baseUrl.replace(/\/$/, "")}/welcome?src=qr-counter`;

const outDir = path.join(repoRoot, "public");
await mkdir(outDir, { recursive: true });

const pngPath = path.join(outDir, "qr-walkin.png");
const svgPath = path.join(outDir, "qr-walkin.svg");

const opts = {
  errorCorrectionLevel: "H", // 30% damage tolerance — print + handling friendly
  margin: 2,
  color: { dark: "#1a1a1a", light: "#ffffff" },
};

await QRCode.toFile(pngPath, target, { ...opts, type: "png", width: 1024 });
const svgString = await QRCode.toString(target, { ...opts, type: "svg", width: 1024 });
await writeFile(svgPath, svgString, "utf8");

console.log("[qr] Encoded URL:", target);
console.log("[qr] Wrote:", path.relative(repoRoot, pngPath));
console.log("[qr] Wrote:", path.relative(repoRoot, svgPath));
console.log("[qr] Print the SVG at any size. ECC level H tolerates ~30% print damage.");
