/**
 * Theme Configuration
 * Centralized theming for light and dark modes
 */

// ==================== COLOR PALETTE ====================
// Light Mode Colors:
// - Primary: #10b981 (emerald-500)
// - Background: #d97706 → #ea580c → #92400e (amber-600 → orange-700 → amber-900) with #fef3c7 amber foam
// - Text: #0f172a (slate-900) hierarchy with #1e293b slate-800 headings
// - Cards: #f8fafc (slate-50) with amber accents (#fef3c7 selected, #f59e0b border)
// - Bubbles: White with glass effect
//
// Dark Mode Colors:
// - Primary: #ff00ff (true neon fuchsia/magenta)
// - Background: #0a0a0a → #1a0a1a → #0a0a1a with #e879f9 fuchsia foam
// - Text: #ffffff hierarchy with #f0abfc pink-400 headings and #a8dadc cyan-300 tertiary
// - Cards: #1e293b (slate-800) with purple/cyan accents
// - Bubbles: #ff00ff → #06b6d4 pink/cyan gradient
// ====================================================

export interface ThemeColors {
  // Basic colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    heading: string;
  };
  brand: {
    primary: string;
    dark: string;
    light: string;
    icon: string;
  };
  background: {
    primary: string;
    secondary: string;
  };
  accent: {
    primary: string;
    success: string;
  };
  
  // Elevated component styling
  elevated: {
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    shadowLight: string;
    shadowDark: string;
  };
  
  // Card styling
  card: {
    background: string;
    border: string;
    hover: string;
    selected: string;
    selectedBorder: string;
  };
  
  // Badge styling
  badge: {
    card1Background: string;
    card1Text: string;
    card2Background: string;
    card2Text: string;
  };
  
  // Button styling
  button: {
    ghostText: string;
    ghostHover: string;
    primary: string;
    danger: string;
    success: string;
  };
  
  // Pricing styling
  pricing: {
    amount: string;
  };
  
  // Hero styling
  hero: {
    background: string;
    border: string;
    shadow: string;
  };
  
  // Navigation styling
  navigation: {
    background: string;
    backdropFilter: string;
    borderBottom: string;
    zIndex: number;
  };
  
  // Theme toggle styling
  themeToggle: {
    padding: string;
    borderRadius: string;
    background: string;
    border: string;
    sunColor: string;
    moonColor: string;
  };
  
  // Player styling
  player: {
    background: string;
    border: string;
    progress: string;
  };
  
  // Glass panel styling
  glass: {
    background: string;
    border: string;
    shadow: string;
  };
  
  // Matte panel styling
  matte: {
    background: string;
    border: string;
    shadow: string;
  };
  
  // Background gradients
  backgroundGradient: {
    from: string;
    via: string;
    to: string;
  };
  
  // Bubble styling
  bubble: {
    gradient: string;
    border: string;
    shadow: string;
    innerShadow: string;
  };
  
  // Foam styling
  foam: string;
  
  // Beer gradient (for background animation)
  beerGradient: {
    from: string;
    via: string;
    to: string;
  };
  
  // Foam gradient (for beer gradient overlay)
  foamGradient: string;
  
  // Layout and spacing
  layout: {
    containerMaxWidth: string;
    containerWidth: string;
    navHeight: string;
    heroPaddingMobile: string;
    heroPaddingDesktop: string;
    sectionGap: string;
    cardPadding: string;
    buttonHeight: string;
    buttonHeightSmall: string;
  };
  
  // Typography
  typography: {
    fontFamily: string;
    fontSize: {
      headline: string;
      sub: string;
      sectionTitle: string;
      sectionSub: string;
      featureTitle: string;
      priceRole: string;
      priceAmount: string;
      finalTitle: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
      heavy: number;
      black: number;
    };
  };
  
  // Animation
  animation: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeInOut: string;
    };
  };
}

export interface Theme {
  name: 'light' | 'dark';
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    // Basic colors
    text: {
      primary: '#0f172a',      // slate-900
      secondary: '#64748b',    // slate-500
      tertiary: '#94a3b8',     // slate-400
      heading: '#1e293b',      // slate-800
    },
    brand: {
      primary: '#06b6d4',      // cyan-500
      dark: '#0891b2',         // cyan-600
      light: '#22d3ee',        // cyan-400
      icon: '#06b6d4',         // cyan-500
    },
    background: {
      primary: '#d97706',      // amber-600 (from gradient)
      secondary: '#ea580c',    // orange-700 (via gradient)
    },
    accent: {
      primary: '#10b981',      // emerald-500
      success: '#22c55e',      // green-500
    },
    
    // Elevated component styling
    elevated: {
      bgLight: '#f1f5f9',      // slate-100
      bgDark: 'rgba(6, 182, 212, 0.08)', // cyan-500/8
      borderLight: '#e2e8f0',   // slate-200
      borderDark: '#22d3ee',   // cyan-400
      shadowLight: 'rgba(15, 23, 42, 0.12)', // slate-900/12
      shadowDark: 'rgba(6, 182, 212, 0.08)', // cyan-500/8
    },
    
