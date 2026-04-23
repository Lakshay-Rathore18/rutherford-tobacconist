import { cn } from "@/lib/utils";
import { createElement, type ElementType, type ReactNode } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "display";

const sizes: Record<Size, string> = {
  xs: "text-base",
  sm: "text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
  xl: "text-3xl md:text-4xl",
  "2xl": "text-4xl md:text-5xl lg:text-6xl",
  "3xl": "text-5xl md:text-6xl lg:text-7xl",
  display: "text-6xl md:text-7xl lg:text-8xl xl:text-9xl",
};

type Props = {
  as?: ElementType;
  size?: Size;
  italic?: boolean;
  className?: string;
  children: ReactNode;
};

export function SerifHeading({
  as = "h2",
  size = "lg",
  italic = false,
  className,
  children,
}: Props) {
  return createElement(
    as,
    {
      className: cn(
        "font-[family-name:var(--font-fraunces)] tracking-[-0.02em] text-[var(--color-text-primary)]",
        sizes[size],
        italic && "italic",
        className,
      ),
    },
    children,
  );
}

export function BodySerif({
  className,
  children,
  italic = false,
  as = "p",
}: {
  className?: string;
  children: ReactNode;
  italic?: boolean;
  as?: ElementType;
}) {
  return createElement(
    as,
    {
      className: cn(
        "font-[family-name:var(--font-cormorant)] text-[1.0625rem] leading-[1.7] text-[var(--color-text-muted)]",
        italic && "italic",
        className,
      ),
    },
    children,
  );
}

export function UISerif({
  className,
  children,
  as = "span",
  smallCaps = false,
}: {
  className?: string;
  children: ReactNode;
  as?: ElementType;
  smallCaps?: boolean;
}) {
  return createElement(
    as,
    {
      className: cn(
        "font-[family-name:var(--font-inter)] text-[var(--color-text-primary)]",
        smallCaps && "uppercase tracking-[0.18em] text-[0.78rem]",
        className,
      ),
    },
    children,
  );
}
