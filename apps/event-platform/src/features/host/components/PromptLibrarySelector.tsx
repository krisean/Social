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
          className={`px-4 py-2 text-sm placeholder:text-slate-400 border rounded-lg focus:outline-none focus:ring-2 ${!isDark ? 'bg-white border-slate-200 focus:border-brand-primary focus:ring-brand-light' : 'bg-slate-700 border-slate-600 text-white focus:border-cyan-400 focus:ring-cyan-400/20'}`}
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
              className={`prompt-card ${isSelected ? (isDark ? 'prompt-card-selected-dark' : 'prompt-card-selected-light') : (isDark ? 'prompt-card-dark' : 'prompt-card-light')} ${disabled ? 'prompt-card-disabled' : ''}`}
              aria-pressed={isSelected}
              disabled={disabled}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">
                  {library.emoji}
                </span>
                <span className={`prompt-library-name ${isDark ? 'prompt-library-name-dark' : 'prompt-library-name-light'}`}>
                  {library.name}
                </span>
              </div>
              <p className={`text-sm ${!isDark ? 'text-slate-700' : 'text-slate-300'}`}>{library.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PromptLibrarySelector;
