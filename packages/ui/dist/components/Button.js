import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { clsx } from "clsx";
const baseStyles = "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const variantStyles = {
    primary: "bg-brand-primary text-white shadow-lg hover:bg-brand-dark focus-visible:outline-brand-primary",
    secondary: "border border-brand-primary text-brand-primary hover:bg-brand-light focus-visible:outline-brand-primary",
    ghost: "text-brand-primary hover:bg-slate-100 focus-visible:outline-brand-primary",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50 focus-visible:outline-slate-300",
    danger: "bg-rose-600 text-white shadow-lg hover:bg-rose-700 focus-visible:outline-rose-600",
};
const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-lg",
};
export const Button = forwardRef(({ variant = "primary", size = "md", isLoading, className, fullWidth, children, ...props }, ref) => (_jsx("button", { ref: ref, className: clsx(baseStyles, variantStyles[variant], sizeStyles[size], fullWidth && "w-full", className), disabled: isLoading || props.disabled, ...props, children: isLoading ? (_jsxs("span", { className: "relative flex items-center gap-2", children: [_jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" }), _jsx("span", { children: "Loading" })] })) : (children) })));
Button.displayName = "Button";
export default Button;
//# sourceMappingURL=Button.js.map