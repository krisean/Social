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
      primary: '#0f172a',
      secondary: '#64748b',
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
      gradient: 'radial-gradient(circle at 30% 30%, rgba(255,0,255,0.6), rgba(0,255,255,0.3) 50%, transparent 70%)',
      border: 'rgba(255,0,255,0.4)',
      shadow: '0 0 20px rgba(255,0,255,0.5)',
      innerShadow: 'inset 0 0 20px rgba(0,255,255,0.3), inset -8px -8px 15px rgba(138,43,226,0.4)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
    glass: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.7), rgba(26, 10, 26, 0.3))',
      border: 'rgba(255, 0, 255, 0.3)',
      shadow: '0 18px 40px rgba(255, 0, 255, 0.2)',
    },
    matte: {
      background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.9), rgba(26, 10, 26, 0.6))',
      border: 'rgba(0, 255, 255, 0.3)',
      shadow: 'inset 0 1px 1px rgba(138, 43, 226, 0.2), 0 10px 22px rgba(0, 0, 0, 0.6)',
    },
  },
};

// Explicit exports for better module resolution
export type { Theme, ThemeColors };

