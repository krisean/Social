import { useCountdown } from "../shared/hooks/useCountdown";
import { clsx } from "clsx";
import type { ReactNode } from "react";

interface TimerProps {
  endTime?: string;
  label?: ReactNode;
  size?: "sm" | "md" | "lg";
  isDark?: boolean;
  paused?: boolean;
}

export function Timer({
  endTime,
  label,
  size = "lg",
  isDark = false,
  paused = false,
}: TimerProps) {
  const countdown = useCountdown(paused ? undefined : endTime);
  const secondsDisplay = paused
    ? "Paused"
    : Math.max(0, Math.ceil(countdown.milliseconds / 1000));

  return (
    <div
      className={clsx(
        "timer-elevated flex flex-col items-center justify-center px-6 py-4 text-center transition-colors",
        size === "sm" && "px-4 py-3 text-lg",
        size === "md" && "px-5 py-4 text-2xl",
        size === "lg" && "px-6 py-5 text-4xl",
      )}
      role="timer"
      aria-live="assertive"
    >
      {label ? (
        <span className={`text-xs font-semibold uppercase tracking-wide ${!isDark ? 'text-slate-500' : 'text-cyan-300 neon-glow-cyan-light'}`}>
          {label}
        </span>
      ) : null}
      <span className={`font-black leading-none ${!isDark ? 'text-slate-900' : 'text-pink-400 pulse-neon'}`}>
        {typeof secondsDisplay === 'string' ? secondsDisplay : `${secondsDisplay}s`}
      </span>
    </div>
  );
}

export default Timer;
