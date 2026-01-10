/**
 * Theme Configuration
 * Centralized theming for light and dark modes
 */

export interface ThemeColors {
  background: {
    gradient: {
      from: string;
      via: string;
      to: string;
    };
    foam: string;
  };
  bubble: {
    gradient: string;
    border: string;
    shadow: string;
    innerShadow: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    heading: string;
  };
  glass: {
    background: string;
    border: string;
    shadow: string;
  };
  matte: {
    background: string;
    border: string;
    shadow: string;
  };
  card: {
    background: string;
    border: string;
    hover: string;
    selected: string;
    selectedBorder: string;
  };
  badge: {
    card1Background: string;
    card1Text: string;
    card2Background: string;
    card2Text: string;
  };
  button: {
    ghostText: string;
    ghostHover: string;
  };
}

export interface Theme {
  name: 'light' | 'dark';
  colors: ThemeColors;
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: {
      gradient: {
        from: 'from-amber-600',
        via: 'via-orange-700',
        to: 'to-amber-900',
      },
      foam: 'from-amber-200/40',
    },
    bubble: {
      gradient: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(255,255,255,0.3) 50%, transparent 70%)',
      border: 'rgba(255,255,255,0.3)',
      shadow: '0 0 20px rgba(255,255,255,0.5)',
      innerShadow: 'inset 0 0 20px rgba(255,255,255,0.4), inset -8px -8px 15px rgba(0,0,0,0.3)',
    },
    text: {
      primary: '#0f172a',      // slate-900
      secondary: '#64748b',    // slate-500
      tertiary: '#94a3b8',     // slate-400
      heading: '#1e293b',      // slate-800
    },
    glass: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.05))',
      border: 'rgba(255, 255, 255, 0.35)',
      shadow: '0 18px 40px rgba(5, 7, 19, 0.35)',
    },
    matte: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.18))',
      border: 'rgba(255, 255, 255, 0.55)',
      shadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 10px 22px rgba(9, 9, 12, 0.18)',
    },
    card: {
      background: '#f8fafc',   // slate-50
      border: '#e2e8f0',       // slate-200
      hover: '#f1f5f9',        // slate-100
      selected: '#fef3c7',     // amber-100 (brand-light equivalent)
      selectedBorder: '#f59e0b', // amber-500 (brand-primary)
    },
    badge: {
      card1Background: '#dbeafe', // blue-100
      card1Text: '#1e40af',       // blue-800
      card2Background: '#e9d5ff', // purple-100
      card2Text: '#6b21a8',       // purple-800
    },
    button: {
      ghostText: '#475569',    // slate-600
      ghostHover: '#334155',   // slate-700
    },
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: {
      gradient: {
        from: 'from-[#0a0a0a]',
        via: 'via-[#1a0a1a]',
        to: 'to-[#0a0a1a]',
      },
      foam: 'from-fuchsia-500/10',
    },
    bubble: {
      gradient: 'radial-gradient(circle at 30% 30%, rgba(255,0,255,0.6), rgba(6,182,212,0.3) 50%, transparent 70%)',
      border: 'rgba(255,0,255,0.4)',
      shadow: '0 0 20px rgba(255,0,255,0.5)',
      innerShadow: 'inset 0 0 20px rgba(6,182,212,0.3), inset -8px -8px 15px rgba(138,43,226,0.4)',
    },
    text: {
      primary: '#ffffff',      // white
      secondary: '#e0e0e0',    // gray-300
      tertiary: '#a8dadc',     // cyan-300
      heading: '#f0abfc',      // pink-400
    },
    glass: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7), rgba(26, 10, 26, 0.3))',
      border: 'rgba(255, 0, 255, 0.3)',
      shadow: '0 18px 40px rgba(255, 0, 255, 0.2)',
    },
    matte: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9), rgba(26, 10, 26, 0.6))',
      border: 'rgba(6, 182, 212, 0.3)',
      shadow: 'inset 0 1px 1px rgba(138, 43, 226, 0.2), 0 10px 22px rgba(0, 0, 0, 0.6)',
    },
    card: {
      background: '#1e293b',   // slate-800
      border: '#475569',       // slate-600
      hover: '#334155',        // slate-700
      selected: '#fef3c7',     // amber-100 (brand-light equivalent)
      selectedBorder: '#f59e0b', // amber-500 (brand-primary)
    },
    badge: {
      card1Background: '#dbeafe', // blue-100
      card1Text: '#1e40af',       // blue-800
      card2Background: '#e9d5ff', // purple-100
      card2Text: '#6b21a8',       // purple-800
    },
    button: {
      ghostText: '#a8dadc',    // cyan-300
      ghostHover: '#67e8f9',   // cyan-300 lighter
    },
  },
};