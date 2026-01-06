import { useMemo, useState } from "react";
import { useTheme } from "../../../shared/providers/ThemeProvider";
import { promptLibraries } from "../../../shared/constants";
import type {
  PromptLibrary,
  PromptLibraryId,
} from "../../../shared/promptLibraries";

interface PromptLibrarySelectorProps {
  selectedId: PromptLibraryId;
  onSelect: (id: PromptLibraryId) => void;
  disabled?: boolean;
}

export function PromptLibrarySelector({
  selectedId,
  onSelect,
  disabled = false,
}: PromptLibrarySelectorProps) {
  const { isDark } = useTheme();
  const [query, setQuery] = useState("");

  const filteredLibraries = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return promptLibraries;
    return promptLibraries.filter((library) =>
      `${library.emoji} ${library.name} ${library.description}`
        .toLowerCase()
        .includes(value),
    );
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <p className={`text-sm font-semibold ${!isDark ? 'text-slate-800' : 'text-slate-200'}`}>Prompt library</p>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search libraries"
          className={`rounded-2xl border px-4 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${!isDark ? 'border-slate-200 bg-white focus:border-brand-primary focus:ring-brand-light' : 'border-slate-600 bg-slate-800 focus:border-cyan-400 focus:ring-cyan-400/20'}`}
          disabled={disabled}
        />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {filteredLibraries.map((library: PromptLibrary) => {
          const isSelected = selectedId === library.id;
          return (
            <button
              key={library.id}
              type="button"
              onClick={() => {
                if (!disabled) {
                  onSelect(library.id);
                }
              }}
              className={`flex w-64 min-w-[240px] snap-center flex-col gap-3 rounded-3xl border-2 px-4 py-5 text-left transition ${
                isSelected
                  ? `${!isDark ? 'border-brand-primary bg-white' : 'border-cyan-400 bg-slate-800'} shadow-2xl`
                  : `border-transparent ${!isDark ? 'bg-white/90' : 'bg-slate-700/90'} shadow-md hover:shadow-xl`
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
              aria-pressed={isSelected}
              disabled={disabled}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">
                  {library.emoji}
                </span>
                <span className="rounded-full ${!isDark ? 'bg-slate-900/5' : 'bg-slate-600/20'} px-3 py-1 text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-600' : 'text-slate-300'}">
                  {library.name}
                </span>
              </div>
              <p className="text-sm ${!isDark ? 'text-slate-600' : 'text-slate-300'}">{library.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PromptLibrarySelector;
