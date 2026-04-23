import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  orientation?: "horizontal" | "vertical";
};

export function BrassDivider({ className, orientation = "horizontal" }: Props) {
  return (
    <hr
      aria-hidden="true"
      className={cn(
        orientation === "horizontal" ? "brass-divider" : "brass-divider-vertical",
        className,
      )}
    />
  );
}
