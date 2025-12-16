import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name ?? undefined;
    const hintId = hint && inputId ? `${inputId}-hint` : undefined;
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    return (
      <label className="flex flex-col gap-1 text-left" htmlFor={inputId}>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "matte-input w-full rounded-2xl border border-white/40 bg-transparent px-4 py-3 text-base placeholder:text-slate-500 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-light",
            error &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-200",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {hint ? (
          <span id={hintId} className="text-xs text-slate-500">
            {hint}
          </span>
        ) : null}
        {error ? (
          <span
            id={errorId}
            data-testid={errorId ? `${errorId}` : undefined}
            className="text-xs text-rose-600"
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
