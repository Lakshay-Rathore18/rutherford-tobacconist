export type Category =
  | "cigarettes"
  | "vapes"
  | "tobacco-pouches"
  | "nicotine-pouches";

export type Variant = {
  size: string; // "100g" | "1kg"
  priceUSD: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  description: string;
  longDescription?: string;
  priceUSD: number;
  variants?: Variant[];
  flavours?: string[];
  priceOnAsk?: boolean;
  imageUrl: string;
  stock: number;
  tastingNotes?: string[];
  origin?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  variantSize?: string;
  flavour?: string;
  unitPriceUSD: number;
  qty: number;
  imageUrl: string;
};

export type CartState = {
  items: CartItem[];
  open: boolean;
};

export type DOB = { year: number; month: number; day: number };

export type DeliveryAddress = {
  firstName: string;
  lastName: string;
  street: string;
  unit?: string;
  city: string;
  postal: string;
  phone: string;
  notes?: string;
};

/** Convenience for SMS / display — first + last joined with a space. */
export function fullNameOf(d: Pick<DeliveryAddress, "firstName" | "lastName">): string {
  return `${d.firstName} ${d.lastName}`.trim();
}

export type SmsStatus = "sent" | "skipped" | "failed";

export type OrderAudit = {
  orderId: string;
  placedAt: string; // ISO
  confirmedAt: string; // ISO
  dobHash: string;
  items: Array<{
    productId: string;
    name: string;
    brand: string;
    variantSize?: string;
    qty: number;
    unitPriceUSD: number;
  }>;
  delivery: DeliveryAddress;
  paymentMethod: "COD";
  subtotalUSD: number;
  /** Bulk discount applied at checkout: $5 per 10 cigarette packs, stackable. */
  bulkDiscountUSD?: number;
  /** Pre-discount item total. Optional for backwards compat with v1 orders. */
  itemsTotalUSD?: number;
  /** "sent": Twilio dispatched · "skipped": SMS not configured (no env) ·
   *  "failed": Twilio responded with an error or invalid phone. */
  smsStatus?: SmsStatus;
};
