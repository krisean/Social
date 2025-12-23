import { useEffect, useRef } from "react";
import { clsx } from "clsx";

interface BackgroundAnimationProps {
  show: boolean;
  className?: string;
}

export function BackgroundAnimation({ show, className }: BackgroundAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !containerRef.current) return;

    const container = containerRef.current;
    const bubbles: HTMLDivElement[] = [];

    const createBubble = () => {
      const bubble = document.createElement("div");
      bubble.className = "beer-bubble";

      const size = Math.random() * 10 + 2;
      bubble.style.width = bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;

      const duration = Math.random() * 14 + 8;
      const initialDelay = Math.random() * duration * -1.5;

      bubble.style.animation = `beer-rise ${duration}s linear infinite`;
      bubble.style.animationDelay = `${initialDelay}s`;

      container.appendChild(bubble);
      bubbles.push(bubble);
    };

    for (let i = 0; i < 50; i++) createBubble();

    return () => bubbles.forEach(b => b.remove());
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 1. Background — forced to paint FIRST */}
      <div
        className={clsx(
          "fixed inset-0 bg-gradient-to-r from-amber-600 via-orange-700 to-amber-900",
          className
        )}
        style={{ zIndex: 1 }}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-amber-200/40 to-transparent" />
      </div>

      {/* 2. Bubbles — rendered AFTER background, no chance of black flash */}
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Your exact original CSS — untouched */}
      <style>{`
        .beer-bubble {
          position: absolute;
          bottom: -100px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.3) 50%, transparent 70%);
          border: 1px solid rgba(255,255,255,0.3);
          box-shadow: 
            0 0 20px rgba(255,255,255,0.5),
            inset 0 0 20px rgba(255,255,255,0.4),
            inset -8px -8px 15px rgba(0,0,0,0.3);
          filter: blur(0.4px);
          will-change: transform, opacity;
        }

        @keyframes beer-rise {
          0%   { transform: translateY(0) translateX(0) scale(0.3); opacity: 0; }
          10%  { opacity: 0.9; }
          90%  { transform: translateY(-110vh) translateX(40px) rotate(15deg) scale(1.2); opacity: 0.8; }
          100% { transform: translateY(-130vh) translateX(50px) rotate(20deg) scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default BackgroundAnimation;
