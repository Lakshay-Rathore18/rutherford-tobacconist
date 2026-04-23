"use client";

import { useEffect, useRef } from "react";

/**
 * Global error boundary — fires when the root layout itself throws. Because it
 * replaces <html>/<body>, it cannot rely on anything in app/layout.tsx. Inline
 * styles only: no fonts, no providers, no imports that can cascade-fail.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const h1Ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    console.error("[global-error]", error.digest ?? error.message);
    h1Ref.current?.focus();
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          background: "#0E0B09",
          color: "#E9DDC6",
          fontFamily: "Georgia, 'Times New Roman', serif",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          id="main"
          tabIndex={-1}
          aria-labelledby="ge-title"
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            padding: "4rem 1.5rem",
            textAlign: "center",
            outline: "none",
          }}
        >
          <section
            aria-labelledby="ge-title"
            style={{ maxWidth: "65ch" }}
          >
            <p
              style={{
                color: "#C8893F",
                textTransform: "uppercase",
                letterSpacing: "0.32em",
                fontSize: "0.875rem",
                margin: 0,
              }}
            >
              The site hit a snag
            </p>
            <h1
              id="ge-title"
              ref={h1Ref}
              tabIndex={-1}
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                marginTop: "1rem",
                marginBottom: 0,
                color: "#E9DDC6",
                outline: "none",
              }}
            >
              Something broke on our end
            </h1>
            <p
              style={{
                marginTop: "1.5rem",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                color: "#A8998A",
              }}
            >
              Apologies — the page couldn&apos;t load. The counter is still
              open. Try again or telephone us direct.
            </p>

            <div
              role="group"
              aria-label="Recovery options"
              style={{
                marginTop: "2.5rem",
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => reset()}
                style={{
                  minHeight: "44px",
                  padding: "0.75rem 1.5rem",
                  background: "#C8893F",
                  color: "#0E0B09",
                  border: "none",
                  borderRadius: "2px",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  minHeight: "44px",
                  padding: "0.75rem 1.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid rgba(200, 137, 63, 0.4)",
                  color: "#E9DDC6",
                  textDecoration: "none",
                  borderRadius: "2px",
                }}
              >
                Back to the counter
              </a>
              <a
                href="tel:+61485040007"
                aria-label="Call Rutherford Tobacconist on + 6 1 4 8 5 0 4 0 0 0 7"
                style={{
                  minHeight: "44px",
                  padding: "0.75rem 1.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  border: "1px solid rgba(200, 137, 63, 0.4)",
                  color: "#E9DDC6",
                  textDecoration: "none",
                  borderRadius: "2px",
                }}
              >
                Call +61 485 040 007
              </a>
            </div>

            <details
              style={{
                marginTop: "2.5rem",
                color: "#A8998A",
                fontSize: "0.875rem",
              }}
            >
              <summary style={{ cursor: "pointer", minHeight: "44px", display: "inline-flex", alignItems: "center" }}>
                Reference code (for support)
              </summary>
              <code
                style={{
                  display: "block",
                  marginTop: "0.75rem",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.75rem",
                }}
              >
                {error.digest ?? "unavailable"}
              </code>
            </details>
          </section>
        </main>
      </body>
    </html>
  );
}
