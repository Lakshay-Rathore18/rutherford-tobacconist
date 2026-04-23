/**
 * Server-side JSON-LD renderer.
 *
 * Emits a `<script type="application/ld+json">` tag inline in the page.
 *   · Server component — no hydration cost, no client bundle weight
 *   · Invisible to screen readers (browsers don't render ldjson scripts)
 *   · Cast safe because we control every `data` shape via schemas.ts builders
 *
 * Usage:
 *   <JsonLd data={organizationSchema()} />
 *   <JsonLd data={[websiteSchema(), organizationSchema()]} />   // array ok
 */
export function JsonLd({
  data,
  id,
}: {
  data: object | ReadonlyArray<object>;
  id?: string;
}) {
  return (
    <script
      type="application/ld+json"
      id={id}
      // SAFETY: `data` is always authored by schemas.ts (no user input),
      // and JSON.stringify handles the escaping of string values.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
