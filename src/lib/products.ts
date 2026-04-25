import type { Category, Product } from "@/types";

/**
 * Full counter inventory. Cigarettes, vapes (device families with
 * user-selectable flavours), nicotine pouches (Zyn / Velo), and the
 * Manchester tobacco pouch.
 *
 * Photography is generated SVG (see ProductMark); `imageUrl` paths are
 * kept for forward compatibility with real product photography uploads.
 *
 * Cigarette pricing qualifies for the bulk discount: $5 off per 10 packs
 * purchased across any cigarette SKUs, stackable. Discount is computed in
 * the cart store and surfaced in the drawer / cart page / checkout.
 */
export const PRODUCTS: Product[] = [
  /* ─────────────────────────── CIGARETTES (17) ─────────────────────────── */
  {
    id: "cig-marlboro-red",
    slug: "marlboro-red",
    name: "Red",
    brand: "Marlboro",
    category: "cigarettes",
    description:
      "A full-flavour king-size pack. The counter standard that doesn't need an introduction.",
    priceUSD: 13,
    imageUrl: "/images/products/marlboro-red.svg",
    stock: 120,
    bestSeller: true,
  },
  {
    id: "cig-manchester-red",
    slug: "manchester-red",
    name: "Red",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "Manchester's full-strength red. A firm draw and a warm finish.",
    priceUSD: 15,
    imageUrl: "/images/products/manchester-red.svg",
    stock: 90,
  },
  {
    id: "cig-double-happiness-soft-pack",
    slug: "double-happiness-soft-pack",
    name: "Soft Pack",
    brand: "Double Happiness",
    category: "cigarettes",
    description:
      "The soft-pack edition. Slower burn, fuller body — a long-format smoke from the Shanghai house.",
    priceUSD: 20,
    imageUrl: "/images/products/double-happiness-soft-pack.svg",
    stock: 45,
  },
  {
    id: "cig-double-happiness-red",
    slug: "double-happiness-red",
    name: "Red",
    brand: "Double Happiness",
    category: "cigarettes",
    description:
      "The hard-pack classic — deep-cured tobacco with the signature Double Happiness richness.",
    priceUSD: 15,
    imageUrl: "/images/products/double-happiness-red.svg",
    stock: 55,
  },
  {
    id: "cig-euro-red",
    slug: "euro-red",
    name: "Red",
    brand: "Euro",
    category: "cigarettes",
    description:
      "An everyday European-style red. Clean draw, steady burn, counter-standard price.",
    priceUSD: 13,
    imageUrl: "/images/products/euro-red.svg",
    stock: 110,
  },
  {
    id: "cig-manchester-lights",
    slug: "manchester-lights",
    name: "Lights",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "The lighter cousin to Manchester Red. A softer body without giving up the Manchester profile.",
    priceUSD: 15,
    imageUrl: "/images/products/manchester-lights.svg",
    stock: 80,
  },
  {
    id: "cig-manchester-green-crush",
    slug: "manchester-green-crush",
    name: "Green Crush",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "Crushable menthol capsule in the filter. Snap at the lip to release a cool draw.",
    priceUSD: 18,
    imageUrl: "/images/products/manchester-green-crush.svg",
    stock: 60,
    newArrival: true,
  },
  {
    id: "cig-oscar",
    slug: "oscar",
    name: "Filter",
    brand: "Oscar",
    category: "cigarettes",
    description:
      "A working-day pack. Honest tobacco, steady burn, no fuss.",
    priceUSD: 13,
    imageUrl: "/images/products/oscar.svg",
    stock: 95,
  },
  {
    id: "cig-manchester-special-edition",
    slug: "manchester-special-edition",
    name: "Special Edition",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "A limited-run Manchester pack. Selected leaf, premium paper, gold foil sleeve.",
    priceUSD: 20,
    imageUrl: "/images/products/manchester-special-edition.svg",
    stock: 30,
    bestSeller: true,
  },
  {
    id: "cig-manchester-reserve",
    slug: "manchester-reserve",
    name: "Reserve",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "Manchester's counter reserve — a measured blend that reads cleaner than the red.",
    priceUSD: 15,
    imageUrl: "/images/products/manchester-reserve.svg",
    stock: 70,
  },
  {
    id: "cig-gold-pin",
    slug: "gold-pin",
    name: "Filter",
    brand: "Gold Pin",
    category: "cigarettes",
    description:
      "A slim-format filter pack. The mid-shift smoke for regulars who want something pared down.",
    priceUSD: 15,
    imageUrl: "/images/products/gold-pin.svg",
    stock: 65,
  },
  {
    id: "cig-esse-lights",
    slug: "esse-lights",
    name: "Lights",
    brand: "Esse",
    category: "cigarettes",
    description:
      "Korean super-slim. Light body, quick draw — the pack our city customers reach for.",
    priceUSD: 13,
    imageUrl: "/images/products/esse-lights.svg",
    stock: 85,
  },
  {
    id: "cig-esse-menthol",
    slug: "esse-menthol",
    name: "Menthol",
    brand: "Esse",
    category: "cigarettes",
    description:
      "Super-slim menthol. A quiet, cool draw with a clean finish.",
    priceUSD: 15,
    imageUrl: "/images/products/esse-menthol.svg",
    stock: 75,
  },
  {
    id: "cig-manchester-double-drive",
    slug: "manchester-double-drive",
    name: "Double Drive",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "Double-filter format. A fuller draw with the bite taken off by the secondary chamber.",
    priceUSD: 18,
    imageUrl: "/images/products/manchester-double-drive.svg",
    stock: 55,
  },
  {
    id: "cig-manchester-original-b",
    slug: "manchester-original-b",
    name: "Original B",
    brand: "Manchester",
    category: "cigarettes",
    description:
      "The original Manchester recipe in a blue pack. The long-standing counter pick.",
    priceUSD: 13,
    imageUrl: "/images/products/manchester-original-b.svg",
    stock: 100,
  },
  {
    id: "cig-winfield-original-classic",
    slug: "winfield-original-classic",
    name: "Original Classic",
    brand: "Winfield",
    category: "cigarettes",
    description:
      "Australia's own Winfield in the original classic pack. A steady full-flavour that needs no introduction.",
    priceUSD: 13,
    imageUrl: "/images/products/winfield-original-classic.svg",
    stock: 110,
    bestSeller: true,
  },
  {
    id: "cig-jps",
    slug: "jps",
    name: "Filter",
    brand: "JPS",
    category: "cigarettes",
    description:
      "John Player Special. A dark-paper pack for the customer who wants the classic British format.",
    priceUSD: 13,
    imageUrl: "/images/products/jps.svg",
    stock: 90,
  },

  /* ─────────────────────────── VAPES (7 device families) ─────────────────────────── */
  {
    id: "vape-z-lodar",
    slug: "z-lodar",
    name: "Z Lodar",
    brand: "Z Lodar",
    category: "vapes",
    description:
      "A compact disposable with a tight draw. Five fruit-forward flavours in stock.",
    longDescription:
      "Z Lodar is the counter's most-requested pocket disposable — pre-charged, pre-filled, and tuned for a tighter mouth-to-lung draw. Choose your flavour below. Each unit is a single-use device; pair with a second if you smoke regularly.",
    priceUSD: 48,
    imageUrl: "/images/products/z-lodar.svg",
    stock: 40,
    flavours: [
      "Chuppa Chup Strawberry",
      "Blueberry Raspberry Ice",
      "Black Pomegranate Cherry",
      "Blackberry Ice",
      "Skittles",
    ],
  },
  {
    id: "vape-i-get-one",
    slug: "i-get-one",
    name: "One",
    brand: "IGET",
    category: "vapes",
    description:
      "The IGET One. Larger capacity, longer service life, and twelve flavours on the shelf.",
    longDescription:
      "IGET One is a pre-charged disposable with a deeper reservoir than the pocket format. Pick a flavour below. Runs cooler on a longer draw and holds up through a full evening of use.",
    priceUSD: 70,
    imageUrl: "/images/products/i-get-one.svg",
    stock: 35,
    bestSeller: true,
    flavours: [
      "Black Forest",
      "Chuppa Chup Cherry",
      "Blue Monster",
      "Blueberry Raspberry",
      "Strawberry Raspberry",
      "Raspberry Grape Ice",
      "Strawberry",
      "Mixed Berry Ice",
      "Strawberry Pomegranate Ice",
      "Cherry Pomegranate",
      "Tropical Orange Monster",
      "Cherry Monster",
    ],
  },
  {
    id: "vape-i-get-bar-pro",
    slug: "i-get-bar-pro",
    name: "Bar Pro",
    brand: "IGET",
    category: "vapes",
    description:
      "IGET Bar Pro. Slim bar format, eleven flavours, mid-shelf pricing.",
    priceUSD: 55,
    imageUrl: "/images/products/i-get-bar-pro.svg",
    stock: 45,
    flavours: [
      "Grape Ice",
      "Strawberry Watermelon Ice",
      "Cherry Pomegranate",
      "Kiwi Pineapple",
      "Blackberry Ice",
      "Strawberry Kiwi",
      "Black Pomegranate Cherry",
      "Blackberry Yogurt Ice Berry",
      "Passion Fruit Peach Iced Tea",
      "Strawberry Passion Fruit Mango",
      "Raspberry Grape",
    ],
  },
  {
    id: "vape-ali-bar",
    slug: "ali-bar",
    name: "Bar",
    brand: "Ali",
    category: "vapes",
    description:
      "Ali Bar. Eleven flavours spanning citrus, berry, and mint formats.",
    priceUSD: 63,
    imageUrl: "/images/products/ali-bar.svg",
    stock: 38,
    flavours: [
      "Pink Lemon",
      "Yellow Starburst",
      "Cool Mint",
      "Quadruple Berry",
      "Ribena",
      "Peach Ice",
      "Blueberry Mint",
      "Hubba Bubba Grape",
      "Cherry Pomegranate",
      "Strawberry Kiwi",
      "Grapefruit Guava Lemon",
    ],
  },
  {
    id: "vape-ali-12k",
    slug: "ali-12k",
    name: "12K",
    brand: "Ali",
    category: "vapes",
    description:
      "Ali 12K. Higher-capacity tank, two flavour formats in stock.",
    priceUSD: 58,
    imageUrl: "/images/products/ali-12k.svg",
    stock: 28,
    flavours: ["Pineapple Coconut", "Watermelon"],
  },
  {
    id: "vape-bullubul",
    slug: "bullubul",
    name: "Vape",
    brand: "Bullubul",
    category: "vapes",
    description:
      "Bullubul's berry-leaning disposable. Five flavours with a cooler finish.",
    priceUSD: 45,
    imageUrl: "/images/products/bullubul.svg",
    stock: 42,
    flavours: [
      "Midnight Dual Berry",
      "Blackberry Fabulous",
      "Midnight Blackberry",
      "Quad Berry",
      "Watermelon",
    ],
  },
  {
    id: "vape-slick",
    slug: "slick",
    name: "Slick",
    brand: "HQD Cuvie",
    category: "vapes",
    description:
      "HQD Cuvie Slick. Broad flavour range — pick one below and we'll match from what's on the shelf tonight.",
    longDescription:
      "HQD Cuvie Slick is our deepest-range disposable. Pick a flavour below; the driver will substitute the closest available if the exact flavour has moved off the shelf between your order and dispatch.",
    priceUSD: 40,
    imageUrl: "/images/products/slick.svg",
    stock: 60,
    newArrival: true,
    flavours: [
      "Banana Ice",
      "Banana Pomegranate Cherry",
      "Black Dragon",
      "Black Ice",
      "Blackberry Cherry Pomegranate",
      "Blackberry Raspberry Lemon",
      "Blueberry Lemonade",
      "Blueberry Raspberry",
      "Cherry Pomegranate",
      "Cola",
      "Cola Ice",
      "Grapey (Grape Candy)",
      "Guava Ice",
      "Ice Mint",
      "Kiwi Lemon",
      "Kiwi Pineapple",
      "Lemon Mint",
      "Lemon Passionfruit",
      "Lush Ice (Watermelon Ice)",
      "Mango Honeydew Ice",
      "Peach Berry",
      "Raspberry Grape",
      "Sour Gummy Worms",
      "Strawberry Kiwi",
      "Strawberry Mango",
      "Strawberry Watermelon",
      "Tobacco",
      "Watermelon Bubblegum",
      "Mixed Berries",
      "Mango Magic",
      "Passionfruit Mango Lemon",
      "Watermelon Ice",
    ],
  },

  /* ─────────────────────────── NICOTINE POUCHES (Zyn / Velo) ─────────────────────────── */
  {
    id: "nic-zyn",
    slug: "zyn",
    name: "Nicotine Pouches",
    brand: "Zyn",
    category: "nicotine-pouches",
    description:
      "Zyn tobacco-free nicotine pouches. Discreet, smokeless, tucked between lip and gum.",
    longDescription:
      "Zyn is a tobacco-free nicotine pouch — no smoke, no spit, no stain. Each tin holds 15 pouches at a consistent strength. Pick your flavour below.",
    priceUSD: 25,
    imageUrl: "/images/products/zyn.svg",
    stock: 55,
    bestSeller: true,
    flavours: [
      "Fresh Mint",
      "Cool Frost",
      "Cool Mint",
      "Cool Watermelon",
      "Spearmint",
      "Citrus",
      "Espresso",
      "Wintergreen",
      "Smooth Mint",
    ],
  },
  {
    id: "nic-velo",
    slug: "velo",
    name: "Nicotine Pouches",
    brand: "Velo",
    category: "nicotine-pouches",
    description:
      "Velo tobacco-free nicotine pouches. Clean-mint and fruit profiles, tucked neatly in the tin.",
    priceUSD: 25,
    imageUrl: "/images/products/velo.svg",
    stock: 50,
    flavours: [
      "X Freeze",
      "Polar Mint",
      "Berry Frost",
      "Ice Cool",
      "Tropical Mint",
      "Cinnamon",
      "Ruby Berry",
    ],
  },

  /* ─────────────────────────── TOBACCO POUCHES (Manchester) ─────────────────────────── */
  {
    id: "pouch-manchester-tobacco",
    slug: "manchester-tobacco-pouch",
    name: "Tobacco Pouch",
    brand: "Manchester",
    category: "tobacco-pouches",
    description:
      "Manchester loose-leaf tobacco. Ribbon-cut for rolling or pipe-packing. Sold in a 100-gram pouch or a full kilo bag.",
    longDescription:
      "Manchester's signature loose-leaf — ribbon-cut, long enough for a clean roll and short enough to pack a pipe. Re-sealable pouch. Choose between a 100-gram counter pouch or a full one-kilogram bag.",
    priceUSD: 28,
    imageUrl: "/images/products/manchester-tobacco-pouch.svg",
    stock: 30,
    variants: [
      { size: "100g", priceUSD: 28, stock: 30 },
      { size: "1kg", priceUSD: 105, stock: 10 },
    ],
    tastingNotes: ["Ribbon-cut", "Long leaf", "Warm body"],
    origin: "Manchester blend",
    bestSeller: true,
  },
];

