import type { Metadata } from "next";
import { CartClient } from "./cart-client";

export const metadata: Metadata = {
  title: "Your selection",
  description: "Review your selection before proceeding to checkout.",
};

export default function CartPage() {
  return <CartClient />;
}
