import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

interface CardProps {
  className?: string;
  interactive?: boolean;
  selected?: boolean;
  isDark?: boolean; // Add isDark prop to match Host Console pattern
}

export function Card({
  className,
  interactive,
  selected,
  isDark = false, // Default to false, but can be passed in
  children,
}: PropsWithChildren<CardProps>) {
  return (
    <div
      className={clsx(
        // Exact copy of Host Console classes (without layout classes)
        "rounded-3xl p-6 shadow-lg",
        !isDark ? 'bg-white shadow-slate-300/40' : 'bg-slate-800 shadow-fuchsia-500/20',
        interactive &&
          "cursor-pointer hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        selected && "border border-brand-primary",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
