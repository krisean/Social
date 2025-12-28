import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
// import { UserProfile } from "../components/UserProfile";
// import { useAuth } from "../shared/providers/AuthContext";

export function RootLayout() {
  // const { user } = useAuth();

  return (
    <div className="min-h-screen min-h-[100svh] bg-transparent text-slate-900">
      <div className="pointer-events-auto fixed left-4 top-4 z-50">
        <Link to="/" className="block transition-transform hover:scale-105">
          <img
            src="/logo.png"
            alt="Söcial logo - Click to go home"
            className="h-16 w-auto drop-shadow-lg cursor-pointer"
            title="Click to go home"
          />
        </Link>
      </div>
      
      <ThemeToggle />
      
      {/* {user && <UserProfile />} */}

      <Outlet />
    </div>
  );
}
