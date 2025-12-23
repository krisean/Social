import type { RoundGroup } from "../../shared/types";

type GroupCardVariant = "host" | "presenter";

interface GroupCardProps {
  group: RoundGroup;
  index: number;
  teamLookup: Map<string, string>;
  variant?: GroupCardVariant;
  className?: string;
}

export function GroupCard({
  group,
  index,
  teamLookup,
  variant = "host",
  className = "",
}: GroupCardProps) {
  const members = group.teamIds
    .map((id) => teamLookup.get(id) ?? "Unknown team")
    .join(", ");

  if (variant === "presenter") {
    return (
      <div
        className={`rounded-3xl bg-white p-6 shadow-md ${className}`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
          Group {index + 1}
        </p>
        <p className="mt-2 text-xl font-semibold text-slate-900">{group.prompt}</p>
        <p className="mt-3 text-sm text-slate-600">{members}</p>
      </div>
    );
  }

  // Host variant (default)
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-inner ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Group {index + 1}
        </span>
        <span className="text-xs font-medium text-slate-400">
          {group.teamIds.length} team{group.teamIds.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{group.prompt}</p>
      <p className="mt-2 text-sm text-slate-600">{members}</p>
    </div>
  );
}