    // Card styling
    card: {
      background: '#f8fafc',   // slate-50
      border: '#e2e8f0',       // slate-200
      hover: '#f1f5f9',        // slate-100
      selected: '#fef3c7',     // amber-100
      selectedBorder: '#f59e0b', // amber-500
    },
    
    // Badge styling
    badge: {
      card1Background: '#dbeafe', // blue-100
      card1Text: '#1e40af',       // blue-800
      card2Background: '#e9d5ff', // purple-100
      card2Text: '#6b21a8',       // purple-800
    },
    
    // Button styling
    button: {
      ghostText: '#475569',    // slate-600
      ghostHover: '#334155',   // slate-700
      primary: '#10b981',      // emerald-500
      danger: '#ef4444',       // red-500
      success: '#22c55e',      // green-500
    },
    
    // Hero styling
    hero: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    
    // Navigation styling
    navigation: {
      background: 'var(--color-bg-primary)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-elevated-border-light)',
      zIndex: 10,
    },
    
    // Theme toggle styling
    themeToggle: {
      padding: '8px',
      borderRadius: '50%',
      background: 'transparent',
      border: 'none',
      sunColor: '#f59e0b',
      moonColor: '#64748b',
    },
    
    // Pricing styling
    pricing: {
      amount: '#ff00ff',       // fuchsia/magenta
    },
    
    // Player styling
    player: {
      background: '#1f2937',   // gray-800
      border: '#374151',       // gray-700
      progress: '#6b7280',      // gray-500
    },
    
