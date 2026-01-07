import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../shared/providers/AuthContext";
import { useTheme } from "../shared/providers/ThemeProvider";
import { useState, useEffect, useRef } from "react";

export function RootLayout() {
  // Safely use hooks with error handling
  let user, isGuest, isDark;
  try {
    const authData = useAuth();
    user = authData?.user;
    isGuest = authData?.isGuest;
  } catch (error) {
    console.warn('Auth hook error:', error);
    user = null;
    isGuest = false;
  }

  try {
    const themeData = useTheme();
    isDark = themeData?.isDark ?? false;
  } catch (error) {
    console.warn('Theme hook error:', error);
    isDark = false;
  }

  // Mobile scroll behavior - hide/show navbar
  const [isMobile, setIsMobile] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return; // Only run on mobile

    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 50) {
        setNavbarHidden(false); // Always show at top
      } else if (currentScrollY > lastScrollY + 10) {
        setNavbarHidden(true); // Scrolling down
      } else if (currentScrollY < lastScrollY - 10) {
        setNavbarHidden(false); // Scrolling up
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);


  return (
    <div className="min-h-screen min-h-[100svh] bg-transparent text-slate-900">
      {/* Navbar - Fixed positioning, hides on mobile scroll */}
      <nav className={`
        fixed top-0 left-0 right-0 z-50 h-16
        transition-transform duration-200 will-change-transform
        ${isMobile && navbarHidden ? '-translate-y-full' : 'translate-y-0'}
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Left: User Avatar */}
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

          {/* Center: Logo - absolute left-1/2 -translate-x-1/2 top-0 outside any parent with transform */}
          <div className="absolute left-1/2 top-0 h-16 flex items-center -translate-x-1/2">
            <Link to="/" className="block transition-transform hover:scale-105">
              <img
                src="/logo.png"
                alt="Söcial logo - Click to go home"
                className="h-12 w-auto drop-shadow-lg cursor-pointer"
                title="Click to go home"
              />
            </Link>
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content with padding-top = navbar height */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
