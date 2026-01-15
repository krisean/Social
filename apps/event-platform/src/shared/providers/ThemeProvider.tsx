/**
 * Theme Context and Provider
 * Dark mode only - no theme switching
 */

import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { darkTheme } from '../theme';
import type { Theme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = darkTheme;
  const isDark = true;

  // Set dark theme on mount
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);

    // Set color-scheme for native browser elements
    root.style.colorScheme = 'dark';

    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

