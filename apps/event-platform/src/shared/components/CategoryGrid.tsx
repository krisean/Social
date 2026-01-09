import type { PromptLibrary } from "../promptLibraries";
import type { CategoryGrid as CategoryGridType } from "../utils/categoryGrid";
import { useTheme } from "../providers/ThemeProvider";
import { isCategoryAvailable } from "../utils/categoryGrid";

interface CategoryGridProps {
  libraries: PromptLibrary[];
  categoryGrid: CategoryGridType;
  selectedCategory?: string;
  onSelect?: (categoryId: string) => void;
  disabled?: boolean;
  canSelect?: boolean;
  highlightUsed?: boolean;
}

export function CategoryGrid({
  libraries,
  categoryGrid,
  selectedCategory,
  onSelect,
  disabled = false,
  canSelect = false,
  highlightUsed = true,
}: CategoryGridProps) {
  const { isDark } = useTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {libraries.map((library) => {
        const isUsed = categoryGrid.used.includes(library.id);
        const isSelected = selectedCategory === library.id;
        const isAvailable = isCategoryAvailable(categoryGrid, library.id);
        const isClickable = canSelect && isAvailable && !disabled;

        return (
          <button
            key={library.id}
            onClick={() => isClickable && onSelect?.(library.id)}
            disabled={!isClickable}
            className={`
              relative rounded-xl p-4 text-center transition-all
              ${isUsed && highlightUsed ? 'opacity-30 cursor-not-allowed' : ''}
              ${isSelected ? 'ring-4 ring-brand-primary scale-105 shadow-lg' : ''}
              ${isClickable ? 'hover:scale-105 hover:shadow-md cursor-pointer' : ''}
              ${!isDark ? 'bg-white shadow-md' : 'bg-slate-800 shadow-lg'}
              ${!isClickable && !isUsed ? 'cursor-not-allowed' : ''}
            `}
          >
            <div className="text-3xl mb-2">{library.emoji}</div>
            <div className={`text-sm font-semibold ${!isDark ? 'text-slate-900' : 'text-cyan-100'}`}>
              {library.name}
            </div>
            {isUsed && highlightUsed && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                <span className="text-4xl opacity-50">✓</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
