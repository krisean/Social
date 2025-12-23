import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export function RoundSummaryCard({ summary, voteCounts, variant = "host", className = "", }) {
    const maxGroupVotes = summary.answers.reduce((max, answer) => Math.max(max, voteCounts.get(answer.id) ?? 0), 0);
    if (variant === "presenter") {
        return (_jsxs("div", { className: `rounded-3xl bg-white p-6 shadow-md ${className}`, children: [_jsxs("div", { className: "flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-600", children: ["Group ", summary.index + 1] }), _jsx("p", { className: "mt-1 text-2xl font-bold leading-tight text-slate-900", children: summary.group.prompt })] }), _jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.3em] text-slate-600", children: summary.winners.length ? "Winning answers" : "No votes" })] }), _jsx("div", { className: "mt-4 grid gap-3 lg:grid-cols-2", children: summary.answers.length ? (summary.answers.map((answer) => {
                        const votesForAnswer = voteCounts.get(answer.id) ?? 0;
                        const isWinner = summary.winners.some((winner) => winner.id === answer.id);
                        const points = votesForAnswer * 100 + (isWinner ? 1000 : 0);
                        const percentage = maxGroupVotes
                            ? Math.round((votesForAnswer / maxGroupVotes) * 100)
                            : 0;
                        return (_jsxs("div", { className: `rounded-2xl p-4 ${isWinner
                                ? "bg-slate-200 text-slate-900"
                                : "bg-slate-100 text-slate-700"}`, children: [_jsx("p", { className: "text-lg font-semibold", children: answer.text }), _jsxs("div", { className: "mt-3 flex items-center gap-3", children: [_jsx("div", { className: "h-2 flex-1 rounded-full bg-slate-300", children: _jsx("div", { className: `h-full rounded-full ${isWinner ? "bg-amber-500" : "bg-slate-400"}`, style: { width: `${percentage}%` } }) }), _jsxs("span", { className: "text-sm font-semibold text-slate-900", children: ["+", points] })] })] }, answer.id));
                    })) : (_jsx("div", { className: "rounded-2xl bg-slate-100 p-4 text-sm text-slate-500", children: "No answers submitted for this group." })) })] }));
    }
    // Host variant (default)
    return (_jsxs("div", { className: `rounded-3xl bg-white p-5 shadow-inner ${className}`, children: [_jsxs("div", { className: "flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: ["Group ", summary.index + 1] }), _jsx("p", { className: "text-sm font-semibold text-slate-900", children: summary.group.prompt })] }), _jsx("div", { className: "text-xs font-semibold uppercase tracking-wide text-slate-500", children: summary.winners.length
                            ? "Winning answers"
                            : "No votes received" })] }), _jsx("ul", { className: "mt-4 space-y-2", children: summary.answers.length ? (summary.answers.map((answer) => {
                    const votesForAnswer = voteCounts.get(answer.id) ?? 0;
                    const percentage = maxGroupVotes
                        ? Math.round((votesForAnswer / maxGroupVotes) * 100)
                        : 0;
                    const isWinner = summary.winners.some((winner) => winner.id === answer.id);
                    return (_jsxs("li", { className: "rounded-2xl bg-slate-100 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("p", { className: "font-semibold text-slate-900", children: [answer.text, isWinner && (_jsx("span", { className: "ml-2 rounded-full bg-brand-primary px-2 py-0.5 text-xs font-semibold text-white", children: "Winner" }))] }), _jsxs("span", { className: "text-sm font-medium text-slate-600", children: [votesForAnswer, " vote", votesForAnswer === 1 ? "" : "s"] })] }), _jsx("div", { className: "mt-3 h-2 rounded-full bg-slate-200", children: _jsx("div", { className: `h-full rounded-full ${isWinner ? "bg-brand-primary" : "bg-slate-400"}`, style: { width: `${percentage}%` } }) })] }, answer.id));
                })) : (_jsx("li", { className: "rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500", children: "No answers submitted for this group." })) })] }));
}
//# sourceMappingURL=RoundSummaryCard.js.map