import { useCountdown } from "../shared/hooks/useCountdown";
import { clsx } from "clsx";
import type { ReactNode } from "react";

interface TimerProps {
  endTime?: string;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  isDark?: boolean;
}

export function Timer({
  endTime,
  label,
  size = "lg",
  variant = "dark",
  isDark = false,
}: TimerProps) {
  const countdown = useCountdown(endTime);
  const secondsDisplay = Math.max(0, Math.ceil(countdown.milliseconds / 1000));

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center rounded-3xl px-6 py-4 text-center shadow-lg transition-colors",
        !isDark
          ? "bg-white text-slate-900 shadow-slate-300/40"
          : "bg-slate-800 text-white shadow-fuchsia-500/20",
        size === "sm" && "px-4 py-3 text-lg",
        size === "md" && "px-5 py-4 text-2xl",
        size === "lg" && "px-6 py-5 text-4xl",
      )}
      role="timer"
      aria-live="assertive"
    >
      {label ? (
        <span className={`text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-cyan-400'}`}>
          {label}
        </span>
      ) : null}
      <span className={`font-black leading-none ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>{secondsDisplay}s</span>
    </div>
  );
}

export default Timer;
