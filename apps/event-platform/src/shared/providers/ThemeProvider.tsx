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
  // Load theme from localStorage or default to dark
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('app-theme');
    return stored === 'light' ? lightTheme : darkTheme;
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
    
    // Text colors
    root.style.setProperty('--color-text-primary', theme.colors.text.primary);
    root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary);
    root.style.setProperty('--color-text-heading', theme.colors.text.heading);
    
    // Card colors
    root.style.setProperty('--color-card-background', theme.colors.card.background);
    root.style.setProperty('--color-card-border', theme.colors.card.border);
    root.style.setProperty('--color-card-hover', theme.colors.card.hover);
    root.style.setProperty('--color-card-selected', theme.colors.card.selected);
    root.style.setProperty('--color-card-selected-border', theme.colors.card.selectedBorder);
    
    // Badge colors
    root.style.setProperty('--color-badge-card1-bg', theme.colors.badge.card1Background);
    root.style.setProperty('--color-badge-card1-text', theme.colors.badge.card1Text);
    root.style.setProperty('--color-badge-card2-bg', theme.colors.badge.card2Background);
    root.style.setProperty('--color-badge-card2-text', theme.colors.badge.card2Text);
    
    // Button colors
    root.style.setProperty('--color-button-ghost-text', theme.colors.button.ghostText);
    root.style.setProperty('--color-button-ghost-hover', theme.colors.button.ghostHover);

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

