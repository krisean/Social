import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useTheme } from "../shared/providers/ThemeProvider";

interface BackgroundAnimationProps {
  show: boolean;
  className?: string;
}

export function BackgroundAnimation({ show, className }: BackgroundAnimationProps) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  // Scroll detection for animation modulation
  useEffect(() => {
    let scrollTimer: number;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  useEffect(() => {
    if (!show || !containerRef.current) return;

    const container = containerRef.current;
    const bubbles: HTMLDivElement[] = [];

    const createBubble = () => {
      const bubble = document.createElement("div");
      bubble.className = "beer-bubble";

      // Larger, softer bubbles (20-60px instead of 2-12px)
      const size = Math.random() * 40 + 20;
      bubble.style.width = bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;

      // Much slower animation (30-60 seconds instead of 8-22 seconds)
      const duration = Math.random() * 30 + 30;
      const initialDelay = Math.random() * duration * -0.5;

      bubble.style.animation = `beer-rise ${duration}s linear infinite`;
      bubble.style.animationDelay = `${initialDelay}s`;

      container.appendChild(bubble);
      bubbles.push(bubble);
    };

    // Fewer bubbles for subtlety (20 instead of 50)
    for (let i = 0; i < 20; i++) createBubble();

    return () => bubbles.forEach(b => b.remove());
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-300"
      style={{
        opacity: isScrolling ? 0.3 : 1, // Reduce opacity while scrolling
        zIndex: 1
      }}
    >
      {/* 1. Background — forced to paint FIRST */}
      <div
        className={clsx(
          "fixed inset-0 bg-gradient-to-r",
          theme.colors.background.gradient.from,
          theme.colors.background.gradient.via,
          theme.colors.background.gradient.to,
          className
        )}
        style={{ zIndex: 1 }}
      >
        <div className={clsx(
          "absolute inset-x-0 top-0 h-32 bg-gradient-to-b to-transparent",
          theme.colors.background.foam
        )} />
      </div>

      {/* 2. Bubbles — rendered AFTER background, no chance of black flash */}
      <div
        ref={containerRef}
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 2 }}
      />

      {/* Dynamic theme-aware CSS */}
      <style>{`
        .beer-bubble {
          position: absolute;
          bottom: -100px;
          border-radius: 50%;
          background: ${theme.colors.bubble.gradient};
          border: 1px solid ${theme.colors.bubble.border};
          box-shadow:
            ${theme.colors.bubble.shadow},
            ${theme.colors.bubble.innerShadow};
          filter: blur(1px); /* Softer blur */
          opacity: 0.4; /* Much more subtle */
          will-change: transform, opacity;
        }

        @keyframes beer-rise {
          0%   { transform: translateY(0) translateX(0) scale(0.1); opacity: 0; }
          10%  { opacity: 0.3; }
          90%  { transform: translateY(-120vh) translateX(20px) rotate(5deg) scale(1.0); opacity: 0.2; }
          100% { transform: translateY(-140vh) translateX(30px) rotate(8deg) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default BackgroundAnimation;