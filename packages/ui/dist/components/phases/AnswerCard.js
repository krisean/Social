import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
export function AnswerCard({ answer, voteCount, isWinner = false, authorName, isSelected = false, onClick, disabled = false, showSummary = false, variant = "team", className = "", }) {
    const points = voteCount * 100 + (isWinner ? 1000 : 0);
    if (variant === "presenter") {
        return (_jsxs("div", { className: `relative rounded-2xl bg-white px-4 py-4 text-left text-xl font-semibold shadow-md ${className}`, children: [showSummary ? (_jsxs("span", { className: "absolute -top-3 right-4 rounded-full bg-amber-500 px-4 py-1 text-xs font-semibold text-white shadow", children: ["+", points] })) : null, _jsx("p", { className: "text-slate-900", children: answer.text }), showSummary ? (_jsxs(_Fragment, { children: [authorName && (_jsxs("p", { className: "mt-2 text-sm text-slate-600", children: ["\u2014 ", authorName] })), _jsxs("p", { className: "text-xs text-slate-500", children: [voteCount, " vote", voteCount === 1 ? "" : "s"] })] })) : null] }));
    }
    if (variant === "host") {
        return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, className: `rounded-3xl border-2 bg-white p-5 text-left shadow-sm transition hover:border-brand-primary ${isSelected
                ? "border-brand-primary shadow-md"
                : "border-transparent"} ${className}`, children: [_jsx("p", { className: "text-lg font-semibold text-slate-900", children: answer.text }), _jsxs("p", { className: "mt-2 text-sm text-slate-500", children: [voteCount, " vote", voteCount === 1 ? "" : "s"] })] }));
    }
    // Team variant (default)
    return (_jsxs("button", { type: "button", onClick: onClick, disabled: disabled, className: `bg-white w-full rounded-2xl px-4 py-3 text-left transition shadow-md ${isSelected
            ? "ring-2 ring-brand-primary"
            : "ring-1 ring-white/40"} ${disabled ? "opacity-70" : "hover:ring-brand-primary/60"} ${className}`, children: [_jsx("p", { className: "break-words overflow-wrap-anywhere text-lg font-semibold text-slate-900", children: answer.text }), showSummary ? (_jsxs(_Fragment, { children: [authorName && (_jsxs("p", { className: "mt-1 text-xs text-slate-500", children: ["\u2014 ", authorName] })), _jsxs("p", { className: "mt-2 text-sm font-semibold text-brand-primary", children: ["+", points] }), _jsxs("p", { className: "text-xs text-slate-500", children: [voteCount, " vote", voteCount === 1 ? "" : "s"] })] })) : null] }));
}
//# sourceMappingURL=AnswerCard.js.map