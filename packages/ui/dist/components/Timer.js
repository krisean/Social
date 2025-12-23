import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCountdown } from "../shared/hooks/useCountdown";
import { clsx } from "clsx";
export function Timer({ endTime, label, size = "lg", variant = "dark", }) {
    const countdown = useCountdown(endTime);
    const secondsDisplay = Math.max(0, Math.ceil(countdown.milliseconds / 1000));
    return (_jsxs("div", { className: clsx("flex flex-col items-center justify-center rounded-3xl px-6 py-4 text-center shadow-inner transition-colors", variant === "dark"
            ? "bg-slate-900 text-white"
            : "bg-white text-slate-900", size === "sm" && "px-4 py-3 text-lg", size === "md" && "px-5 py-4 text-2xl", size === "lg" && "px-6 py-5 text-4xl"), role: "timer", "aria-live": "assertive", children: [label ? (_jsx("span", { className: "text-xs font-semibold uppercase tracking-wide opacity-70", children: label })) : null, _jsxs("span", { className: "font-black leading-none", children: [secondsDisplay, "s"] })] }));
}
export default Timer;
//# sourceMappingURL=Timer.js.map