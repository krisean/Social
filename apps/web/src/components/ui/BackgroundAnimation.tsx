import { useEffect, useRef } from 'react'

interface BackgroundAnimationProps {
  show: boolean
  className?: string
}

// CSS-in-JS styles for background animation
const backgroundStyles = `
.background-animation-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
}

.beer-gradient {
  position: fixed;
  inset: 0;
  background: linear-gradient(90deg, var(--color-beer-gradient-from), var(--color-beer-gradient-via), var(--color-beer-gradient-to));
  animation: beer-drift 40s ease-in-out infinite alternate;
}

.beer-gradient::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 8rem;
  background: var(--color-foam-gradient);
}

.beer-bubble-layer {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.beer-bubble {
  position: absolute;
  bottom: -100px;
  border-radius: 50%;
  background: var(--color-bubble-gradient);
  border: 1px solid var(--color-bubble-border);
  box-shadow: var(--color-bubble-shadow), var(--color-bubble-inner-shadow);
  filter: blur(0.4px);
  will-change: transform, opacity;
}

@keyframes beer-rise {
  0%   { transform: translateY(0) translateX(0) scale(0.3); opacity: 0; }
  10%  { opacity: 0.9; }
  90%  { transform: translateY(-110vh) translateX(40px) rotate(15deg) scale(1.2); opacity: 0.8; }
  100% { transform: translateY(-130vh) translateX(50px) rotate(20deg) scale(1.3); opacity: 0; }
}

@keyframes beer-drift {
  0%   { transform: translate3d(0, 0, 0) scale(1); }
  50%  { transform: translate3d(-12px, -18px, 0) scale(1.03); }
  100% { transform: translate3d(8px, 10px, 0) scale(1.01); }
}
`

export default function BackgroundAnimation({ show, className }: BackgroundAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Inject styles on mount
  useEffect(() => {
    const styleId = 'background-animation-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      styleElement.textContent = backgroundStyles
      document.head.appendChild(styleElement)
    }

    return () => {
      // Keep styles for other instances, don't remove
    }
  }, [])

  useEffect(() => {
    if (!show || !containerRef.current) return

    const container = containerRef.current
    const bubbles: HTMLDivElement[] = []

    const createBubble = () => {
      const bubble = document.createElement('div')
      bubble.className = 'beer-bubble'

      const size = Math.random() * 10 + 2
      bubble.style.width = bubble.style.height = `${size}px`
      bubble.style.left = `${Math.random() * 100}%`

      const duration = Math.random() * 14 + 8
      const initialDelay = Math.random() * duration * -1.5

      bubble.style.animation = `beer-rise ${duration}s linear infinite`
      bubble.style.animationDelay = `${initialDelay}s`

      container.appendChild(bubble)
      bubbles.push(bubble)
    }

    for (let i = 0; i < 50; i++) createBubble()

    return () => {
      bubbles.forEach((b) => b.remove())
    }
  }, [show])

  if (!show) return null

  return (
    <div className={`background-animation-root ${className ?? ''}`}>
      {/* Beer gradient background */}
      <div className="beer-gradient" />

      {/* Bubble container */}
      <div ref={containerRef} className="beer-bubble-layer" />
    </div>
  )
}