export const CATEGORIES = [
  {
    slug: "cigarettes",
    title: "Cigarettes",
    blurb:
      "Seventeen packs on the shelf — Marlboro, Manchester, Winfield, Esse, and the regulars' picks. Buy ten packs, save five dollars; stackable.",
  },
  {
    slug: "vapes",
    title: "Vapes",
    blurb:
      "Disposable devices across seven families — IGET, Ali, Z Lodar, Bullubul, HQD Cuvie Slick. Choose your flavour at the counter.",
  },
  {
    slug: "nicotine-pouches",
    title: "Nicotine Pouches",
    blurb:
      "Tobacco-free nicotine pouches from Zyn and Velo. Smokeless, discreet, tucked between lip and gum.",
  },
  {
    slug: "tobacco-pouches",
    title: "Tobacco Pouches",
    blurb:
      "Manchester loose-leaf, ribbon-cut. Sold in 100-gram pouches and full kilo bags.",
  },
] as const;

export function getProductsByCategory(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.category === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 3): Product[] {
  const target = getProductBySlug(slug);
  if (!target) return [];
  return PRODUCTS.filter((p) => p.slug !== slug && p.category === target.category).slice(0, limit);
}

/**
 * Minimum quantity per cart line, by category.
 * Founder rule: every line ships solo OK — but the cigarette CART TOTAL
 * across all lines must reach MIN_CIGARETTE_PACKS_TOTAL before the order
 * can be placed (any combination of brands counts toward the threshold).
 * Vapes, nicotine pouches, and tobacco pouches have no cart-level minimum.
 */
