import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../shared/providers/AuthContext";
import { useTheme } from "../shared/providers/ThemeProvider";

export function RootLayout() {
  const { user, isGuest } = useAuth();
  const { isDark } = useTheme();

  const [headerTransform, setHeaderTransform] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let ticking = false;
    let animationFrame: number;

    const handleScroll = () => {
      if (!ticking) {
        animationFrame = requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const direction = currentScrollY > lastScrollY ? 'down' : 'up';

          // Update scroll direction
          if (direction !== scrollDirection) {
            setScrollDirection(direction);
          }

          // Calculate transform based on scroll distance and direction
          let transform = 0;

          if (direction === 'down' && currentScrollY > 50) {
            // Hide header progressively when scrolling down, max hide at 100px scroll
            const hideProgress = Math.min((currentScrollY - 50) / 50, 1);
            transform = -100 * hideProgress; // Hide completely
          } else if (direction === 'up') {
            // Show header when scrolling up, with smooth easing
            const showProgress = Math.min(currentScrollY / 100, 1);
            transform = -100 * (1 - showProgress);
          }

          setHeaderTransform(transform);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Throttle scroll events for performance
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [lastScrollY, scrollDirection]);

  return (
    <div className="min-h-screen min-h-[100svh] bg-transparent text-slate-900">
      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out"
        style={{
          transform: `translateY(${headerTransform}px)`,
          willChange: 'transform'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - User Avatar */}
            <div className="flex-shrink-0">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${!isDark ? 'bg-slate-200' : 'bg-slate-700'}`}>
                {user ? (
                  isGuest ? (
                    // Guest mode icon
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className={`w-4 h-4 ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  ) : (
                    // User initial
                    <span className="text-slate-700 dark:text-slate-200">
                      {(user.user_metadata?.display_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </span>
                  )
                ) : (
                  // Not logged in - show guest icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-4 h-4 ${!isDark ? 'text-slate-600' : 'text-slate-300'}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Center - Logo */}
            <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
              <Link to="/" className="block transition-transform hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Söcial logo - Click to go home"
                  className="h-12 w-auto drop-shadow-lg cursor-pointer"
                  title="Click to go home"
                />
              </Link>
            </div>

            {/* Right side - Theme Toggle */}
            <div className="flex-shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with top padding to account for fixed navbar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
