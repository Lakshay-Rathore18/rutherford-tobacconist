import { cn } from "@/lib/utils";

export function TastingNotes({
  notes,
  className,
}: {
  notes?: string[];
  className?: string;
}) {
  if (!notes || notes.length === 0) return null;
  return (
    <ul
      aria-label="Tasting notes"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {notes.map((note) => (
        <li
          key={note}
          className="font-[family-name:var(--font-cormorant)] italic text-[0.85rem] text-[var(--color-parchment-dim)] border border-[var(--color-brass)]/25 px-3 py-1 rounded-sm bg-[var(--color-oak-deep)]/50"
        >
          {note}
        </li>
      ))}
    </ul>
  );
}