    // Glass panel styling
    glass: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.02))',
      border: 'rgba(255, 255, 255, 0.25)',
      shadow: '0 18px 40px rgba(5, 7, 19, 0.45)',
    },
    
    // Matte panel styling
    matte: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.18))',
      border: 'rgba(255, 255, 255, 0.55)',
      shadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 10px 22px rgba(9, 9, 12, 0.18)',
    },
    
    // Background gradients
    backgroundGradient: {
      from: '#d97706',      // amber-600
      via: '#ea580c',       // orange-700
      to: '#92400e',        // amber-900
    },
    
    // Beer gradient (for background animation)
    beerGradient: {
      from: '#d97706',      // amber-600
      via: '#ea580c',       // orange-700
      to: '#92400e',        // amber-900
    },
    
    // Foam gradient (for beer gradient overlay)
    foamGradient: 'linear-gradient(to bottom, #fef3c7, transparent)', // amber-100
    
    // Bubble styling
    bubble: {
      gradient: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.3) 50%, transparent 70%)',
      border: 'rgba(255,255,255,0.3)',
      shadow: '0 0 20px rgba(255,255,255,0.5)',
      innerShadow: 'inset 0 0 20px rgba(255,255,255,0.4), inset -8px -8px 15px rgba(0,0,0,0.3)',
    },
    
    // Foam styling
    foam: '#fef3c7', // amber-100
    
    // Layout and spacing
    layout: {
      containerMaxWidth: '1200px',
      containerWidth: '92vw',
      navHeight: '68px',
      heroPaddingMobile: '48px 0 64px',
      heroPaddingDesktop: '84px 0 96px',
      sectionGap: '16px',
      cardPadding: '22px',
      buttonHeight: '48px',
      buttonHeightSmall: '40px',
    },
    
    // Typography
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
      fontSize: {
        headline: 'clamp(40px, 6vw, 68px)',
        sub: 'clamp(16px, 2vw, 20px)',
        sectionTitle: 'clamp(28px, 4.5vw, 42px)',
        sectionSub: '18px',
        featureTitle: '20px',
        priceRole: '22px',
        priceAmount: 'clamp(38px, 5.2vw, 56px)',
        finalTitle: 'clamp(28px, 4.8vw, 44px)',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
        heavy: 800,
        black: 900,
      },
    },
    
    // Animation
    animation: {
      duration: {
        fast: '0.15s',
        normal: '0.25s',
        slow: '0.4s',
      },
      easing: {
        ease: 'ease',
        easeInOut: 'ease-in-out',
      },
    },
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Basic colors
    text: {
      primary: '#ffffff',      // white
      secondary: '#e0e0e0',    // gray-300
      tertiary: '#67e8f9',     // warmer cyan-300 (harmonizes with fuchsia)
      heading: '#f0abfc',      // pink-400
    },
    brand: {
      primary: '#67e8f9',      // warmer cyan-300
      dark: '#06b6d4',         // cyan-500
      light: '#7dd3fc',        // cyan-200
      icon: '#67e8f9',         // warmer cyan-300
    },
    background: {
      primary: '#0a0a0a',      // very dark
      secondary: '#1a0a1a',       // dark with purple tint
    },
    accent: {
      primary: '#ff00ff',      // true neon fuchsia/magenta
      success: '#22c55e',      // green-500
    },
    
    // Elevated component styling
    elevated: {
      bgLight: '#f1f5f9',      // slate-100 (stays same)
      bgDark: '#1e293b',      // slate-800 (fully opaque)
      borderLight: '#e2e8f0',   // slate-200 (stays same)
      borderDark: '#475569',   // slate-600 (fully opaque)
      shadowLight: 'rgba(15, 23, 42, 0.12)', // slate-900/12 (stays same)
      shadowDark: 'rgba(6, 182, 212, 0.12)', // cyan-500/12
    },
    
    // Card styling
    card: {
      background: '#1e293b',   // slate-800
      border: '#475569',       // slate-600
      hover: '#334155',        // slate-700
      selected: 'rgba(255, 0, 255, 0.2)',  // fuchsia with 20% opacity
      selectedBorder: '#ff00ff', // true neon fuchsia
    },
    
    // Badge styling
    badge: {
      card1Background: '#dbeafe', // blue-100
      card1Text: '#1e40af',       // blue-800
      card2Background: '#e9d5ff', // purple-100
      card2Text: '#6b21a8',       // purple-800
    },
    
    // Button styling
    button: {
      ghostText: '#67e8f9',    // warmer cyan-300 (harmonizes with fuchsia)
      ghostHover: '#7dd3fc',   // even warmer cyan-200
      primary: '#ff00ff',      // true neon fuchsia/magenta
      danger: '#ef4444',       // red-500
      success: '#22c55e',      // green-500
    },
    
    // Hero styling
    hero: {
      background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.1), rgba(103, 232, 249, 0.05))',
      border: 'rgba(103, 232, 249, 0.3)',
      shadow: '0 8px 32px rgba(103, 232, 249, 0.2)',
    },
    
    // Navigation styling
    navigation: {
      background: 'var(--color-bg-primary)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-elevated-border-dark)',
      zIndex: 10,
    },
    
    // Theme toggle styling
    themeToggle: {
      padding: '8px',
      borderRadius: '50%',
      background: 'transparent',
      border: 'none',
      sunColor: '#f59e0b',
      moonColor: '#64748b',
    },
    
    // Pricing styling
    pricing: {
      amount: '#ff00ff',       // fuchsia/magenta
    },
    
    // Player styling
    player: {
      background: '#111827',   // gray-900
      border: '#374151',       // gray-700
      progress: '#6b7280',      // gray-500
    },
    
    // Glass panel styling
    glass: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85), rgba(26, 10, 26, 0.4))',
      border: 'rgba(255, 0, 255, 0.2)',
      shadow: '0 18px 40px rgba(255, 0, 255, 0.15)',
    },
    
    // Matte panel styling
    matte: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9), rgba(26, 10, 26, 0.6))',
      border: 'rgba(6, 182, 212, 0.3)',
      shadow: 'inset 0 1px 1px rgba(138, 43, 226, 0.2), 0 10px 22px rgba(0, 0, 0, 0.6)',
    },
    
    // Background gradients
    backgroundGradient: {
      from: '#0a0a0a',      // very dark
      via: '#1a0a1a',       // dark with purple tint
      to: '#0a0a1a',        // dark with blue tint
    },
    
    // Beer gradient (for background animation)
    beerGradient: {
      from: '#0a0a0a',      // very dark
      via: '#1a0a1a',       // dark with purple tint
      to: '#0a0a1a',        // dark with blue tint
    },
    
    // Foam gradient (for beer gradient overlay)
    foamGradient: 'linear-gradient(to bottom, rgba(240, 171, 252, 0.2), transparent)',
    
    // Bubble styling
    bubble: {
      gradient: 'radial-gradient(circle at 30% 30%, rgba(255,0,255,0.6), rgba(6,182,212,0.3) 50%, transparent 70%)',
      border: 'rgba(255,0,255,0.4)',
      shadow: '0 0 20px rgba(255,0,255,0.5)',
      innerShadow: 'inset 0 0 20px rgba(6,182,212,0.3), inset -8px -8px 15px rgba(138,43,226,0.4)',
    },
    
    // Foam styling
    foam: 'from-fuchsia-500/10',
    
    // Layout and spacing
    layout: {
      containerMaxWidth: '1200px',
      containerWidth: '92vw',
      navHeight: '68px',
      heroPaddingMobile: '48px 0 64px',
      heroPaddingDesktop: '84px 0 96px',
      sectionGap: '16px',
      cardPadding: '22px',
      buttonHeight: '48px',
      buttonHeightSmall: '40px',
    },
    
    // Typography
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
      fontSize: {
        headline: 'clamp(40px, 6vw, 68px)',
        sub: 'clamp(16px, 2vw, 20px)',
        sectionTitle: 'clamp(28px, 4.5vw, 42px)',
        sectionSub: '18px',
        featureTitle: '20px',
        priceRole: '22px',
        priceAmount: 'clamp(38px, 5.2vw, 56px)',
        finalTitle: 'clamp(28px, 4.8vw, 44px)',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        bold: 700,
        heavy: 800,
        black: 900,
      },
    },
    
    // Animation
    animation: {
      duration: {
        fast: '0.15s',
        normal: '0.25s',
        slow: '0.4s',
      },
      easing: {
        ease: 'ease',
        easeInOut: 'ease-in-out',
      },
    },
  },
};
