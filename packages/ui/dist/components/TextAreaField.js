import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
import { clsx } from "clsx";
export const TextAreaField = forwardRef(({ label, hint, error, characterCount, className, id, ...props }, ref) => {
    const textAreaId = id ?? props.name;
    return (_jsxs("label", { className: "flex w-full flex-col gap-2 text-left", htmlFor: textAreaId, children: [_jsxs("div", { className: "flex items-baseline justify-between", children: [_jsx("span", { className: "text-sm font-medium text-slate-700", children: label }), characterCount ? (_jsxs("span", { className: "text-xs text-slate-500", children: [characterCount.value, "/", characterCount.max] })) : null] }), _jsx("textarea", { ref: ref, id: textAreaId, className: clsx("min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-relaxed shadow-sm placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-light", error && "border-rose-500 focus:border-rose-500 focus:ring-rose-200", className), ...props }), hint ? _jsx("span", { className: "text-xs text-slate-500", children: hint }) : null, error ? _jsx("span", { className: "text-xs text-rose-600", children: error }) : null] }));
});
TextAreaField.displayName = "TextAreaField";
export default TextAreaField;
//# sourceMappingURL=TextAreaField.js.map