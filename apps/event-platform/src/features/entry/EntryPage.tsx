import { Link } from "react-router-dom";
import { BackgroundAnimation } from "../../components/BackgroundAnimation";
import { Card } from "../../components/Card";
import { useAuth } from "../../shared/providers/AuthContext";
import { useTheme } from "../../shared/providers/ThemeProvider";

// ============================================================================
// BAR BRANDING CONFIGURATION
// ============================================================================
// Modify these values to customize the page for different bars
const barConfig = {
  // Bar Information
  name: "SÖCIAL",
  subtitle: "PUB",
  websiteUrl: "https://barscores.ca",
  websiteLabel: "Visit Söcial Website",
  
  // Logo Configuration
  logo: {
    primaryUrl: "/logo.png",
    fallbackUrl: "/logo.png",
    altText: "Söcial",
    height: "h-24", // Tailwind height class
    styles: {
      light: {
        background: "bg-amber-50",
        hoverBackground: "hover:bg-amber-100",
        shadow: "shadow-inner",
      },
      dark: {
        background: "bg-slate-700/80",
        hoverBackground: "hover:bg-slate-600/80",
        shadow: "shadow-inner shadow-cyan-500/20",
      },
    },
  },
  
  // Game Branding
  gameName: "Söcial Games",
  
  // Color Scheme
  colors: {
    // Background gradients (Tailwind classes)
    background: {
      from: "",
      via: "",
      to: "",
    },
    // Accent colors for decorative elements (full Tailwind classes)
    accent: {
      primary: "to-amber-500",
      primaryBg: "bg-amber-500",
      secondary: "bg-red-600/20",
      tertiary: "bg-amber-500/20",
    },
    // Text colors
    text: {
      primary: "text-slate-900",
      secondary: "text-slate-600",
      accent: "text-amber-600",
      accentLight: "text-amber-500",
      muted: "text-slate-500",
      mutedLight: "text-slate-400",
    },
    // Button colors
    buttons: {
      primary: {
        from: "from-red-700",
        via: "via-white-700",
        to: "to-amber-800",
        hoverFrom: "hover:from-amber-600",
        hoverTo: "hover:to-red-700",
        border: "border-red-600/50",
        shadow: "shadow-red-900/50",
        focus: "focus-visible:outline-amber-500",
      },
      secondary: {
        border: "border-amber-500",
        hoverBorder: "hover:border-amber-400",
        from: "from-amber-900/80",
        to: "to-amber-800/80",
        hoverFrom: "hover:from-amber-800",
        hoverTo: "hover:to-amber-700",
        text: "text-amber-100",
        shadow: "shadow-amber-900/20",
        focus: "focus-visible:outline-amber-500",
      },
      tertiary: {
        border: "border-amber-200",
        hoverBorder: "hover:border-amber-300",
        background: "bg-white",
        hoverBackground: "hover:bg-amber-50",
        text: "text-slate-800",
        focus: "focus-visible:outline-amber-500",
      },
      // Special game action buttons
      startGame: {
        light: {
          gradient: "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300",
          text: "text-slate-900",
          shadow: "shadow-xl shadow-amber-500/30",
          focus: "focus-visible:outline-amber-500",
          hover: "hover:from-amber-600 hover:via-amber-500 hover:to-yellow-400 hover:text-slate-800 hover:shadow-2xl hover:shadow-amber-500/50 hover:scale-[1.05]",
        },
        dark: {
          gradient: "bg-gradient-to-r from-cyan-500 via-cyan-400 to-teal-300",
          text: "text-slate-900",
          shadow: "shadow-xl shadow-cyan-500/30",
          focus: "focus-visible:outline-cyan-500",
          hover: "hover:from-cyan-600 hover:via-cyan-500 hover:to-teal-400 hover:text-slate-800 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-[1.05]",
        },
      },
      joinGame: {
        light: {
          gradient: "bg-gradient-to-r from-red-900 via-red-700 to-red-600",
          text: "text-white",
          shadow: "shadow-lg shadow-red-500/30",
          focus: "focus-visible:outline-amber-400",
          hover: "hover:bg-red-800 hover:text-yellow-300 hover:shadow-xl hover:shadow-red-500/50 hover:scale-[1.05]",
        },
        dark: {
          gradient: "bg-gradient-to-r from-pink-600 via-fuchsia-600 to-pink-500",
          text: "text-white",
          shadow: "shadow-lg shadow-pink-500/30",
          focus: "focus-visible:outline-pink-500",
          hover: "hover:from-pink-700 hover:via-fuchsia-700 hover:to-pink-600 hover:text-cyan-200 hover:shadow-xl hover:shadow-pink-500/50 hover:scale-[1.05]",
        },
      },
      auth: {
        light: {
          border: "border-amber-200",
          background: "bg-white",
          text: "text-slate-800",
          shadow: "shadow-lg shadow-amber-500/20",
          hoverBorder: "hover:border-amber-300",
          hoverBackground: "hover:bg-amber-50",
          hoverText: "hover:text-slate-900",
          hoverShadow: "hover:shadow-xl hover:shadow-amber-500/40",
          hoverScale: "hover:scale-[1.02]",
          focus: "focus-visible:outline-amber-400",
        },
        dark: {
          border: "border-cyan-400/50",
          background: "bg-slate-800/60",
          text: "text-cyan-100",
          shadow: "shadow-lg shadow-cyan-500/20",
          hoverBorder: "hover:border-cyan-300",
          hoverBackground: "hover:bg-slate-700/60",
          hoverText: "hover:text-white",
          hoverShadow: "hover:shadow-xl hover:shadow-cyan-500/40",
          hoverScale: "hover:scale-[1.02]",
          focus: "focus-visible:outline-cyan-400",
        },
      },
    },
    badge: {
      border: "border-amber-500/30",
      backgroundFrom: "from-red-900/40",
      backgroundTo: "to-amber-900/40",
      text: "text-amber-300",
    },
    decorativeOrbs: {
      primary: "bg-red-600/20",
      secondary: "bg-amber-500/20",
    },
    icons: {
      accent: "text-amber-500",
      hover: "hover:text-amber-400",
    },
  },
  
  content: {
    tagline: "Play with the bar, not just at the bar.",
    description: "Join live, crowd-powered games. Vote. Score. Win. Make friends.",
  },
  
  contact: {
    address: "123 Main St, Anytown, USA",
    phone: "(123) 456-7890",
  },
  
  buttons: {
    startGame: "Start a Game",
    joinGame: "Join a Game",
    createAccount: "Create Account",
    signIn: "Sign In / Sign Up",
  },
};