export function minQtyFor(_category: Category): number {
  return 1;
}

/** Convenience wrapper for product-aware code paths. */
export function minQtyForProduct(product: Pick<Product, "category">): number {
  return minQtyFor(product.category);
}

/**
 * Cart-level cigarette minimum: any combination of cigarette brands totalling
 * fewer than this number cannot check out. Encodes the founder's rule: at
 * least 2 packs of cigarettes per delivery (mix-and-match across brands OK).
 */
export const MIN_CIGARETTE_PACKS_TOTAL = 2;

/** Human-readable rule blurb for product detail / card. */
export function minQtyLabel(category: Category): string | null {
  return category === "cigarettes"
    ? `At least ${MIN_CIGARETTE_PACKS_TOTAL} cigarette packs per order — any mix of brands.`
    : null;
}

/* ─────────────────────────── BULK DISCOUNT (cigarettes) ─────────────────────────── */

/**
 * $5 off for every 10 cigarette packs. Stackable — 20 packs = $10, 30 = $15.
 * Computed in the cart store; exported here so admin tooling, the
 * marketing banner, and order audit all read from the same constants.
 */
export const BULK_DISCOUNT_PACKS = 10;
export const BULK_DISCOUNT_USD = 5;

/**
 * Compute the bulk discount in USD for a given cigarette-pack count.
 * Floors to the nearest multiple of BULK_DISCOUNT_PACKS.
 */
export function bulkDiscountForPacks(packs: number): number {
  if (packs <= 0) return 0;
  return Math.floor(packs / BULK_DISCOUNT_PACKS) * BULK_DISCOUNT_USD;
}
