"use client";

import { Component, type ReactNode } from "react";

/**
 * SectionBoundary — isolates a single page section so a runtime crash
 * (WebGL context loss, third-party script error, hydration mismatch in
 * an ambient effect) takes out only that section instead of bubbling
 * up to the route-level error.tsx and blanking the whole page.
 *
 * Renders nothing on failure (these sections are decorative or
 * recoverable by reloading). Logs once to the console so the issue
 * stays visible in dev + production observability.
 */
export class SectionBoundary extends Component<
  { children: ReactNode; name?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (typeof console !== "undefined") {
      console.error(
        `[section-boundary${this.props.name ? `:${this.props.name}` : ""}]`,
        error,
      );
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
