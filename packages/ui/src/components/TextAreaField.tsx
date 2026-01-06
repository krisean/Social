import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  error?: string;
  characterCount?: { value: number; max: number };
};

export const TextAreaField = forwardRef<
  HTMLTextAreaElement,
  TextAreaFieldProps
>(({ label, hint, error, characterCount, className, id, ...props }, ref) => {
  const textAreaId = id ?? props.name;
  return (
    <label
      className="flex w-full flex-col gap-2 text-left"
      htmlFor={textAreaId}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        {characterCount ? (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {characterCount.value}/{characterCount.max}
          </span>
        ) : null}
      </div>
      <textarea
        ref={ref}
        id={textAreaId}
        className={clsx(
          "min-h-[160px] w-full rounded-2xl border px-4 py-3 text-base leading-relaxed shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2",
          // Light mode
          "border-slate-200 bg-white focus:border-brand-primary focus:ring-brand-light",
          // Dark mode
          "dark:border-slate-600 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20",
          error && "border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-400/20",
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
      {error ? <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span> : null}
    </label>
  );
});

TextAreaField.displayName = "TextAreaField";

export default TextAreaField;
