import { Timer } from "./Timer";
import { ProgressBar } from "./ProgressBar";

interface SessionTimerProps {
  endTime?: string;
  totalSeconds: number;
  paused?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  showProgressBar?: boolean;
  variant?: "brand" | "neutral";
  isDark?: boolean;
}

export function SessionTimer({
  endTime,
  totalSeconds,
  paused = false,
  label,
  size = "lg",
  showProgressBar = true,
  variant = "brand",
  isDark = false,
}: SessionTimerProps) {

  return (
    <div className="space-y-2">
      <Timer
        endTime={endTime}
        label={label}
        size={size}
        isDark={isDark}
        paused={paused}
      />
      {showProgressBar && (
        <ProgressBar
          endTime={endTime}
          totalSeconds={totalSeconds}
          variant={variant}
          isDark={isDark}
          paused={paused}
        />
      )}
    </div>
  );
}

export default SessionTimer;