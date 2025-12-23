import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function GroupCard({ group, index, teamLookup, variant = "host", className = "", }) {
    const members = group.teamIds
        .map((id) => teamLookup.get(id) ?? "Unknown team")
        .join(", ");
    if (variant === "presenter") {
        return (_jsxs("div", { className: `rounded-3xl bg-white p-6 shadow-md ${className}`, children: [_jsxs("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-600", children: ["Group ", index + 1] }), _jsx("p", { className: "mt-2 text-xl font-semibold text-slate-900", children: group.prompt }), _jsx("p", { className: "mt-3 text-sm text-slate-600", children: members })] }));
    }
    // Host variant (default)
    return (_jsxs("div", { className: `rounded-3xl bg-white p-5 shadow-inner ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between gap-3", children: [_jsxs("span", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: ["Group ", index + 1] }), _jsxs("span", { className: "text-xs font-medium text-slate-400", children: [group.teamIds.length, " team", group.teamIds.length === 1 ? "" : "s"] })] }), _jsx("p", { className: "mt-2 text-sm font-semibold text-slate-900", children: group.prompt }), _jsx("p", { className: "mt-2 text-sm text-slate-600", children: members })] }));
}
//# sourceMappingURL=GroupCard.js.map