import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

interface CardProps {
  className?: string;
  interactive?: boolean;
  selected?: boolean;
}

export function Card({
  className,
  interactive,
  selected,
  children,
}: PropsWithChildren<CardProps>) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-slate-100 bg-white p-5 shadow-md shadow-slate-300/40 transition",
        interactive &&
          "cursor-pointer hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary",
        selected && "border-brand-primary shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Card;
