import { cn } from "@/lib/utils";
import { person } from "@/lib/selectors";
import type { StudioState } from "@/lib/types";

export function PersonChip({
  state,
  id,
  className,
}: {
  state: StudioState;
  id?: string;
  className?: string;
}) {
  const p = person(state, id);
  if (!p) return <span className="text-muted-foreground">Unassigned</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
        style={{ background: p.color }}
      >
        {p.initials}
      </span>
      <span>{p.name}</span>
    </span>
  );
}

export function PersonDot({
  state,
  id,
}: {
  state: StudioState;
  id?: string;
}) {
  const p = person(state, id);
  if (!p) return null;
  return (
    <span
      title={p.name}
      className="flex size-6 items-center justify-center rounded-full text-[10px] font-medium text-white ring-2 ring-background"
      style={{ background: p.color }}
    >
      {p.initials}
    </span>
  );
}
