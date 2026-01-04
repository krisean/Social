/**
 * Theme Context and Provider
 * Manages theme state and provides theme toggle functionality
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { lightTheme, darkTheme } from '../theme';
import type { Theme } from '../theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Load theme from localStorage or default to light
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('app-theme');
    return stored === 'dark' ? darkTheme : lightTheme;
  });

  const isDark = theme.name === 'dark';

  const toggleTheme = () => {
    setTheme((current) => {
      const newTheme = current.name === 'light' ? darkTheme : lightTheme;
      localStorage.setItem('app-theme', newTheme.name);
      return newTheme;
    });
  };

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);

    // Update color-scheme for native browser elements
    root.style.colorScheme = theme.name === 'dark' ? 'dark' : 'light';

    // Set data-theme attribute for CSS selectors
    root.setAttribute('data-theme', theme.name);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
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