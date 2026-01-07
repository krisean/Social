import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../providers/AuthContext";

export function RootLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen min-h-[100svh] bg-transparent text-slate-900">
      {/* Navbar - Fixed positioning, always visible */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Left: User Avatar */}
          <div className="flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-sm font-semibold">
              {user ? (
                user.isAnonymous ? (
                  // Guest mode icon
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-slate-600 dark:text-slate-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ) : (
                  // User initial from display name or username
                  <span className="text-slate-700 dark:text-slate-200">
                    {(user.displayName?.[0] || user.username?.[0] || "U").toUpperCase()}
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
                  className="w-4 h-4 text-slate-600 dark:text-slate-300"
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

          {/* Center: Logo - Positioned outside flex container to avoid transform stacking issues */}
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

      {/* Main content with top padding to account for fixed navbar */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}