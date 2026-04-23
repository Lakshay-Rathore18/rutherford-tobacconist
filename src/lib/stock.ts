import type { Product } from "@/types";
import { supabase } from "./supabase";

/**
 * Live stock is sourced from Supabase. The frontend catalogue in
 * src/lib/products.ts is the editorial source of truth (descriptions,
 * tasting notes, flavour composition, images); Supabase owns stock + active.
 *
 * Supabase rows are flat (one row per flavour / per variant). Static families
 * fan out to multiple Supabase rows — e.g. one "IGET Bar Pro" family maps to
 * 11 Supabase rows, one per flavour. This module owns the mapping.
 */

export type DbProductRow = {
  id: string;
  brand: string;
  name: string;
  stock: number;
  active: boolean | null;
  category_id: string | null;
};

/** Per-flavour/variant stock for a family. */
export type StockEntry = {
  /** Sum of live stock across all children of the family. */
  familyStock: number;
  /** True when every child of the family is active. */
  familyActive: boolean;
  /** Map: normalised flavour name → live stock for that flavour (vapes, pouches). */
  flavourStock?: Record<string, number>;
  /** Map: normalised flavour name → active flag. */
  flavourActive?: Record<string, boolean>;
  /** Map: variant size ("100g" / "1kg") → live stock. */
  variantStock?: Record<string, number>;
  /** Map: variant size → active flag. */
  variantActive?: Record<string, boolean>;
};

export type StockMap = Record<string, StockEntry>;

/** Derived: true when the family has zero saleable units (all children OOS or inactive). */
export function isFamilyOutOfStock(entry: StockEntry | undefined): boolean {
  if (!entry) return false; // unknown → optimistic
  return !entry.familyActive || entry.familyStock <= 0;
}

export function flavourIsAvailable(
  entry: StockEntry | undefined,
  flavour: string,
): boolean {
  if (!entry) return true;
  if (!entry.flavourStock) return entry.familyStock > 0 && entry.familyActive;
  const key = normaliseFlavour(flavour);
  const stock = entry.flavourStock[key] ?? 0;
  const active = entry.flavourActive?.[key] ?? false;
  return active && stock > 0;
}

export function variantIsAvailable(
  entry: StockEntry | undefined,
  size: string,
): boolean {
  if (!entry) return true;
  if (!entry.variantStock) return entry.familyStock > 0 && entry.familyActive;
  const stock = entry.variantStock[size] ?? 0;
  const active = entry.variantActive?.[size] ?? false;
  return active && stock > 0;
}

/**
 * Strip parenthetical aliases and lowercase. Example:
 *   "Grapey (Grape Candy)" → "grapey"
 *   "Lush Ice (Watermelon Ice)" → "lush ice"
 * Used on both sides of the join so the Slick aliasing works.
 */
export function normaliseFlavour(s: string): string {
  return s.replace(/\s*\([^)]*\)\s*/g, "").trim().toLowerCase();
}

/**
 * Per-family mapping from the static catalogue to Supabase rows. Keyed by
 * static `Product.id`. One of `matchByName` (single-row family) or
 * `matchByBrandPrefix` (multi-row family) will be set.
 */
type FamilyMapping =
  | {
      kind: "single";
      /** Exact DB `name` for the one Supabase row. */
      dbName: string;
    }
  | {
      kind: "flavours";
      /** DB `brand` column for all child rows. */
      dbBrand: string;
      /** Common prefix on `name` to strip when deriving flavour. Defaults to `dbBrand + " "`. */
      prefix?: string;
    }
  | {
      kind: "variants";
      /** DB `brand` column. */
      dbBrand: string;
      /** Map from static variant size → exact DB `name`. */
      dbNamesBySize: Record<string, string>;
    };

