import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getMascotPath } from "../../shared/mascots";
export function Leaderboard({ leaderboard, highlightTeamId, maxItems, variant = "team", className = "", itemClassName = "", }) {
    const displayLeaderboard = maxItems
        ? leaderboard.slice(0, maxItems)
        : leaderboard;
    if (variant === "presenter") {
        return (_jsx("ul", { className: `space-y-4 text-2xl font-semibold ${className}`, children: displayLeaderboard.map((team) => {
                const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
                return (_jsxs("li", { className: `flex items-center gap-4 ${itemClassName || ""}`, children: [_jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-900 ring-2 ring-slate-300", children: team.rank }), mascotPath ? (_jsx("div", { className: "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 p-2 ring-2 ring-slate-200", children: _jsx("img", { src: mascotPath, alt: "", className: "h-full w-full object-contain", "aria-hidden": "true", onError: (e) => {
                                    console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                                    e.currentTarget.style.display = "none";
                                } }) })) : (_jsx("div", { className: "flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-slate-50 ring-2 ring-slate-200", children: _jsx("span", { className: "text-2xl font-bold text-slate-400", children: team.teamName.charAt(0).toUpperCase() }) })), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "truncate text-slate-900", children: team.teamName }) }), _jsxs("div", { className: "flex-shrink-0 text-right", children: [_jsx("p", { className: "text-slate-900", children: team.score }), _jsx("p", { className: "text-sm text-slate-600", children: "pts" })] })] }, team.id));
            }) }));
    }
    if (variant === "host") {
        return (_jsx("ol", { className: `space-y-2.5 ${className}`, children: displayLeaderboard.map((team) => {
                const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
                return (_jsxs("li", { className: `flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-2.5 ${itemClassName}`, children: [_jsx("div", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-bold text-slate-700", children: team.rank }), mascotPath ? (_jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-2 ring-white/50", children: _jsx("img", { src: mascotPath, alt: "", className: "h-full w-full object-contain", "aria-hidden": "true", onError: (e) => {
                                    console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                                    e.currentTarget.style.display = "none";
                                } }) })) : (_jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-200", children: _jsx("span", { className: "text-lg font-bold text-slate-400", children: team.teamName.charAt(0).toUpperCase() }) })), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: "truncate font-semibold text-slate-900", children: team.teamName }) }), _jsxs("div", { className: "flex-shrink-0 text-right", children: [_jsx("p", { className: "text-sm font-bold text-slate-700", children: team.score }), _jsx("p", { className: "text-xs text-slate-500", children: "pts" })] })] }, team.id));
            }) }));
    }
    // Team variant (default) - Redesigned with mascot as prominent avatar
    return (_jsx("ul", { className: `space-y-2.5 ${className}`, children: displayLeaderboard.map((team) => {
            const mascotPath = team.mascotId ? getMascotPath(team.mascotId) : null;
            const isHighlighted = team.id === highlightTeamId;
            return (_jsxs("li", { "data-team-id": team.id, className: `flex items-center gap-3 rounded-2xl px-3 py-2.5 shadow-md transition ${isHighlighted
                    ? "bg-brand-light ring-2 ring-brand-primary"
                    : "bg-slate-100"} ${itemClassName}`, children: [_jsx("div", { className: `flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${isHighlighted
                            ? "bg-brand-primary text-white"
                            : "bg-slate-300 text-slate-700"}`, children: team.rank }), mascotPath ? (_jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-2 ring-white/50", children: _jsx("img", { src: mascotPath, alt: "", className: "h-full w-full object-contain", "aria-hidden": "true", onError: (e) => {
                                console.error("Failed to load mascot:", mascotPath, "for team:", team.teamName);
                                e.currentTarget.style.display = "none";
                            } }) })) : (_jsx("div", { className: "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-200", children: _jsx("span", { className: "text-lg font-bold text-slate-400", children: team.teamName.charAt(0).toUpperCase() }) })), _jsx("div", { className: "flex-1 min-w-0", children: _jsx("p", { className: `truncate font-semibold ${isHighlighted ? "text-brand-primary" : "text-slate-900"}`, children: team.teamName }) }), _jsxs("div", { className: "flex-shrink-0 text-right", children: [_jsx("p", { className: `text-sm font-bold ${isHighlighted ? "text-brand-primary" : "text-slate-700"}`, children: team.score }), _jsx("p", { className: "text-xs text-slate-500", children: "pts" })] })] }, team.id));
        }) }));
}
//# sourceMappingURL=Leaderboard.js.map