import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
  isDark?: boolean;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, hint, error, isDark = false, className, id, ...props }, ref) => {
    const inputId = id ?? props.name ?? undefined;
    const hintId = hint && inputId ? `${inputId}-hint` : undefined;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    return (
      <label className="flex flex-col gap-1 text-left" htmlFor={inputId}>
        <span className={`text-sm font-medium ${!isDark ? 'text-slate-900' : 'text-slate-300'}`}>{label}</span>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "matte-input w-full rounded-2xl border border-white/40 bg-transparent px-4 py-3 text-base placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-brand-primary dark:focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-brand-light dark:focus:ring-cyan-400/20",
            error &&
              "border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400 focus:ring-rose-200 dark:focus:ring-rose-400/20",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {hint ? (
          <span id={hintId} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </span>
        ) : null}
        {error ? (
          <span
            id={errorId}
            data-testid={errorId ? `${errorId}` : undefined}
            className="text-xs text-rose-600 dark:text-rose-400"
          >
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
