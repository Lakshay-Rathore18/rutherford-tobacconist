"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartTrigger } from "@/components/cart/cart-trigger";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/cigarettes", label: "Cigarettes" },
  { href: "/vapes", label: "Vapes" },
  { href: "/nicotine-pouches", label: "Nicotine Pouches" },
  { href: "/tobacco-pouches", label: "Tobacco Pouches" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-[var(--color-oak-deep)]/95 backdrop-blur-sm border-b border-[var(--color-brass)]/15 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between h-20 md:h-24">
          <Link
            href="/"
            aria-label={`${BRAND.name} home`}
            className="group inline-flex flex-col items-start text-[var(--color-parchment)] focus:outline-none"
          >
            <span className="font-[family-name:var(--font-cinzel)] text-xl md:text-2xl tracking-[0.18em] leading-none transition-colors group-hover:text-[var(--color-brass-highlight)]">
              RUTHERFORD
            </span>
            <span className="font-[family-name:var(--font-cormorant)] italic text-[0.75rem] md:text-xs text-[var(--color-parchment-deep)] tracking-[0.14em] mt-1">
              Tobacconist
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "brass-underline font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.2em] text-[0.72rem] transition-colors",
                        active
                          ? "text-[var(--color-brass-highlight)]"
                          : "text-[var(--color-parchment)] hover:text-[var(--color-brass-highlight)]",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <CartTrigger />
            <MobileMenu pathname={pathname ?? ""} />
          </div>
        </div>
      </div>
      <div className="brass-divider opacity-60" />
    </header>
  );
}

function MobileMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open menu"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 text-[var(--color-parchment)] hover:text-[var(--color-brass-highlight)] transition-colors"
          />
        }
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M3.5 7h17" />
          <path d="M3.5 12h17" />
          <path d="M3.5 17h17" />
        </svg>
      </SheetTrigger>
      <SheetContent
        side="right"
        aria-labelledby="mobile-nav-title"
        className="w-full sm:max-w-sm bg-[var(--color-oak-deep)] border-l border-[var(--color-brass)]/30 text-[var(--color-parchment)] p-0 flex flex-col"
      >
        <div className="px-6 pt-8 pb-4 border-b border-[var(--color-brass)]/15">
          <p className="font-[family-name:var(--font-libre-caslon)] uppercase tracking-[0.32em] text-[0.65rem] text-[var(--color-parchment-dim)]">
            Menu
          </p>
          <SheetTitle
            id="mobile-nav-title"
            className="mt-1 font-[family-name:var(--font-cinzel)] text-xl tracking-[0.18em] text-[var(--color-parchment)]"
          >
            RUTHERFORD
          </SheetTitle>
        </div>
        <nav aria-label="Mobile primary" className="flex-1 px-6 py-6 overflow-y-auto">
          <ul className="space-y-4">
            {NAV.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block font-[family-name:var(--font-cinzel)] tracking-[0.06em] text-2xl py-3 border-b border-[var(--color-brass)]/15",
                      active
                        ? "text-[var(--color-brass-highlight)]"
                        : "text-[var(--color-parchment)]",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