const FAMILY_MAP: Record<string, FamilyMapping> = {
  // ── Cigarettes (1 row each, matched by exact DB name) ──
  "cig-marlboro-red": { kind: "single", dbName: "Marlboro Red" },
  "cig-manchester-red": { kind: "single", dbName: "Manchester Red" },
  "cig-double-happiness-soft-pack": {
    kind: "single",
    dbName: "Double Happiness Soft Pack",
  },
  "cig-double-happiness-red": {
    kind: "single",
    dbName: "Double Happiness Red",
  },
  "cig-euro-red": { kind: "single", dbName: "Euro Red" },
  "cig-manchester-lights": { kind: "single", dbName: "Manchester Lights" },
  "cig-manchester-green-crush": {
    kind: "single",
    dbName: "Manchester Green Crush",
  },
  "cig-oscar": { kind: "single", dbName: "Oscar" },
  "cig-manchester-special-edition": {
    kind: "single",
    dbName: "Manchester Special Edition",
  },
  "cig-manchester-reserve": { kind: "single", dbName: "Manchester Reserve" },
  "cig-gold-pin": { kind: "single", dbName: "Gold Pin" },
  "cig-esse-lights": { kind: "single", dbName: "Esse Lights" },
  "cig-esse-menthol": { kind: "single", dbName: "Esse Menthol" },
  "cig-manchester-double-drive": {
    kind: "single",
    dbName: "Manchester Double Drive",
  },
  "cig-manchester-original-b": {
    kind: "single",
    dbName: "Manchester Original B",
  },
  "cig-winfield-original-classic": {
    kind: "single",
    dbName: "Winfield Original Classic",
  },
  "cig-jps": { kind: "single", dbName: "JPS" },

  // ── Vapes (fan-out by flavour; DB brand is the product line) ──
  "vape-z-lodar": { kind: "flavours", dbBrand: "Z Lodar" },
  "vape-i-get-one": { kind: "flavours", dbBrand: "I Get One" },
  "vape-i-get-bar-pro": { kind: "flavours", dbBrand: "I Get Bar Pro" },
  "vape-ali-bar": { kind: "flavours", dbBrand: "Ali Bar" },
  "vape-ali-12k": { kind: "flavours", dbBrand: "Ali 12K" },
  "vape-bullubul": { kind: "flavours", dbBrand: "Bullubul" },
  "vape-slick": { kind: "flavours", dbBrand: "Slick" },

  // ── Nicotine pouches (fan-out by flavour) ──
  "nic-zyn": { kind: "flavours", dbBrand: "Zyn" },
  "nic-velo": { kind: "flavours", dbBrand: "Velo" },

  // ── Tobacco pouch (variants by size) ──
  "pouch-manchester-tobacco": {
    kind: "variants",
    dbBrand: "Manchester",
    dbNamesBySize: {
      "100g": "Manchester Tobacco Pouch 100g",
      "1kg": "Manchester Tobacco Pouch 1kg",
    },
  },
};

/** Build a StockMap from raw Supabase rows. Unmapped rows are silently ignored. */
export function buildStockMap(rows: DbProductRow[]): StockMap {
  const map: StockMap = {};
  // Index rows for O(1) lookups inside the mapping loop.
  const byDbName = new Map<string, DbProductRow>();
  const byDbBrand = new Map<string, DbProductRow[]>();
  for (const r of rows) {
    byDbName.set(r.name, r);
    const list = byDbBrand.get(r.brand) ?? [];
    list.push(r);
    byDbBrand.set(r.brand, list);
  }

  for (const [staticId, mapping] of Object.entries(FAMILY_MAP)) {
    if (mapping.kind === "single") {
      const row = byDbName.get(mapping.dbName);
      if (!row) continue;
      map[staticId] = {
        familyStock: row.stock,
        familyActive: !!row.active,
      };
      continue;
    }

    if (mapping.kind === "flavours") {
      const children = byDbBrand.get(mapping.dbBrand) ?? [];
      if (children.length === 0) continue;
      const prefix = (mapping.prefix ?? mapping.dbBrand + " ").toLowerCase();
      const flavourStock: Record<string, number> = {};
      const flavourActive: Record<string, boolean> = {};
      let familyStock = 0;
      let allActive = true;
      for (const r of children) {
        const nameLower = r.name.toLowerCase();
        const flavourNameRaw = nameLower.startsWith(prefix)
          ? r.name.slice(prefix.length)
          : r.name;
        const key = normaliseFlavour(flavourNameRaw);
        flavourStock[key] = r.stock;
        flavourActive[key] = !!r.active;
        familyStock += r.stock;
        if (!r.active) allActive = false;
      }
      map[staticId] = {
        familyStock,
        familyActive: allActive,
        flavourStock,
        flavourActive,
      };
      continue;
    }

    if (mapping.kind === "variants") {
      const variantStock: Record<string, number> = {};
      const variantActive: Record<string, boolean> = {};
      let familyStock = 0;
      let allActive = true;
      for (const [size, dbName] of Object.entries(mapping.dbNamesBySize)) {
        const row = byDbName.get(dbName);
        if (!row) continue;
        variantStock[size] = row.stock;
        variantActive[size] = !!row.active;
        familyStock += row.stock;
        if (!row.active) allActive = false;
      }
      map[staticId] = {
        familyStock,
        familyActive: allActive,
        variantStock,
        variantActive,
      };
    }
  }

  return map;
}

/** Client-side fetch of the full stock map. Public products table has anon read. */
export async function fetchStockMap(): Promise<StockMap> {
  const { data, error } = await supabase
    .from("products")
    .select("id, brand, name, stock, active, category_id");
  if (error) {
    console.error("[stock] fetch failed:", error);
    return {};
  }
  return buildStockMap((data ?? []) as DbProductRow[]);
}

/**
 * Convenience: decide if a given Product + current selection is saleable.
 * Used by cart/add-to-cart paths as a defensive guard.
 */
export function selectionIsAvailable(
  product: Product,
  entry: StockEntry | undefined,
  selection: { flavour?: string; variantSize?: string },
): boolean {
  if (!entry) return true;
  if (!entry.familyActive) return false;
  if (selection.flavour && entry.flavourStock) {
    return flavourIsAvailable(entry, selection.flavour);
  }
  if (selection.variantSize && entry.variantStock) {
    return variantIsAvailable(entry, selection.variantSize);
  }
  return entry.familyStock > 0;
}