// ============================================================================

export function EntryPage() {
  const { isGuest } = useAuth();
  const { isDark } = useTheme();
  
  const bgGradient = `bg-gradient-to-r ${barConfig.colors.background.from} ${barConfig.colors.background.via} ${barConfig.colors.background.to}`;
  const showBackground = true;
  return (
    <>
      <BackgroundAnimation show={showBackground} />
      <main className={`relative min-h-screen px-4 py-10 sm:px-6 ${bgGradient}`}>
        <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6">
          <Card className="text-center space-y-4 backdrop-blur">
            <div className="mx-auto flex justify-center">
              <a
                href={barConfig.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex rounded-full p-4 transition ${!isDark ? barConfig.logo.styles.light.background : barConfig.logo.styles.dark.background} ${!isDark ? barConfig.logo.styles.light.shadow : barConfig.logo.styles.dark.shadow} ${!isDark ? barConfig.logo.styles.light.hoverBackground : barConfig.logo.styles.dark.hoverBackground}`}
                aria-label={barConfig.websiteLabel}
              >
                <img
                  src={barConfig.logo.primaryUrl}
                  alt={barConfig.logo.altText}
                  className="h-24 w-24 object-contain"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.style.display = "none";
                  }}
                />
              </a>
            </div>
            <div className="space-y-3">
              <span className={`text-xs font-semibold uppercase tracking-[0.5em] ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`}>
                {barConfig.subtitle}
              </span>
              <h1 className={`text-5xl font-black sm:text-6xl ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                {barConfig.name}
              </h1>
              <p className={`text-base sm:text-lg ${!isDark ? 'text-slate-600' : 'text-cyan-300'}`}>
                {barConfig.content.description}
              </p>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 space-y-6">
              <div className="space-y-2 text-center">
                <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`}>
                  {barConfig.content.tagline}
                </p>
                <h2 className={`text-3xl font-bold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                  {barConfig.gameName}
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  to="/host"
                  className={`group inline-flex items-center justify-center rounded-2xl px-6 py-4 text-lg font-semibold transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!isDark ? barConfig.colors.buttons.startGame.light.gradient : barConfig.colors.buttons.startGame.dark.gradient} ${!isDark ? barConfig.colors.buttons.startGame.light.text : barConfig.colors.buttons.startGame.dark.text} ${!isDark ? barConfig.colors.buttons.startGame.light.shadow : barConfig.colors.buttons.startGame.dark.shadow} ${!isDark ? barConfig.colors.buttons.startGame.light.focus : barConfig.colors.buttons.startGame.dark.focus} ${!isDark ? barConfig.colors.buttons.startGame.light.hover : barConfig.colors.buttons.startGame.dark.hover}`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {barConfig.buttons.startGame}
                  </span>
                </Link>
                <Link
                  to="/play"
                  className={`group inline-flex items-center justify-center rounded-2xl px-6 py-4 text-lg
                            font-semibold transition hover:scale-[1.02]
                            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                            ${!isDark ? barConfig.colors.buttons.joinGame.light.gradient : barConfig.colors.buttons.joinGame.dark.gradient} ${!isDark ? barConfig.colors.buttons.joinGame.light.text : barConfig.colors.buttons.joinGame.dark.text} ${!isDark ? barConfig.colors.buttons.joinGame.light.shadow : barConfig.colors.buttons.joinGame.dark.shadow} ${!isDark ? barConfig.colors.buttons.joinGame.light.focus : barConfig.colors.buttons.joinGame.dark.focus} ${!isDark ? barConfig.colors.buttons.joinGame.light.hover : barConfig.colors.buttons.joinGame.dark.hover}`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {barConfig.buttons.joinGame}
                  </span>
                </Link>
              </div>
            </Card>

            <Card className={`space-y-4 ${!isDark ? 'bg-amber-50/60' : 'bg-slate-800/60'}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${!isDark ? 'text-amber-600' : 'text-cyan-400'}`}>
                Account
              </p>
              <p className={`text-base font-semibold ${!isDark ? 'text-slate-900' : 'text-pink-400'}`}>
                {isGuest ? "Join the community to unlock full access." : "Jump back in and manage your games."}
              </p>
              <Link
                to="/auth"
                className={`inline-flex w-full items-center justify-center rounded-2xl px-6 py-3 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${!isDark ? barConfig.colors.buttons.auth.light.border : barConfig.colors.buttons.auth.dark.border} ${!isDark ? barConfig.colors.buttons.auth.light.background : barConfig.colors.buttons.auth.dark.background} ${!isDark ? barConfig.colors.buttons.auth.light.text : barConfig.colors.buttons.auth.dark.text} ${!isDark ? barConfig.colors.buttons.auth.light.shadow : barConfig.colors.buttons.auth.dark.shadow} ${!isDark ? barConfig.colors.buttons.auth.light.hoverBorder : barConfig.colors.buttons.auth.dark.hoverBorder} ${!isDark ? barConfig.colors.buttons.auth.light.hoverBackground : barConfig.colors.buttons.auth.dark.hoverBackground} ${!isDark ? barConfig.colors.buttons.auth.light.hoverText : barConfig.colors.buttons.auth.dark.hoverText} ${!isDark ? barConfig.colors.buttons.auth.light.hoverShadow : barConfig.colors.buttons.auth.dark.hoverShadow} ${!isDark ? barConfig.colors.buttons.auth.light.hoverScale : barConfig.colors.buttons.auth.dark.hoverScale} ${!isDark ? barConfig.colors.buttons.auth.light.focus : barConfig.colors.buttons.auth.dark.focus}`}
              >
                {isGuest ? barConfig.buttons.createAccount : barConfig.buttons.signIn}
              </Link>
            </Card>
          </div>

          <Card className="space-y-6">
            <div className="flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <svg className={`h-5 w-5 ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{barConfig.contact.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className={`h-5 w-5 ${!isDark ? 'text-amber-500' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{barConfig.contact.phone}</span>
                </div>
              </div>
              <a href="#" className="text-sm font-semibold text-amber-600 transition hover:text-amber-500">
                Privacy
              </a>
            </div>
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
              <span>Powered by</span>
              <img src="/logo.png" alt="Söcial" className="h-4 w-auto opacity-80" />
              <span className="font-semibold text-slate-600">Söcial</span>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}

export default EntryPage;
